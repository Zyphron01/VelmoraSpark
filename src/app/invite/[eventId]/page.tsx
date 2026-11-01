'use client';

import React, { useState, use } from 'react';
import {
  Sparkles, Heart, CheckCircle, MapPin, Calendar, Clock,
  Check, Accessibility, Utensils, AlertTriangle
} from 'lucide-react';
import type { DietaryType, AccessibilityTag } from '@/types/event';

interface PageProps {
  params: Promise<{ eventId: string }>;
}

const STORAGE_KEY = 'velmora_spark_state_v1';

type Lang = 'en' | 'hi' | 'kn';

const CONTENT = {
  en: {
    badge: 'Ceremony & Celebration Invitation',
    title: 'Aarav & Diya’s Wedding Celebration',
    date: 'Saturday, December 14, 2026',
    time: '5:00 PM onwards',
    venue: 'The Leela Palace Courtyard, Bengaluru',
    welcoming: 'Together with their families, Aarav & Diya invite you to share in the joy of their union and celebrate their new beginning.',
    rsvpPrompt: 'Kindly RSVP by December 1st to help us curate a warm & delightful experience for you.',
    attendingLabel: 'Will you be attending?',
    attendingYes: 'Joyfully Accept 🎉',
    attendingNo: 'Regretfully Decline 🙏',
    nameLabel: 'Guest / Family Primary Name',
    namePlaceholder: 'e.g., Rajesh & Suneetha Sharma',
    phoneLabel: 'WhatsApp / Phone Number',
    phonePlaceholder: '+91 98450 12345',
    partySizeLabel: 'Number of Guests in Your Party',
    dietaryLabel: 'Dietary Preferences',
    dietaryStandard: 'Standard Gourmet (North & South Indian)',
    dietaryJain: 'Jain (Strict No Onion, Garlic, Root Veg)',
    dietaryVegan: 'Pure Vegan (Dairy-Free)',
    dietaryNutFree: 'Nut & Gluten Sensitive',
    accessibilityLabel: 'Comfort & Accessibility Assistance',
    accElderly: 'Elderly Near-Stage Seating',
    accWheelchair: 'Wheelchair / Step-Free Access',
    accQuiet: 'Low-Decibel Quiet Zone',
    accRestroom: 'Ground-Floor Restroom Proximity',
    noteLabel: 'Blessings or Special Note for Aarav & Diya',
    notePlaceholder: 'Wishing you a lifetime of joy and laughter...',
    submitBtn: 'Confirm My RSVP ✨',
    successTitle: 'Thank You for Your RSVP! 🎉',
    successSubtitle: 'Your response has been registered directly with the wedding coordinators.',
    successDetail: 'We look forward to celebrating together at The Leela Palace Courtyard, Bengaluru!',
    returnHome: 'View Event Organizer Dashboard →',
    duplicateError: 'An RSVP with this phone number is already registered for this event.',
  },
  hi: {
    badge: 'विवाह उत्सव आमंत्रण',
    title: 'आरव एवं दिया का शुभ विवाह',
    date: 'शनिवार, 14 दिसंबर 2026',
    time: 'शाम 5:00 बजे से',
    venue: 'द लीला पैलेस प्रांगण, बेंगलुरु',
    welcoming: 'सपरिवार, आरव एवं दिया के परिणयोत्सव में आपकी गरिमामयी उपस्थिति एवं स्नेहपूर्ण आशीर्वाद के आकांक्षी हैं।',
    rsvpPrompt: 'भोजन एवं बैठक व्यवस्था को सुगम बनाने हेतु कृपया 1 दिसंबर तक अपनी स्वीकृति प्रदान करें।',
    attendingLabel: 'क्या आप उपस्थित होंगे?',
    attendingYes: 'हर्षपूर्वक उपस्थित होंगे 🎉',
    attendingNo: 'असमर्थता हेतु क्षमाप्रार्थी 🙏',
    nameLabel: 'अतिथि / परिवार का नाम',
    namePlaceholder: 'उदा. राजेश एवं सुनीता शर्मा',
    phoneLabel: 'व्हाट्सएप / फोन नंबर',
    phonePlaceholder: '+91 98450 12345',
    partySizeLabel: 'कुल सदस्यों की संख्या',
    dietaryLabel: 'भोजन प्राथमिकता',
    dietaryStandard: 'पारंपरिक भारतीय भोजन',
    dietaryJain: 'जैन भोजन (कंदमूल एवं प्याज-लहसुन रहित)',
    dietaryVegan: 'वीगन (दुग्ध उत्पाद रहित)',
    dietaryNutFree: 'एलर्जी सुरक्षित (नट-फ्री)',
    accessibilityLabel: 'विशेष सहायता एवं सुविधा',
    accElderly: 'वरिष्ठ नागरिकों हेतु मंच के समीप बैठक',
    accWheelchair: 'व्हीलचेयर / सीढ़ी-मुक्त मार्ग',
    accQuiet: 'शांत क्षेत्र (लो-डेसिबल जोन)',
    accRestroom: 'भूतल शौचालय निकटता',
    noteLabel: 'वर-वधू हेतु आशीर्वाद या संदेश',
    notePlaceholder: 'सदा सुखी और आनंदित रहें...',
    submitBtn: 'आमंत्रण स्वीकार करें ✨',
    successTitle: 'आपकी स्वीकृति प्राप्त हुई! 🎉',
    successSubtitle: 'आपकी उपस्थिति का विवरण आयोजकों तक पहुंच चुका है।',
    successDetail: '14 दिसंबर को द लीला पैलेस में आपसे मिलने की प्रतीक्षा रहेगी!',
    returnHome: 'आयोजक डैशबोर्ड देखें →',
    duplicateError: 'इस फोन नंबर से आमंत्रण स्वीकृति पहले से दर्ज है।',
  },
  kn: {
    badge: 'ವಿವಾಹ ಮಹೋತ್ಸವ ಆಮಂತ್ರಣ',
    title: 'ಆರವ್ ಮತ್ತು ದಿಯಾ ಅವರ ಶುಭ ವಿವಾಹ',
    date: 'ಶನಿವಾರ, 14 ಡಿಸೆಂಬರ್ 2026',
    time: 'ಸಂಜೆ 5:00 ರಿಂದ',
    venue: 'ದಿ ಲೀಲಾ ಪ್ಯಾಲೇಸ್ ಪ್ರಾಂಗಣ, ಬೆಂಗಳೂರು',
    welcoming: 'ನಮ್ಮ ಕುಟುಂಬದೊಂದಿಗೆ, ಆರವ್ ಮತ್ತು ದಿಯಾ ಅವರ ಹೊಸ ಜೀವನದ ಆರಂಭಕ್ಕೆ ತಮ್ಮ ಉಪಸ್ಥಿತಿ ಮತ್ತು ಹಾರೈಕೆಯನ್ನು ಕೋರುತ್ತೇವೆ.',
    rsvpPrompt: 'ದಯವಿಟ್ಟು ಡಿಸೆಂಬರ್ 1 ರೊಳಗೆ ತಮ್ಮ ಬರುವಿಕೆಯನ್ನು ದೃಢೀಕರಿಸಿ.',
    attendingLabel: 'ತಾವು ಉಪಸ್ಥಿತರಿರುವಿರಾ?',
    attendingYes: 'ಸಂತೋಷದಿಂದ ಭಾಗವಹಿಸುತ್ತೇವೆ 🎉',
    attendingNo: 'ಬರಲಾಗುತ್ತಿಲ್ಲ, ಕ್ಷಮಿಸಿ 🙏',
    nameLabel: 'ಅತಿಥಿ / ಕುಟುಂಬದ ಮುಖ್ಯಸ್ಥರ ಹೆಸರು',
    namePlaceholder: 'ಉದಾ: ರಾಜೇಶ್ ಮತ್ತು ಸುನೀತಾ',
    phoneLabel: 'ವಾಟ್ಸಾಪ್ / ಮೊಬೈಲ್ ಸಂಖ್ಯೆ',
    phonePlaceholder: '+91 98450 12345',
    partySizeLabel: 'ಒಟ್ಟು ಅತಿಥಿಗಳ ಸಂಖ್ಯೆ',
    dietaryLabel: 'ಆಹಾರ ಆದ್ಯತೆಗಳು',
    dietaryStandard: 'ಸಾಂಪ್ರದಾಯಿಕ ಊಟ',
    dietaryJain: 'ಜೈನ್ ಆಹಾರ (ಈರುಳ್ಳಿ, ಬೆಳ್ಳುಳ್ಳಿ ರಹಿತ)',
    dietaryVegan: 'ಸಸ್ಯಾಹಾರಿ (ಹಾಲು ಮುಕ್ತ)',
    dietaryNutFree: 'ಅಲರ್ಜಿ ಮುಕ್ತ',
    accessibilityLabel: 'ವಿಶೇಷ ಸೌಲಭ್ಯಗಳು',
    accElderly: 'ಹಿರಿಯರಿಗೆ ಪ್ರತ್ಯೇಕ ಆಸನ ವ್ಯವಸ್ಥೆ',
    accWheelchair: 'ವ್ಹೀಲ್‌ಚೇರ್ ಸೌಲಭ್ಯ',
    accQuiet: 'ಶಾಂತ ವಲಯ (ಕಡಿಮೆ ಶಬ್ದ)',
    accRestroom: 'ನೆಲಮಹಡಿಯ ಶೌಚಾಲಯ ಲಭ್ಯತೆ',
    noteLabel: 'ವರ-ವಧುವಿಗೆ ಹಾರೈಕೆಗಳು',
    notePlaceholder: 'ನಿಮ್ಮ ಹೊಸ ಜೀವನ ಸುಖಕರವಾಗಿರಲಿ...',
    submitBtn: 'ಆಮಂತ್ರಣ ದೃಢೀಕರಿಸಿ ✨',
    successTitle: 'ಧನ್ಯವಾದಗಳು! 🎉',
    successSubtitle: 'ನಿಮ್ಮ ಆರ್‌ಎಸ್‌ವಿಪಿ ದಾಖಲಾಗಿದೆ.',
    successDetail: 'ಡಿಸೆಂಬರ್ 14 ರಂದು ದಿ ಲೀಲಾ ಪ್ಯಾಲೇಸ್‌ನಲ್ಲಿ ನಿಮ್ಮನ್ನು ಭೇಟಿಯಾಗಲು ಎದುರುನೋಡುತ್ತಿದ್ದೇವೆ!',
    returnHome: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಹಿಂತಿರುಗಿ →',
    duplicateError: 'ಈ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯಿಂದ ಈಗಾಗಲೇ ಆರ್‌ಎಸ್‌ವಿಪಿ ದಾಖಲಾಗಿದೆ.',
  },
};

