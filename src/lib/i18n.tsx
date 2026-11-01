'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'hi' | 'kn';

export interface Translations {
  appName: string;
  tagline: string;
  chooseCelebrationStyle: string;
  planApproachesSub: string;
  tabs: {
    planner: string;
    budget: string;
    stress: string;
    rsvps: string;
    command: string;
  };
  actions: {
    lockPlan: string;
    planLockedToast: string;
    planUpdatedToast: string;
    themeLight: string;
    themeDark: string;
    simulateCrisis: string;
    broadcastWhatsApp: string;
    copied: string;
    copy: string;
    openWhatsApp: string;
  };
  metrics: {
    totalBudget: string;
    projectedFinal: string;
    guests: string;
    contingencyReserve: string;
  };
}

export const DICTIONARY: Record<Language, Translations> = {
  en: {
    appName: 'Velmora Spark',
    tagline: 'Dream it. Plan it. Celebrate it.',
    chooseCelebrationStyle: 'Choose Your Celebration Style',
    planApproachesSub: 'Curated architectural approaches with transparent cost ceilings and operational tradeoffs',
    tabs: {
      planner: 'Planner & AI',
      budget: 'Budget & Plate Math',
      stress: 'Stress-Test Radar',
      rsvps: 'RSVPs & Dietary',
      command: 'Run Sheet Command',
    },
    actions: {
      lockPlan: 'Lock this plan',
      planLockedToast: 'Plan confirmed! Ops runway locked.',
      planUpdatedToast: 'Plan updated to',
      themeLight: 'Switch to light theme',
      themeDark: 'Switch to dark celebration theme',
      simulateCrisis: 'Simulate & Apply Recovery Protocol',
      broadcastWhatsApp: 'Broadcast on WhatsApp',
      copied: 'Copied! ✓',
      copy: 'Copy',
      openWhatsApp: 'Open in WhatsApp',
    },
    metrics: {
      totalBudget: 'Total Budget',
      projectedFinal: 'Projected Cost',
      guests: 'Guests',
      contingencyReserve: 'Contingency Reserve',
    },
  },
  hi: {
    appName: 'वेल्मोरा स्पार्क',
    tagline: 'सपना देखें। योजना बनाएं। उत्सव मनाएं।',
    chooseCelebrationStyle: 'अपनी उत्सव शैली चुनें',
    planApproachesSub: 'पारदर्शी बजट सीमा और संचालन योजना के साथ चुनी हुई शैलियां',
    tabs: {
      planner: 'योजना और AI',
      budget: 'बजट और भोजन गणित',
      stress: 'संकट परीक्षण रडार',
      rsvps: 'अतिथि और आहार',
      command: 'समय सारणी नियंत्रण',
    },
    actions: {
      lockPlan: 'यह योजना लॉक करें',
      planLockedToast: 'योजना सुरक्षित! संचालन तैयार।',
      planUpdatedToast: 'योजना बदली गई:',
      themeLight: 'हल्का थीम चालू करें',
      themeDark: 'गहरा उत्सव थीम चालू करें',
      simulateCrisis: 'संकट समाधान लागू करें',
      broadcastWhatsApp: 'व्हाट्सएप पर प्रसारित करें',
      copied: 'कॉपी हो गया! ✓',
      copy: 'कॉपी करें',
      openWhatsApp: 'व्हाट्सएप खोलें',
    },
    metrics: {
      totalBudget: 'कुल बजट',
      projectedFinal: 'अनुमानित लागत',
      guests: 'अतिथि',
      contingencyReserve: 'आपातकालीन निधि',
    },
  },
  kn: {
    appName: 'ವೆಲ್ಮೋರಾ ಸ್ಪಾರ್ಕ್',
    tagline: 'ಕನಸು ಕಾಣಿರಿ. ಯೋಜಿಸಿರಿ. ಸಂಭ್ರಮಿಸಿರಿ.',
    chooseCelebrationStyle: 'ನಿಮ್ಮ ಸಂಭ್ರಮಾಚರಣೆಯ ಶೈಲಿ ಆರಿಸಿ',
    planApproachesSub: 'ಪಾರದರ್ಶಕ ವೆಚ್ಚದ ಮಿತಿ ಮತ್ತು ಕಾರ್ಯಾಚರಣೆಯ ವಿವರಗಳೊಂದಿಗೆ ಆಯ್ದ ಶೈಲಿಗಳು',
    tabs: {
      planner: 'ಯೋಜನೆ ಮತ್ತು AI',
      budget: 'ಬಜೆಟ್ ಮತ್ತು ಊಟದ ಲೆಕ್ಕ',
      stress: 'ಸಂಕಷ್ಟ ಪರಿಹಾರ ರಾಡಾರ್',
      rsvps: 'ಅತಿಥಿ ಮತ್ತು ಆಹಾರ ಆದ್ಯತೆ',
      command: 'ಸಮಯಾವಧಿ ನಿಯಂತ್ರಣ',
    },
    actions: {
      lockPlan: 'ಈ ಯೋಜನೆಯನ್ನು ಲಾಕ್ ಮಾಡಿ',
      planLockedToast: 'ಯೋಜನೆ ಖಚಿತವಾಗಿದೆ! ಕಾರ್ಯಾಚರಣೆ ಸಿದ್ಧ.',
      planUpdatedToast: 'ಯೋಜನೆ ನವೀಕರಿಸಲಾಗಿದೆ:',
      themeLight: 'ಬೆಳಕಿನ ಥೀಮ್ ಆರಿಸಿ',
      themeDark: 'ಕತ್ತಲೆಯ ಸಂಭ್ರಮದ ಥೀಮ್ ಆರಿಸಿ',
      simulateCrisis: 'ಪರಿಹಾರ ಪ್ರೋಟೋಕಾಲ್ ಅನ್ವಯಿಸಿ',
      broadcastWhatsApp: 'ವಾಟ್ಸಾಪ್‌ನಲ್ಲಿ ಪ್ರಸಾರ ಮಾಡಿ',
      copied: 'ನಕಲಿಸಲಾಗಿದೆ! ✓',
      copy: 'ನಕಲಿಸಿ',
      openWhatsApp: 'ವಾಟ್ಸಾಪ್ ತೆರೆಯಿರಿ',
    },
    metrics: {
      totalBudget: 'ಒಟ್ಟು ಬಜೆಟ್',
      projectedFinal: 'ಅಂದಾಜು ವೆಚ್ಚ',
      guests: 'ಅತಿಥಿಗಳು',
      contingencyReserve: 'ತುರ್ತು ಮೀಸಲು ನಿಧಿ',
    },
  },
};

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const I18nContext = createContext<I18nContextType>({
  language: 'en',
  setLanguage: () => {},
  t: DICTIONARY.en,
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  // Deterministic initial state for SSR and first client hydration pass
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      try {
        const saved = localStorage.getItem('velmora_lang') as Language;
        if (saved && (saved === 'en' || saved === 'hi' || saved === 'kn')) {
          setLanguageState(saved);
        }
      } catch {
        // Fallback
      }
    });

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('velmora_lang', lang);
    } catch {
      // Ignore
    }
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t: DICTIONARY[language] }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
