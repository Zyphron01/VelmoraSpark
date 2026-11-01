import asyncio
import os
import edge_tts

OUTPUT_DIR = os.path.join("hackathon-demo-video", "audio")
os.makedirs(OUTPUT_DIR, exist_ok=True)

VOICE = "en-IN-PrabhatNeural"

SCENES = [
    {
        "id": "scene1",
        "text": "In India, weddings and cultural celebrations are magnificent, yet behind the grandeur lies operational chaos. Families juggle dozens of frantic WhatsApp groups, loose vendor contracts, fluctuating guest counts, and mounting budget anxieties. Welcome to Velmora Spark: an intelligent operations platform designed to bring clarity, dignity, and real-time operational control to Indian celebration planning."
    },
    {
        "id": "scene2",
        "text": "Here on the Planner dashboard, organizers get an immediate, consolidated view of the entire celebration. Instead of vague estimates, Velmora Spark introduces curated architectural styles—from Royal Heritage to Contemporary Celebrations—each equipped with pre-audited price ceilings, transparent vendor tradeoffs, and AI-assisted negotiation tips. Organizers make confident decisions long before paying vendor advances, safeguarding family savings right from day one."
    },
    {
        "id": "scene3",
        "text": "Financial transparency is the beating heart of Velmora Spark. The Budget Intelligence dashboard clearly distinguishes between sanctioned ceilings, committed advances, and projected invoices, keeping our contingency buffer constantly visible. And when the unexpected happens, the Stress Radar Simulator tests the plan against real-world disruption scenarios—like an unannounced twenty percent guest surge at the gate. Instantly, our cascade engine activates pre-negotiated caterer slabs and surfaces step-by-step recovery checklists, preventing panic before it begins."
    },
    {
        "id": "scene4",
        "text": "For guests, Velmora Spark requires zero app downloads. Guests receive a luxury digital invitation portal accessible in English, Hindi, and Kannada. Guests easily confirm attendance, specify party sizes, and declare critical dietary needs—such as strict Jain or Vegan preparation—alongside accessibility requirements like wheelchair ramps. Back in the organizer dashboard, attendance and dietary metrics synchronize in real time, locking catering counts and eliminating expensive food waste."
    },
    {
        "id": "scene5",
        "text": "Need answers on the fly? The Celebration AI Concierge is an event-grounded copilot. Querying vendor risks or contingency buffers returns verified figures drawn strictly from trusted records—with zero fabricated numbers. And when communicating with family or coordinators, our WhatsApp Broadcast Generator creates elegant, shareable celebration cards. Organizers can switch between four royal templates, download high-resolution PNGs, and trigger instant pre-formatted WhatsApp briefs in one click."
    },
    {
        "id": "scene6",
        "text": "Velmora Spark is built on Next.js sixteen, TypeScript, Neon PostgreSQL persistence, and Google Gemini AI with offline operational resilience. Velmora Spark transforms celebration planning from scattered coordination into one connected, intelligent, and beautifully simple experience. Dream it. Plan it. Celebrate it."
    }
]

async def generate_all():
    print(f"Generating neural narration using voice: {VOICE}...")
    for s in SCENES:
        out_path = os.path.join(OUTPUT_DIR, f"{s['id']}_narration.mp3")
        communicate = edge_tts.Communicate(s['text'], VOICE, rate="+16%", pitch="+0Hz")
        await communicate.save(out_path)
        size = os.path.getsize(out_path)
        print(f"  [OK] Saved: {out_path} ({size} bytes)")

    print("\nAll narration audio files generated successfully!")

if __name__ == "__main__":
    asyncio.run(generate_all())
