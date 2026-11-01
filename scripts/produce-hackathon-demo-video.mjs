import { spawn, execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const FFMPEG = 'C:\\Users\\kiran\\AppData\\Roaming\\Python\\Python314\\site-packages\\imageio_ffmpeg\\binaries\\ffmpeg-win-x86_64-v7.1.exe';
const BASE_URL = 'http://localhost:3000';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const OUT_DIR = path.resolve('hackathon-demo-video');
const AUDIO_DIR = path.join(OUT_DIR, 'audio');
const SCENES_DIR = path.join(OUT_DIR, 'scenes');
const ASSETS_DIR = path.join(OUT_DIR, 'demo-assets');
const FALLBACK_DIR = path.join(OUT_DIR, 'demo-fallback');

for (const d of [OUT_DIR, SCENES_DIR, ASSETS_DIR, FALLBACK_DIR]) {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
}

async function wait(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function getAudioDuration(filePath) {
  try {
    execSync(`"${FFMPEG}" -i "${filePath}"`, { stdio: ['pipe', 'pipe', 'pipe'] });
  } catch (err) {
    const out = err.stderr ? err.stderr.toString() : err.message;
    const match = out.match(/Duration: (\d+):(\d+):([\d.]+)/);
    if (match) {
      return parseInt(match[1]) * 3600 + parseInt(match[2]) * 60 + parseFloat(match[3]);
    }
  }
  return 30.0;
}

class ChromeRecorder {
  constructor(port = 9226) {
    this.port = port;
    this.tempProfile = path.join(process.env.TEMP || 'C:\\Temp', `chrome-rec-${Date.now()}`);
    this.chromeProc = null;
    this.ws = null;
    this.msgId = 1;
    this.pending = new Map();
    this.frames = [];
    this.isRecording = false;
  }

  async launch() {
    console.log(`[Chrome] Launching Headless Chrome at 1920x1080 (Port ${this.port})...`);
    this.chromeProc = spawn(
      CHROME_PATH,
      [
        '--headless=new',
        `--remote-debugging-port=${this.port}`,
        `--user-data-dir=${this.tempProfile}`,
        '--no-sandbox',
        '--disable-gpu',
        '--window-size=1920,1080',
        '--hide-scrollbars',
      ],
      { stdio: 'ignore' }
    );

    let versionInfo = null;
    for (let i = 0; i < 40; i++) {
      await wait(250);
      try {
        const res = await fetch(`http://127.0.0.1:${this.port}/json/version`);
        if (res.ok) {
          versionInfo = await res.json();
          break;
        }
      } catch {}
    }

    if (!versionInfo) {
      throw new Error('Failed to connect to Chrome remote debugging port.');
    }

    const newPageRes = await fetch(`http://127.0.0.1:${this.port}/json/new?${BASE_URL}`, {
      method: 'PUT',
    });
    const pageInfo = await newPageRes.json();
    this.ws = new WebSocket(pageInfo.webSocketDebuggerUrl);

    this.ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.method === 'Page.screencastFrame') {
        if (this.isRecording) {
          this.frames.push({
            data: msg.params.data,
            timestamp: msg.params.metadata.timestamp || (Date.now() / 1000),
          });
        }
        // Acknowledge frame
        const ack = JSON.stringify({
          id: this.msgId++,
          method: 'Page.screencastFrameAck',
          params: { sessionId: msg.params.sessionId },
        });
        this.ws.send(ack);
      } else if (msg.id && this.pending.has(msg.id)) {
        const resolve = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        resolve(msg);
      }
    };

    await new Promise((r) => (this.ws.onopen = r));
    await this.send('Page.enable');
    await this.send('Runtime.enable');
    await this.send('Emulation.setDeviceMetricsOverride', {
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
      mobile: false,
    });
    console.log('[Chrome] Connected and viewport configured to 1920x1080.');
  }

  send(method, params = {}) {
    return new Promise((resolve) => {
      const id = this.msgId++;
      this.pending.set(id, resolve);
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async eval(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    return res.result?.result?.value;
  }

  async navigate(url) {
    await this.send('Page.navigate', { url });
    await wait(1800);
  }

  startCapture() {
    this.frames = [];
    this.isRecording = true;
    return this.send('Page.startScreencast', {
      format: 'jpeg',
      quality: 88,
      maxWidth: 1920,
      maxHeight: 1080,
      everyNthFrame: 1,
    });
  }

  async stopCapture() {
    this.isRecording = false;
    await this.send('Page.stopScreencast');
    return this.frames;
  }

  async singleFrame() {
    const res = await this.send('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
    return res.result?.data;
  }

  async smoothScroll(targetY, durationMs = 1200, steps = 15) {
    const currentY = (await this.eval('window.scrollY')) || 0;
    const diff = targetY - currentY;
    const stepTime = durationMs / steps;
    for (let i = 1; i <= steps; i++) {
      const ease = i / steps;
      const y = Math.round(currentY + diff * ease);
      await this.eval(`window.scrollTo({ top: ${y}, behavior: 'instant' });`);
      await wait(stepTime);
    }
  }

  close() {
    try {
      if (this.ws) this.ws.close();
      if (this.chromeProc) this.chromeProc.kill();
    } catch {}
  }
}

// Convert captured frames + audio into a synchronized MP4 clip
async function compileSceneVideo({ sceneDir, frames, targetDuration, audioFile, outputFile }) {
  console.log(`[Compile] Processing scene video: target=${targetDuration.toFixed(2)}s, captured frames=${frames.length}...`);

  if (!fs.existsSync(sceneDir)) fs.mkdirSync(sceneDir, { recursive: true });

  // If no screencast frames were captured, capture fallback
  if (frames.length === 0) {
    throw new Error('No frames captured for scene.');
  }

  // Deduplicate and calculate durations for each frame
  const t0 = frames[0].timestamp;
  const processedFrames = [];

  for (let i = 0; i < frames.length; i++) {
    const frame = frames[i];
    const frameTime = Math.max(0, frame.timestamp - t0);
    const nextTime = i < frames.length - 1 ? Math.max(frameTime, frames[i + 1].timestamp - t0) : targetDuration;
    let dur = nextTime - frameTime;
    if (dur <= 0) dur = 0.033; // ~30fps minimum duration

    const filename = `frame_${String(i).padStart(5, '0')}.jpg`;
    const filePath = path.join(sceneDir, filename);
    fs.writeFileSync(filePath, Buffer.from(frame.data, 'base64'));

    processedFrames.push({
      filename,
      duration: dur,
    });
  }

  // Normalize durations so the sum equals targetDuration
  let totalCalculated = processedFrames.reduce((sum, f) => sum + f.duration, 0);
  if (totalCalculated < targetDuration) {
    // Add remaining time to the last frame to hold
    processedFrames[processedFrames.length - 1].duration += (targetDuration - totalCalculated);
  } else if (totalCalculated > targetDuration && processedFrames.length > 1) {
    const ratio = targetDuration / totalCalculated;
    processedFrames.forEach((f) => (f.duration *= ratio));
  }

  // Build concat file
  let concatLines = ['ffconcat version 1.0'];
  for (const f of processedFrames) {
    concatLines.push(`file ${f.filename}`);
    concatLines.push(`duration ${f.duration.toFixed(4)}`);
  }
  // Repeat last frame per ffconcat specification
  concatLines.push(`file ${processedFrames[processedFrames.length - 1].filename}`);

  const concatPath = path.join(sceneDir, 'concat.txt');
  fs.writeFileSync(concatPath, concatLines.join('\n'));

  // Encode with FFmpeg
  // Video filter: force 30fps CFR, 1920x1080, yuv420p
  // Audio: copy/transcode to aac 192k stereo
  const cmd = `"${FFMPEG}" -y -f concat -safe 0 -i "${concatPath}" -i "${audioFile}" -vf "fps=30,scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,format=yuv420p" -c:v libx264 -preset fast -crf 20 -c:a aac -b:a 192k -ar 44100 -shortest "${outputFile}"`;

  execSync(cmd, { stdio: 'ignore' });
  const stat = fs.statSync(outputFile);
  console.log(`[Compile] ✓ Generated: ${outputFile} (${(stat.size / 1024 / 1024).toFixed(2)} MB)`);
}

async function main() {
  console.log('================================================================');
  console.log('   VELMORA SPARK — AUTONOMOUS 3-MINUTE HACKATHON VIDEO PRODUCTION');
  console.log('================================================================\n');

  const recorder = new ChromeRecorder(9226);
  await recorder.launch();

  const sceneOutputs = [];

  try {
    // ─────────────────────────────────────────────────────────────────────────
    // SCENE 1: Royal Curtain Reveal & Planner Hero
    // ─────────────────────────────────────────────────────────────────────────
    console.log('\n--- SCENE 1: Royal Curtain Reveal & Planner Hero ---');
    const audio1 = path.join(AUDIO_DIR, 'scene1_narration.mp3');
    const dur1 = getAudioDuration(audio1);
    console.log(`Scene 1 Audio Duration: ${dur1.toFixed(2)}s`);

    // Reset curtain state to closed
    await recorder.navigate(BASE_URL);
    await recorder.eval(`
      sessionStorage.removeItem('velmora_curtain_seen_v3');
      sessionStorage.removeItem('velmora_curtain_seen');
      sessionStorage.removeItem('velmora_curtain_dismissed');
    `);
    await recorder.send('Page.reload');
    await wait(1800);

    // Start screencast
    await recorder.startCapture();
    console.log('  Recording curtain closed...');
    await wait(3000);

    // Click curtain enter button
    console.log('  Triggering curtain opening...');
    await recorder.eval(`
      (() => {
        const btn = document.querySelector('button[aria-label="Enter Celebration Operations"]') || 
                    document.querySelector('.curtain-enter-btn') || 
                    Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Enter') || b.textContent.includes('Explore'));
        if (btn) btn.click();
      })()
    `);
    await wait(5000); // Wait for realistic curtain folds to part

    // Camera lingers on 3D festive miniature scene & diorama
    console.log('  Showcasing 3D miniature palace pavilion & diyas...');
    await wait(8000);

    // Settle down to workspace stats
    await recorder.smoothScroll(180, 2000, 20);
    const remainingTime1 = dur1 - 18.0;
    if (remainingTime1 > 0) await wait(remainingTime1 * 1000);

    const frames1 = await recorder.stopCapture();
    const scene1Mp4 = path.join(SCENES_DIR, 'scene1.mp4');
    await compileSceneVideo({
      sceneDir: path.join(SCENES_DIR, 'scene1_frames'),
      frames: frames1,
      targetDuration: dur1,
      audioFile: audio1,
      outputFile: scene1Mp4,
    });
    sceneOutputs.push(scene1Mp4);

    // ─────────────────────────────────────────────────────────────────────────
    // SCENE 2: Planner Overview & Celebration Styles
    // ─────────────────────────────────────────────────────────────────────────
    console.log('\n--- SCENE 2: Planner Overview & Celebration Styles ---');
    const audio2 = path.join(AUDIO_DIR, 'scene2_narration.mp3');
    const dur2 = getAudioDuration(audio2);
    console.log(`Scene 2 Audio Duration: ${dur2.toFixed(2)}s`);

    await recorder.startCapture();

    // Smooth scroll down to Celebration Styles section
    console.log('  Scrolling to Celebration Styles...');
    await recorder.smoothScroll(620, 3000, 25);
    await wait(2500);

    // Hover / focus across the styles
    console.log('  Hovering celebration style cards...');
    await recorder.eval(`
      (() => {
        const cards = document.querySelectorAll('[data-testid="plan-style-card"], .plan-style-card, div[role="button"]');
        if (cards.length > 1) cards[1].scrollIntoView({ behavior: 'smooth', block: 'center' });
      })()
    `);
    await wait(4000);

    // Scroll further down to Vendor Recommendations & AI negotiation tips
    console.log('  Scrolling to AI Vendor Negotiation Tips...');
    await recorder.smoothScroll(1150, 3000, 25);
    await wait(6000);

    // Highlight trade-off and negotiation advice
    await recorder.smoothScroll(1450, 2500, 20);
    const remainingTime2 = dur2 - 21.0;
    if (remainingTime2 > 0) await wait(remainingTime2 * 1000);

    const frames2 = await recorder.stopCapture();
    const scene2Mp4 = path.join(SCENES_DIR, 'scene2.mp4');
    await compileSceneVideo({
      sceneDir: path.join(SCENES_DIR, 'scene2_frames'),
      frames: frames2,
      targetDuration: dur2,
      audioFile: audio2,
      outputFile: scene2Mp4,
    });
    sceneOutputs.push(scene2Mp4);

    // ─────────────────────────────────────────────────────────────────────────
    // SCENE 3: Financial Intelligence & Stress Simulator
    // ─────────────────────────────────────────────────────────────────────────
    console.log('\n--- SCENE 3: Financial Intelligence & Stress Simulator ---');
    const audio3 = path.join(AUDIO_DIR, 'scene3_narration.mp3');
    const dur3 = getAudioDuration(audio3);
    console.log(`Scene 3 Audio Duration: ${dur3.toFixed(2)}s`);

    // Scroll back to top
    await recorder.eval('window.scrollTo(0, 0);');
    await wait(800);

    await recorder.startCapture();

    // Click "Budget & Plate Math" tab
    console.log('  Navigating to Budget & Plate Math tab...');
    await recorder.eval(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const budgetBtn = btns.find(b => b.textContent.includes('Budget & Plate Math') || b.textContent.includes('Budget'));
        if (budgetBtn) budgetBtn.click();
      })()
    `);
    await wait(4500);

    // Scroll smoothly through the Budget breakdown and plate math
    await recorder.smoothScroll(350, 2000, 15);
    await wait(4000);

    // Scroll up and switch to "Stress-Test Radar" tab
    await recorder.eval('window.scrollTo(0, 0);');
    await wait(800);
    console.log('  Switching to Stress-Test Radar...');
    await recorder.eval(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const stressBtn = btns.find(b => b.textContent.includes('Stress-Test Radar') || b.textContent.includes('Stress'));
        if (stressBtn) stressBtn.click();
      })()
    `);
    await wait(3500);

    // Activate the "+20% Guest Surge at Gate" disruption scenario
    console.log('  Activating "+20% Guest Surge at Gate" scenario...');
    await recorder.eval(`
      (() => {
        const buttons = Array.from(document.querySelectorAll('button, div[role="button"]'));
        const surgeBtn = buttons.find(b => b.textContent.includes('20% Guest Surge') || b.textContent.includes('Surge') || b.textContent.includes('Guest Surge'));
        if (surgeBtn) surgeBtn.click();
      })()
    `);
    await wait(3500);

    // Scroll down to display the cascade impact, caterer slab shift, and recovery checklist
    await recorder.smoothScroll(400, 2000, 15);
    const remainingTime3 = dur3 - 19.1;
    if (remainingTime3 > 0) await wait(remainingTime3 * 1000);

    const frames3 = await recorder.stopCapture();
    const scene3Mp4 = path.join(SCENES_DIR, 'scene3.mp4');
    await compileSceneVideo({
      sceneDir: path.join(SCENES_DIR, 'scene3_frames'),
      frames: frames3,
      targetDuration: dur3,
      audioFile: audio3,
      outputFile: scene3Mp4,
    });
    sceneOutputs.push(scene3Mp4);

    // ─────────────────────────────────────────────────────────────────────────
    // SCENE 4: Multilingual Guest Portal & RSVP Analytics
    // ─────────────────────────────────────────────────────────────────────────
    console.log('\n--- SCENE 4: Multilingual Guest Portal & RSVP Analytics ---');
    const audio4 = path.join(AUDIO_DIR, 'scene4_narration.mp3');
    const dur4 = getAudioDuration(audio4);
    console.log(`Scene 4 Audio Duration: ${dur4.toFixed(2)}s`);

    // Navigate to public invitation page
    await recorder.navigate(`${BASE_URL}/invite/wedding-blr-2025`);
    await wait(2000);

    await recorder.startCapture();

    // Show English invitation
    await wait(2500);

    // Toggle Hindi
    console.log('  Toggling language to Hindi...');
    await recorder.eval(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const hiBtn = btns.find(b => b.textContent.trim() === 'हिन्दी');
        if (hiBtn) hiBtn.click();
      })()
    `);
    await wait(3000);

    // Toggle Kannada
    console.log('  Toggling language to Kannada...');
    await recorder.eval(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const knBtn = btns.find(b => b.textContent.trim() === 'ಕನ್ನಡ');
        if (knBtn) knBtn.click();
      })()
    `);
    await wait(3000);

    // Toggle back to English
    console.log('  Toggling language back to English...');
    await recorder.eval(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const enBtn = btns.find(b => b.textContent.trim() === 'English');
        if (enBtn) enBtn.click();
      })()
    `);
    await wait(1500);

    // Scroll to RSVP form
    console.log('  Filling RSVP form...');
    await recorder.smoothScroll(500, 1500, 15);
    await wait(1000);

    // Select Attending, party size, Jain, Wheelchair
    await recorder.eval(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const acceptBtn = btns.find(b => b.textContent.includes('Accept'));
        if (acceptBtn) acceptBtn.click();

        const nameInput = document.querySelector('input[placeholder*="Sharma"], input[type="text"]');
        if (nameInput) {
          nameInput.value = 'Rajesh & Suneetha Sharma';
          nameInput.dispatchEvent(new Event('input', { bubbles: true }));
        }

        const jainBtn = btns.find(b => b.textContent.includes('Jain'));
        if (jainBtn) jainBtn.click();

        const rampBtn = btns.find(b => b.textContent.includes('Wheelchair') || b.textContent.includes('Step-Free'));
        if (rampBtn) rampBtn.click();
      })()
    `);
    await wait(2500);

    // Submit RSVP
    await recorder.eval(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const submitBtn = btns.find(b => b.textContent.includes('Confirm My RSVP'));
        if (submitBtn) submitBtn.click();
      })()
    `);
    await wait(3500); // Show confirmation banner

    // Return to Organizer Dashboard -> RSVPs & Dietary tab
    console.log('  Returning to Organizer Dashboard -> RSVPs & Dietary tab...');
    await recorder.navigate(BASE_URL);
    await wait(1500);
    await recorder.eval(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const rsvpBtn = btns.find(b => b.textContent.includes('RSVPs & Dietary') || b.textContent.includes('RSVP'));
        if (rsvpBtn) rsvpBtn.click();
      })()
    `);
    await wait(2500);
    await recorder.smoothScroll(300, 1500, 15);
    const remainingTime4 = dur4 - 24.0;
    if (remainingTime4 > 0) await wait(remainingTime4 * 1000);

    const frames4 = await recorder.stopCapture();
    const scene4Mp4 = path.join(SCENES_DIR, 'scene4.mp4');
    await compileSceneVideo({
      sceneDir: path.join(SCENES_DIR, 'scene4_frames'),
      frames: frames4,
      targetDuration: dur4,
      audioFile: audio4,
      outputFile: scene4Mp4,
    });
    sceneOutputs.push(scene4Mp4);

    // ─────────────────────────────────────────────────────────────────────────
    // SCENE 5: AI Concierge Co-Pilot & WhatsApp Card
    // ─────────────────────────────────────────────────────────────────────────
    console.log('\n--- SCENE 5: AI Concierge Co-Pilot & WhatsApp Card ---');
    const audio5 = path.join(AUDIO_DIR, 'scene5_narration.mp3');
    const dur5 = getAudioDuration(audio5);
    console.log(`Scene 5 Audio Duration: ${dur5.toFixed(2)}s`);

    await recorder.eval('window.scrollTo(0, 0);');
    await wait(800);

    await recorder.startCapture();

    // Open AI Concierge Drawer
    console.log('  Opening AI Concierge Drawer...');
    await recorder.eval(`
      (() => {
        const openBtn = document.querySelector('#open-ai-chat-btn') || 
                        Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('AI Concierge'));
        if (openBtn) openBtn.click();
      })()
    `);
    await wait(2500);

    // Click quick prompt "Any vendor delays or risks?"
    console.log('  Submitting AI prompt: "Any vendor delays or risks?"...');
    await recorder.eval(`
      (() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const promptBtn = buttons.find(b => b.textContent.includes('Any vendor delays or risks?'));
        if (promptBtn) promptBtn.click();
      })()
    `);
    await wait(4500); // Allow grounded response to display with Demo Grounded badge

    // Close AI drawer cleanly
    console.log('  Closing AI Concierge Drawer...');
    await recorder.eval(`
      (() => {
        const closeBtn = document.querySelector('button[aria-label="Close drawer"]') ||
                         document.querySelector('#close-ai-chat-btn') ||
                         Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('✕') || b.textContent.includes('Close'));
        if (closeBtn) closeBtn.click();
      })()
    `);
    await wait(1800);

    // Open WhatsApp Share Card Modal
    console.log('  Opening WhatsApp Broadcast Card Modal...');
    await recorder.eval(`
      (() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const waBtn = buttons.find(b => b.textContent.includes('WhatsApp Broadcast Draft') || b.textContent.includes('Broadcast') || b.textContent.includes('Share'));
        if (waBtn) waBtn.click();
      })()
    `);
    await wait(3000);

    // Cycle through 4 visual card templates
    console.log('  Cycling through 4 card templates...');
    const templateIds = ['royal', 'fest', 'jubilee', 'temple'];
    for (const tid of templateIds) {
      await recorder.eval(`
        (() => {
          const btn = document.querySelector('button[data-template="${tid}"]') ||
                      Array.from(document.querySelectorAll('button')).find(b => b.textContent.toLowerCase().includes('${tid}'));
          if (btn) btn.click();
        })()
      `);
      await wait(1500);
    }

    // Click copy message action
    await recorder.eval(`
      (() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Copy Broadcast Message'));
        if (btn) btn.click();
      })()
    `);
    await wait(1500);

    // Close modal cleanly using top-right cross button
    console.log('  Closing WhatsApp modal cleanly...');
    await recorder.eval(`
      (() => {
        const closeBtn = document.querySelector('#modal-close-cross-btn') ||
                         document.querySelector('button[aria-label="Close modal"]') ||
                         Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === '✕');
        if (closeBtn) closeBtn.click();
      })()
    `);
    await wait(2000);

    const remainingTime5 = dur5 - 23.3;
    if (remainingTime5 > 0) await wait(remainingTime5 * 1000);

    const frames5 = await recorder.stopCapture();
    const scene5Mp4 = path.join(SCENES_DIR, 'scene5.mp4');
    await compileSceneVideo({
      sceneDir: path.join(SCENES_DIR, 'scene5_frames'),
      frames: frames5,
      targetDuration: dur5,
      audioFile: audio5,
      outputFile: scene5Mp4,
    });
    sceneOutputs.push(scene5Mp4);

    // ─────────────────────────────────────────────────────────────────────────
    // SCENE 6: Architecture, Technology & Pitch Close
    // ─────────────────────────────────────────────────────────────────────────
    console.log('\n--- SCENE 6: Architecture, Technology & Pitch Close ---');
    const audio6 = path.join(AUDIO_DIR, 'scene6_narration.mp3');
    const dur6 = getAudioDuration(audio6);
    console.log(`Scene 6 Audio Duration: ${dur6.toFixed(2)}s`);

    // Ensure Planner view is active and at top
    await recorder.eval(`
      (() => {
        window.scrollTo(0, 0);
        const btns = Array.from(document.querySelectorAll('button'));
        const plannerBtn = btns.find(b => b.textContent.includes('Planner & AI') || b.textContent.includes('Planner'));
        if (plannerBtn) plannerBtn.click();
      })()
    `);
    await wait(1500);

    await recorder.startCapture();

    // Settle on the main glowing festive interface for 4 seconds
    await wait(4000);

    // Inject sleek architectural summary overlay card
    console.log('  Displaying architectural summary card overlay...');
    await recorder.eval(`
      (() => {
        const overlay = document.createElement('div');
        overlay.id = 'demo-architecture-overlay';
        overlay.style.position = 'fixed';
        overlay.style.inset = '0';
        overlay.style.backgroundColor = 'rgba(15, 7, 18, 0.82)';
        overlay.style.backdropFilter = 'blur(12px)';
        overlay.style.zIndex = '99999';
        overlay.style.display = 'flex';
        overlay.style.flexDirection = 'column';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';
        overlay.style.padding = '40px';
        overlay.style.animation = 'fadeIn 0.8s ease-out';

        overlay.innerHTML = \`
          <div style="max-width: 960px; width: 100%; background: linear-gradient(145deg, rgba(34, 18, 38, 0.95), rgba(20, 10, 24, 0.98)); border: 1px solid rgba(226, 179, 78, 0.4); border-radius: 24px; padding: 48px; box-shadow: 0 25px 60px rgba(0, 0, 0, 0.8); text-align: center;">
            <div style="display: inline-flex; align-items: center; gap: 8px; padding: 6px 18px; border-radius: 9999px; background: rgba(226, 179, 78, 0.15); border: 1px solid rgba(226, 179, 78, 0.4); color: #E2B34E; font-size: 13px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 20px;">
              PROMPT WARS HACKATHON 2026 · ARCHITECTURAL PROFILE
            </div>
            <h1 style="font-family: serif; font-size: 42px; font-weight: 700; color: #FFF; margin: 0 0 12px 0; letter-spacing: -0.02em;">
              Velmora Spark
            </h1>
            <p style="color: #E2B34E; font-size: 18px; font-weight: 500; margin: 0 0 32px 0;">
              Dream it. Plan it. Celebrate it.
            </p>

            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; text-align: left; margin-bottom: 32px;">
              <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 16px; padding: 20px;">
                <div style="color: #E2B34E; font-size: 14px; font-weight: 700; margin-bottom: 8px;">🚀 Modern Web Core</div>
                <div style="color: #D1D5DB; font-size: 13px; line-height: 1.6;">Next.js 16 (App Router)<br>TypeScript & Tailwind CSS v4<br>Client Hydration & High-FPS Motion</div>
              </div>
              <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 16px; padding: 20px;">
                <div style="color: #E2B34E; font-size: 14px; font-weight: 700; margin-bottom: 8px;">🧠 Grounded Intelligence</div>
                <div style="color: #D1D5DB; font-size: 13px; line-height: 1.6;">Google Gemini 2.5 Flash<br>Zero-Hallucination Grounding<br>Deterministic Offline Fallback</div>
              </div>
              <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 16px; padding: 20px;">
                <div style="color: #E2B34E; font-size: 14px; font-weight: 700; margin-bottom: 8px;">🛡️ Real-Time & Security</div>
                <div style="color: #D1D5DB; font-size: 13px; line-height: 1.6;">Neon Serverless PostgreSQL<br>Zero Guest PII Exposure<br>Multilingual i18n (EN/HI/KN)</div>
              </div>
            </div>

            <div style="color: #9CA3AF; font-size: 14px; letter-spacing: 0.02em;">
              Transforming celebration logistics into one connected, intelligent, and beautifully simple experience.
            </div>
          </div>
        \`;
        document.body.appendChild(overlay);
      })()
    `);

    const remainingTime6 = dur6 - 5.5;
    if (remainingTime6 > 0) await wait(remainingTime6 * 1000);

    const frames6 = await recorder.stopCapture();
    const scene6Mp4 = path.join(SCENES_DIR, 'scene6.mp4');
    await compileSceneVideo({
      sceneDir: path.join(SCENES_DIR, 'scene6_frames'),
      frames: frames6,
      targetDuration: dur6,
      audioFile: audio6,
      outputFile: scene6Mp4,
    });
    sceneOutputs.push(scene6Mp4);

    // ─────────────────────────────────────────────────────────────────────────
    // MASTER ASSEMBLY: Concatenate all 6 scenes into final production video
    // ─────────────────────────────────────────────────────────────────────────
    console.log('\n================================================================');
    console.log('   ASSEMBLING MASTER VIDEO: VELMORA_SPARK_PROMPT_WARS_DEMO.mp4   ');
    console.log('================================================================');

    const masterConcatList = path.join(OUT_DIR, 'master_concat.txt');
    const masterLines = sceneOutputs.map((p) => `file '${p.replace(/\\/g, '/')}'`);
    fs.writeFileSync(masterConcatList, masterLines.join('\n'));

    const masterOutput = path.join(OUT_DIR, 'VELMORA_SPARK_PROMPT_WARS_DEMO.mp4');
    console.log(`Concatenating ${sceneOutputs.length} scene videos into: ${masterOutput}...`);

    // Concatenate via FFmpeg concat demuxer (lossless stream copy since all scenes share identical encoding specs)
    const masterCmd = `"${FFMPEG}" -y -f concat -safe 0 -i "${masterConcatList}" -c copy "${masterOutput}"`;
    execSync(masterCmd, { stdio: 'ignore' });

    const masterStat = fs.statSync(masterOutput);
    console.log(`\n🎉 MASTER DEMO VIDEO GENERATED:`);
    console.log(`   Path: ${masterOutput}`);
    console.log(`   Size: ${(masterStat.size / 1024 / 1024).toFixed(2)} MB`);

    // Probe master video stats
    let probeOut = '';
    try {
      execSync(`"${FFMPEG}" -i "${masterOutput}"`, { stdio: ['pipe', 'pipe', 'pipe'] });
    } catch (e) {
      probeOut = e.stderr ? e.stderr.toString() : e.message;
    }
    const durMatch = probeOut.match(/Duration: (\d+):(\d+):([\d.]+)/);
    if (durMatch) {
      const s = parseInt(durMatch[1]) * 3600 + parseInt(durMatch[2]) * 60 + parseFloat(durMatch[3]);
      console.log(`   Duration: ${s.toFixed(2)}s (${Math.floor(s / 60)}m ${Math.round(s % 60)}s)`);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // FALLBACK SHORT VIDEO: VELMORA_SPARK_MVP_WORKFLOW_FALLBACK.mp4
    // ─────────────────────────────────────────────────────────────────────────
    console.log('\n--- GENERATING FALLBACK VIDEO: VELMORA_SPARK_MVP_WORKFLOW_FALLBACK.mp4 ---');
    const fallbackConcatList = path.join(FALLBACK_DIR, 'fallback_concat.txt');
    // Use Scene 2 (Planner Styles), Scene 3 (Stress Simulator), and Scene 5 (AI & WhatsApp Card)
    const fallbackScenes = [sceneOutputs[1], sceneOutputs[2], sceneOutputs[4]];
    const fallbackLines = fallbackScenes.map((p) => `file '${p.replace(/\\/g, '/')}'`);
    fs.writeFileSync(fallbackConcatList, fallbackLines.join('\n'));

    const fallbackOutput = path.join(FALLBACK_DIR, 'VELMORA_SPARK_MVP_WORKFLOW_FALLBACK.mp4');
    const fallbackCmd = `"${FFMPEG}" -y -f concat -safe 0 -i "${fallbackConcatList}" -c copy "${fallbackOutput}"`;
    execSync(fallbackCmd, { stdio: 'ignore' });

    const fallbackStat = fs.statSync(fallbackOutput);
    console.log(`✓ Generated Fallback Video: ${fallbackOutput} (${(fallbackStat.size / 1024 / 1024).toFixed(2)} MB)`);

    // ─────────────────────────────────────────────────────────────────────────
    // COPY ASSETS INTO demo-assets/
    // ─────────────────────────────────────────────────────────────────────────
    console.log('\n--- COPYING LEGITIMATE ASSETS INTO demo-assets/ ---');
    // Copy narration audio files
    const audioFiles = fs.readdirSync(AUDIO_DIR).filter((f) => f.endsWith('.mp3'));
    for (const af of audioFiles) {
      fs.copyFileSync(path.join(AUDIO_DIR, af), path.join(ASSETS_DIR, af));
    }

    // Copy audit card samples
    const auditCardsDir = path.resolve('screenshots', 'audit-cards');
    if (fs.existsSync(auditCardsDir)) {
      const cards = fs.readdirSync(auditCardsDir).filter((f) => f.endsWith('.png'));
      for (const cf of cards) {
        fs.copyFileSync(path.join(auditCardsDir, cf), path.join(ASSETS_DIR, cf));
      }
    }
    console.log(`✓ Saved legitimate assets in ${ASSETS_DIR}`);

    console.log('\n================================================================');
    console.log('   PRODUCTION COMPLETE — ALL DELIVERABLES READY!               ');
    console.log('================================================================');
  } finally {
    recorder.close();
  }
}

main().catch((err) => {
  console.error('\n[FATAL ERROR]', err);
  process.exit(1);
});