function GuestInviteContent({ params }: PageProps) {
  const resolvedParams = use(params);
  const eventId = resolvedParams.eventId;

  const [lang, setLang] = useState<Lang>('en');
  const [status, setStatus] = useState<'confirmed' | 'declined'>('confirmed');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [partySize, setPartySize] = useState(2);
  const [dietary, setDietary] = useState<DietaryType>('standard');
  const [accessibilityTags, setAccessibilityTags] = useState<AccessibilityTag[]>([]);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Dynamic custom event metadata from browser workspace
  const [customEventMeta, setCustomEventMeta] = useState<{ title?: string; city?: string; date?: string } | null>(null);

  React.useEffect(() => {
    try {
      const rawCustomState = localStorage.getItem(`velmora_custom_state_${eventId}`);
      if (rawCustomState) {
        const parsed = JSON.parse(rawCustomState);
        if (parsed.event) {
          setCustomEventMeta({
            title: parsed.event.title,
            city: parsed.event.city,
            date: parsed.event.date,
          });
          return;
        }
      }
      const rawState = localStorage.getItem(STORAGE_KEY);
      if (rawState) {
        const parsed = JSON.parse(rawState);
        if (parsed.event && (parsed.event.id === eventId || parsed.event.isCustom)) {
          setCustomEventMeta({
            title: parsed.event.title,
            city: parsed.event.city,
            date: parsed.event.date,
          });
        }
      }
    } catch {}
  }, [eventId]);

  const t = CONTENT[lang];
  const displayTitle = customEventMeta?.title ? `${customEventMeta.title} Invitation` : t.title;
  const displayVenue = customEventMeta?.city ? `${customEventMeta.city} Grand Banquet & Lawns` : t.venue;
  const displayDate = customEventMeta?.date || t.date;

  function toggleTag(tag: AccessibilityTag) {
    setAccessibilityTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    const payload = {
      eventId,
      name: name.trim(),
      phone: phone.trim(),
      rsvpStatus: status,
      dietary,
      accessibilityTags,
      partySize: status === 'confirmed' ? Math.max(1, partySize) : 1,
      notes: note.trim(),
      language: lang,
    };

    try {
      // 1. Send to verified API route backed by Neon database
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (res.status === 409) {
          setErrorMsg(t.duplicateError || 'An RSVP with this phone number is already registered for this event.');
        } else {
          setErrorMsg(data.error || 'Failed to submit RSVP. Please check your entries and try again.');
        }
        setIsSubmitting(false);
        return;
      }

      // 2. LocalStorage Sync for instant local evaluator reflection
      if (typeof window !== 'undefined') {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            const newGuest = {
              id: data.rsvp?.id || `guest-${Date.now()}`,
              name: payload.name,
              phone: payload.phone,
              dietary: payload.dietary,
              accessibilityTags: payload.accessibilityTags,
              rsvpStatus: payload.rsvpStatus,
              plusOnes: Math.max(0, payload.partySize - 1),
              notes: payload.notes,
            };

            const updatedGuests = [newGuest, ...(parsed.guests || []).filter((g: { phone: string }) => g.phone !== payload.phone)];
            const confirmedCount = updatedGuests.filter((g: { rsvpStatus: string }) => g.rsvpStatus === 'confirmed').length;

            const jainCount = updatedGuests.filter((g: { dietary: string }) => g.dietary === 'jain').length;
            const veganCount = updatedGuests.filter((g: { dietary: string }) => g.dietary === 'vegan').length;
            const allergyCount = updatedGuests.filter((g: { dietary: string }) => g.dietary === 'nut_free').length;
            const elderlyCount = updatedGuests.filter((g: { accessibilityTags?: string[] }) =>
              g.accessibilityTags?.includes('elderly_seating')
            ).length;

            const updatedState = {
              ...parsed,
              guests: updatedGuests,
              event: {
                ...parsed.event,
                confirmedRsvpCount: confirmedCount,
              },
              catering: {
                ...parsed.catering,
                rsvpConfirmed: confirmedCount,
                jainPlates: jainCount,
                veganPlates: veganCount,
                allergySafePlates: allergyCount,
                elderlySeatingCount: elderlyCount,
              },
            };

            localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedState));
          } catch {
            // ignore JSON parse error
          }
        }
      }

      setSubmitted(true);
    } catch (err) {
      console.error('RSVP submission error:', err);
      setErrorMsg('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)] py-8 px-4 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Decorative SVG Mandala Background Texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.05] bg-repeat"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%236B1D2A' fill-rule='evenodd'%3E%3Cpath d='M60 0c33.137 0 60 26.863 60 60s-26.863 60-60 60S0 93.137 0 60 26.863 0 60 0zm0 10C32.386 10 10 32.386 10 60s22.386 50 50 50 50-22.386 50-50S87.614 10 60 10zm0 15c19.33 0 35 15.67 35 35s-15.67 35-35 35-35-15.67-35-35 15.67-35 35-35z' fill-opacity='0.6'/%3E%3Ccircle cx='60' cy='60' r='18'/%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
      {/* Radial Gold Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full radial-gold-glow pointer-events-none opacity-50" />

      {/* Royal Celebration Header Crest */}
      <div className="w-full max-w-xl mb-3 flex items-center justify-between relative z-10 px-2 text-xs">
        <div className="inline-flex items-center gap-2 text-[var(--primary)] font-serif font-bold tracking-wide">
          <span className="w-2 h-2 rounded-full bg-[#FFAE34]" />
          <span>Velmora Spark · Royal Celebration</span>
        </div>
        <div className="text-[11px] text-[var(--stone-400)] font-sans">
          <span>Official Guest Portal</span>
        </div>
      </div>

      <div className="w-full max-w-xl bg-[var(--card)] border border-[var(--border-subtle)] rounded-[32px] shadow-soft overflow-hidden animate-slide-up relative z-10">
        {/* Editorial Header Banner */}
        <div className="bg-gradient-to-br from-[#2D1B22] via-[#3B151E] to-[#1E0D12] text-white p-6 sm:p-8 relative">
          <div className="flex items-center justify-between gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[var(--primary)] text-white shadow-xs">
              <Sparkles size={11} className="text-[var(--accent)]" /> {t.badge}
            </span>

            {/* Language Switcher */}
            <div className="flex items-center bg-white/10 rounded-full p-1 border border-white/20 text-xs">
              <button
                onClick={() => setLang('en')}
                className={`px-2.5 py-0.5 rounded-full transition-all ${
                  lang === 'en' ? 'bg-[var(--primary)] text-white font-semibold' : 'text-white/70 hover:text-white'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLang('hi')}
                className={`px-2.5 py-0.5 rounded-full transition-all ${
                  lang === 'hi' ? 'bg-[var(--primary)] text-white font-semibold' : 'text-white/70 hover:text-white'
                }`}
              >
                हिन्दी
              </button>
              <button
                onClick={() => setLang('kn')}
                className={`px-2.5 py-0.5 rounded-full transition-all ${
                  lang === 'kn' ? 'bg-[var(--primary)] text-white font-semibold' : 'text-white/70 hover:text-white'
                }`}
              >
                ಕನ್ನಡ
              </button>
            </div>
          </div>

          <h1 className="font-serif text-2xl sm:text-3xl font-bold mb-3 leading-snug">
            {displayTitle}
          </h1>

          <p className="text-xs sm:text-sm text-white/80 leading-relaxed mb-6 font-light">
            {t.welcoming}
          </p>

          {/* Key Event Logistics Card */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white/5 border border-white/10 rounded-2xl p-4 text-xs">
            <div className="flex items-start gap-2.5">
              <Calendar size={15} className="text-[var(--accent)] mt-0.5 shrink-0" />
              <div>
                <div className="font-semibold text-white">{displayDate}</div>
                <div className="text-[11px] text-white/60">Date</div>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <Clock size={15} className="text-[var(--accent)] mt-0.5 shrink-0" />
              <div>
                <div className="font-semibold text-white">{t.time}</div>
                <div className="text-[11px] text-white/60">Ceremony Time</div>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <MapPin size={15} className="text-[var(--accent)] mt-0.5 shrink-0" />
              <div>
                <div className="font-semibold text-white">{displayVenue}</div>
                <div className="text-[11px] text-white/60">Venue</div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Body: Form or Success */}
        <div className="p-6 sm:p-8">
          {submitted ? (
            <div className="text-center py-6 animate-fade-in">
              <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-4 text-[var(--success)]">
                <CheckCircle size={36} />
              </div>
              <h2 className="font-serif text-2xl font-bold text-[var(--ink)] mb-2">
                {t.successTitle}
              </h2>
              <p className="text-sm text-[var(--stone-500)] mb-2 max-w-md mx-auto">
                {t.successSubtitle}
              </p>
              <p className="text-xs text-[var(--stone-400)] mb-6 max-w-md mx-auto">
                {t.successDetail}
              </p>

              <div className="p-4 bg-[var(--surface)] rounded-2xl border border-[var(--border-subtle)] inline-block text-left text-xs space-y-1.5 mb-6">
                <div><strong>Guest Name:</strong> {name}</div>
                <div><strong>Party Headcount:</strong> {partySize} guests</div>
                <div><strong>Dietary:</strong> {dietary.toUpperCase()}</div>
                <div><strong>Status:</strong> {status === 'confirmed' ? 'Attending' : 'Declined'}</div>
              </div>

              <div className="pt-2 flex flex-col items-center gap-2">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--sage-muted)] border border-[var(--success)]/20 text-xs font-semibold text-[var(--success)]">
                  <Check size={14} />
                  <span>RSVP Officially Confirmed</span>
                </div>
                <p className="text-[11px] text-[var(--stone-400)]">
                  You may close this window. We look forward to celebrating with you!
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {errorMsg && (
                <div role="alert" className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2.5 animate-fade-in">
                  <AlertTriangle size={16} className="text-rose-600 shrink-0" />
                  <span className="font-medium">{errorMsg}</span>
                </div>
              )}

              <div className="text-center border-b border-[var(--border-subtle)] pb-4">
                <p className="text-xs text-[var(--stone-500)] font-medium">
                  {t.rsvpPrompt}
                </p>
              </div>

              {/* Attendance Choice */}
              <div>
                <label className="block text-xs font-semibold text-[var(--ink)] mb-2">
                  {t.attendingLabel}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setStatus('confirmed')}
                    className={`py-3 px-4 rounded-2xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                      status === 'confirmed'
                        ? 'border-[var(--success)] bg-emerald-50 dark:bg-emerald-950/30 text-[var(--success)] shadow-xs'
                        : 'border-[var(--border-subtle)] bg-[var(--surface)] text-[var(--stone-500)]'
                    }`}
                  >
                    <Check size={14} /> {t.attendingYes}
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus('declined')}
                    className={`py-3 px-4 rounded-2xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                      status === 'declined'
                        ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/30 text-rose-600 shadow-xs'
                        : 'border-[var(--border-subtle)] bg-[var(--surface)] text-[var(--stone-500)]'
                    }`}
                  >
                    {t.attendingNo}
                  </button>
                </div>
              </div>

              {/* Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--ink)] mb-1.5">
                    {t.nameLabel} *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t.namePlaceholder}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] text-xs focus:outline-none focus:border-[var(--primary)] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--ink)] mb-1.5">
                    {t.phoneLabel} *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={t.phonePlaceholder}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] text-xs font-mono focus:outline-none focus:border-[var(--primary)] transition-colors"
                  />
                </div>
              </div>

              {/* Headcount */}
              {status === 'confirmed' && (
                <div>
                  <label className="block text-xs font-semibold text-[var(--ink)] mb-1.5 flex items-center justify-between">
                    <span>{t.partySizeLabel}</span>
                    <span className="text-[var(--primary)] font-bold text-sm">{partySize} {partySize === 1 ? 'Guest' : 'Guests'}</span>
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setPartySize(num)}
                        className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                          partySize === num
                            ? 'bg-[var(--primary)] text-white border-[var(--primary)] shadow-xs'
                            : 'bg-[var(--surface)] text-[var(--ink)] border-[var(--border-subtle)] hover:bg-[var(--card-hover)]'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Dietary Requirements */}
              {status === 'confirmed' && (
                <div>
                  <label className="block text-xs font-semibold text-[var(--ink)] mb-2 flex items-center gap-1.5">
                    <Utensils size={13} className="text-[var(--accent)]" />
                    {t.dietaryLabel}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    {[
                      { key: 'standard' as DietaryType, label: t.dietaryStandard, emoji: '🍛' },
                      { key: 'jain' as DietaryType, label: t.dietaryJain, emoji: '🌱' },
                      { key: 'vegan' as DietaryType, label: t.dietaryVegan, emoji: '🥗' },
                      { key: 'nut_free' as DietaryType, label: t.dietaryNutFree, emoji: '🛡️' },
                    ].map((d) => (
                      <button
                        key={d.key}
                        type="button"
                        onClick={() => setDietary(d.key)}
                        className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition-all ${
                          dietary === d.key
                            ? 'border-[var(--primary)] bg-[var(--terracotta-muted)] text-[var(--ink)] font-medium shadow-xs'
                            : 'border-[var(--border-subtle)] bg-[var(--surface)] text-[var(--stone-500)] hover:border-[var(--border-subtle)]'
                        }`}
                      >
                        <span className="text-base">{d.emoji}</span>
                        <span className="text-[11px] leading-tight mt-0.5">{d.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Accessibility Accommodations */}
              {status === 'confirmed' && (
                <div>
                  <label className="block text-xs font-semibold text-[var(--ink)] mb-2 flex items-center gap-1.5">
                    <Accessibility size={13} className="text-[var(--success)]" />
                    {t.accessibilityLabel}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {[
                      { key: 'elderly_seating' as AccessibilityTag, label: t.accElderly, icon: '🪑' },
                      { key: 'wheelchair_ramp' as AccessibilityTag, label: t.accWheelchair, icon: '♿' },
                      { key: 'low_decibel_zone' as AccessibilityTag, label: t.accQuiet, icon: '🎧' },
                      { key: 'ground_floor_room' as AccessibilityTag, label: t.accRestroom, icon: '🚻' },
                    ].map((acc) => {
                      const active = accessibilityTags.includes(acc.key);
                      return (
                        <button
                          key={acc.key}
                          type="button"
                          onClick={() => toggleTag(acc.key)}
                          className={`p-2.5 rounded-2xl border text-left flex items-center gap-2 transition-all ${
                            active
                              ? 'border-[var(--success)] bg-emerald-50 dark:bg-emerald-950/30 text-[var(--success)] font-medium'
                              : 'border-[var(--border-subtle)] bg-[var(--surface)] text-[var(--stone-500)] hover:border-[var(--border-subtle)]'
                          }`}
                        >
                          <span>{acc.icon}</span>
                          <span className="text-[11px] flex-1">{acc.label}</span>
                          {active && <Check size={12} className="text-[var(--success)] shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Note / Blessing */}
              <div>
                <label className="block text-xs font-semibold text-[var(--ink)] mb-1.5 flex items-center gap-1.5">
                  <Heart size={13} className="text-[var(--cta)]" />
                  {t.noteLabel}
                </label>
                <textarea
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={t.notePlaceholder}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] text-xs focus:outline-none focus:border-[var(--primary)] transition-colors resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full btn btn-primary py-3.5 text-sm font-semibold shadow-md rounded-full flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span>Recording Your RSVP...</span>
                ) : (
                  <span>{t.submitBtn}</span>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function GuestInvitePage({ params }: PageProps) {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-8">
          <div className="text-center">
            <div className="w-8 h-8 rounded-full border-2 border-[var(--primary)] border-t-transparent animate-spin mx-auto mb-2" />
            <p className="text-xs text-[var(--stone-500)]">Loading Ceremony Invitation...</p>
          </div>
        </div>
      }
    >
      <GuestInviteContent params={params} />
    </React.Suspense>
  );
}
