import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'English' | 'Tamil';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  English: {
    dashboard: 'Dashboard',
    realityCheck: 'Reality Check',
    navigator: 'AI Navigator',
    compare: 'Compare Pathways',
    roadmap: 'My Roadmap',
    tasks: 'Learn-by-Doing',
    mentor: 'AI Mentor',
    practice: 'Practice Studio',
    challenges: 'Challenges',
    community: 'Community',
    mentors: 'Find Mentors',
    organizations: 'Opportunities',
    businessBuilder: 'Business Builder',
    skillPassport: 'Skill Passport',
    settings: 'Settings',
    nextBestAction: 'Next Best Action',
    todayTasks: "Today's Tasks",
    activeGoal: 'Active Goal',
    progress: 'Progress',
    demoPersonas: 'Demo Personas',
    switchPersona: 'Switch Persona',
    exploreOptions: 'Turn uncertainty into a practical path forward.',
  },
  Tamil: {
    dashboard: 'டாஷ்போர்டு (Dashboard)',
    realityCheck: 'ரியாலிட்டி செக் (Reality Check)',
    navigator: 'AI வழிகாட்டி (Navigator)',
    compare: 'பாதைகளை ஒப்பிடு (Compare)',
    roadmap: 'எனது கற்றல் பாதை (Roadmap)',
    tasks: 'செய்து கற்றல் (Tasks)',
    mentor: 'AI ஆலோசகர் (Mentor)',
    practice: 'பயிற்சி அரங்கம் (Practice)',
    challenges: 'சவால்கள் (Challenges)',
    community: 'சமூகம் (Community)',
    mentors: 'வழிகாட்டிகள் (Mentors)',
    organizations: 'வாய்ப்புகள் (Opportunities)',
    businessBuilder: 'தொழில் முனைவு (Business)',
    skillPassport: 'திறன் பாஸ்போர்ட் (Passport)',
    settings: 'அமைப்புகள் (Settings)',
    nextBestAction: 'அடுத்த சிறந்த நடவடிக்கை',
    todayTasks: 'இன்றைய பணிகள்',
    activeGoal: 'செயலில் உள்ள இலக்கு',
    progress: 'முன்னேற்றம்',
    demoPersonas: 'டெமோ நபர்கள்',
    switchPersona: 'நபரை மாற்றவும்',
    exploreOptions: 'குழப்பங்களை தெளிவான செயல் திட்டமாக மாற்றுங்கள்.',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('English');

  useEffect(() => {
    const saved = localStorage.getItem('cs_lang') as Language;
    if (saved && (saved === 'English' || saved === 'Tamil')) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('cs_lang', lang);
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || translations.English[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
