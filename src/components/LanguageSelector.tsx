import React from 'react';
import { Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const LanguageSelector: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { i18n } = useTranslation();

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('land_stack_language', lang);
  };

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <Globe className="w-3.5 h-3.5 text-neutral-500" />
      <select
        value={i18n.language}
        onChange={(e) => handleLanguageChange(e.target.value)}
        className="bg-white/90 border border-neutral-300 text-xs font-medium text-neutral-700 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer hover:border-primary transition-colors"
        aria-label="Select Language"
      >
        <option value="en">English (EN)</option>
        <option value="hi">हिन्दी (Hindi)</option>
        <option value="ta">தமிழ் (Tamil)</option>
      </select>
    </div>
  );
};
