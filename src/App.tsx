import React, { useState, useEffect, useRef } from 'react';
import { translations, Language } from './translations';
import { calculateInheritance, DeceasedData, InheritanceResult, HeirDetail } from './calculations';

type HeirType = 
  // Direct heirs
  'father' | 'mother' | 'son' | 'daughter' |
  // Grandparents
  'grandfatherPaternal' | 'grandfatherMaternal' | 'grandmotherPaternal' | 'grandmotherMaternal' |
  // Grandchildren
  'sonOfSon' | 'daughterOfSon' | 'sonOfDaughter' | 'daughterOfDaughter' |
  // Siblings
  'brother' | 'sister' | 'brotherMaternal' | 'sisterMaternal' | 'brotherPaternal' | 'sisterPaternal' |
  // Nephews (brother's sons)
  'brotherSon' | 'sisterSon' | 'brotherSonMaternal' | 'sisterSonMaternal' | 'brotherSonPaternal' | 'sisterSonPaternal' |
  // Nieces (brother's daughters)
  'brotherDaughter' | 'sisterDaughter' | 'brotherDaughterMaternal' | 'sisterDaughterMaternal' | 'brotherDaughterPaternal' | 'sisterDaughterPaternal' |
  // Uncles & Aunts
  'unclePaternal' | 'auntPaternal' | 'uncleMaternal' | 'auntMaternal' |
  'uncleMaternalMaternal' | 'uncleMaternalPaternal' | 'auntMaternalMaternal' | 'auntMaternalPaternal' |
  'unclePaternalPaternal' | 'unclePaternalMaternal' | 'auntPaternalPaternal' | 'auntPaternalMaternal' |
  // Cousins - Paternal uncle's children
  'unclePaternalSon' | 'unclePaternalDaughter' | 
  'unclePaternalSonPaternal' | 'unclePaternalSonMaternal' |
  'unclePaternalDaughterPaternal' | 'unclePaternalDaughterMaternal' |
  // Cousins - Paternal aunt's children
  'auntPaternalSon' | 'auntPaternalDaughter' |
  'auntPaternalSonMaternal' | 'auntPaternalSonPaternal' |
  'auntPaternalDaughterPaternal' | 'auntPaternalDaughterMaternal' |
  // Cousins - Maternal uncle's children
  'uncleMaternalSon' | 'uncleMaternalDaughter' |
  'uncleMaternalSonPaternal' | 'uncleMaternalSonMaternal' |
  'uncleMaternalDaughterPaternal' | 'uncleMaternalDaughterMaternal' |
  // Cousins - Maternal aunt's children
  'auntMaternalSon' | 'auntMaternalDaughter' |
  'auntMaternalSonPaternal' | 'auntMaternalSonMaternal' |
  'auntMaternalDaughterPaternal' | 'auntMaternalDaughterMaternal';

interface HeirGroup {
  id: string;
  title: string;
  heirs: HeirType[];
}

const heirGroups: HeirGroup[] = [
  { 
    id: 'direct', 
    title: 'directHeirs',
    heirs: ['father', 'mother', 'son', 'daughter'] 
  },
  { 
    id: 'grandparents', 
    title: 'grandparents',
    heirs: ['grandfatherPaternal', 'grandfatherMaternal', 'grandmotherPaternal', 'grandmotherMaternal'] 
  },
  { 
    id: 'grandchildren', 
    title: 'grandchildren',
    heirs: ['sonOfSon', 'daughterOfSon', 'sonOfDaughter', 'daughterOfDaughter'] 
  },
  { 
    id: 'siblings', 
    title: 'siblings',
    heirs: ['brother', 'sister', 'brotherMaternal', 'sisterMaternal', 'brotherPaternal', 'sisterPaternal'] 
  },
  { 
    id: 'nephews', 
    title: 'nephews',
    heirs: ['brotherSon', 'sisterSon', 'brotherSonMaternal', 'sisterSonMaternal', 'brotherSonPaternal', 'sisterSonPaternal'] 
  },
  { 
    id: 'nieces', 
    title: 'nieces',
    heirs: ['brotherDaughter', 'sisterDaughter', 'brotherDaughterMaternal', 'sisterDaughterMaternal', 'brotherDaughterPaternal', 'sisterDaughterPaternal'] 
  },
  { 
    id: 'unclesAunts', 
    title: 'unclesAunts',
    heirs: ['unclePaternal', 'auntPaternal', 'uncleMaternal', 'auntMaternal', 
            'uncleMaternalMaternal', 'uncleMaternalPaternal', 'auntMaternalMaternal', 'auntMaternalPaternal',
            'unclePaternalPaternal', 'unclePaternalMaternal', 'auntPaternalPaternal', 'auntPaternalMaternal'] 
  },
  { 
    id: 'cousinsPaternal', 
    title: 'cousinsPaternal',
    heirs: ['unclePaternalSon', 'unclePaternalDaughter', 'auntPaternalSon', 'auntPaternalDaughter',
            'unclePaternalSonPaternal', 'unclePaternalSonMaternal', 'unclePaternalDaughterPaternal', 'unclePaternalDaughterMaternal',
            'auntPaternalSonPaternal', 'auntPaternalSonMaternal', 'auntPaternalDaughterPaternal', 'auntPaternalDaughterMaternal']
  },
  { 
    id: 'cousinsMaternal', 
    title: 'cousinsMaternal',
    heirs: ['uncleMaternalSon', 'uncleMaternalDaughter', 'auntMaternalSon', 'auntMaternalDaughter',
            'uncleMaternalSonPaternal', 'uncleMaternalSonMaternal', 'uncleMaternalDaughterPaternal', 'uncleMaternalDaughterMaternal',
            'auntMaternalSonPaternal', 'auntMaternalSonMaternal', 'auntMaternalDaughterPaternal', 'auntMaternalDaughterMaternal'] 
  }
];

const heirCategories: HeirType[] = [
  'father', 'mother', 'son', 'daughter',
  'grandfatherPaternal', 'grandfatherMaternal', 'grandmotherPaternal', 'grandmotherMaternal',
  'sonOfSon', 'daughterOfSon', 'sonOfDaughter', 'daughterOfDaughter',
  'brother', 'sister', 'brotherMaternal', 'sisterMaternal', 'brotherPaternal', 'sisterPaternal',
  'brotherSon', 'sisterSon', 'brotherSonMaternal', 'sisterSonMaternal', 'brotherSonPaternal', 'sisterSonPaternal',
  'brotherDaughter', 'sisterDaughter', 'brotherDaughterMaternal', 'sisterDaughterMaternal', 'brotherDaughterPaternal', 'sisterDaughterPaternal',
  'unclePaternal', 'auntPaternal', 'uncleMaternal', 'auntMaternal',
  'uncleMaternalMaternal', 'uncleMaternalPaternal', 'auntMaternalMaternal', 'auntMaternalPaternal',
  'unclePaternalPaternal', 'unclePaternalMaternal', 'auntPaternalPaternal', 'auntPaternalMaternal',
  'unclePaternalSon', 'unclePaternalDaughter', 'auntPaternalSon', 'auntPaternalDaughter',
  'unclePaternalSonPaternal', 'unclePaternalSonMaternal', 'unclePaternalDaughterPaternal', 'unclePaternalDaughterMaternal',
  'auntPaternalSonPaternal' as any, 'auntPaternalSonMaternal', 'auntPaternalDaughterPaternal', 'auntPaternalDaughterMaternal',
  'uncleMaternalSon', 'uncleMaternalDaughter', 'auntMaternalSon', 'auntMaternalDaughter',
  'uncleMaternalSonPaternal', 'uncleMaternalSonMaternal', 'uncleMaternalDaughterPaternal', 'uncleMaternalDaughterMaternal',
  'auntMaternalSonPaternal', 'auntMaternalSonMaternal', 'auntMaternalDaughterPaternal', 'auntMaternalDaughterMaternal'
];

const getGender = (type: string): 'male' | 'female' => {
  const maleTypes = [
    'husband', 'father', 'son', 'brother', 'brotherMaternal', 'brotherPaternal',
    'grandfatherPaternal', 'grandfatherMaternal',
    'sonOfSon', 'sonOfDaughter',
    'brotherSon', 'sisterSon', 'brotherSonMaternal', 'sisterSonMaternal', 'brotherSonPaternal', 'sisterSonPaternal',
    'unclePaternal', 'uncleMaternal', 'uncleMaternalMaternal', 'uncleMaternalPaternal',
    'unclePaternalPaternal', 'unclePaternalMaternal',
    'unclePaternalSon', 'unclePaternalSonPaternal', 'unclePaternalSonMaternal',
    'auntPaternalSon', 'auntPaternalSonMaternal', 'auntPaternalSonPaternal',
    'uncleMaternalSon', 'uncleMaternalSonPaternal', 'uncleMaternalSonMaternal',
    'auntMaternalSon', 'auntMaternalSonMaternal', 'auntMaternalSonPaternal'
  ];
  
  if (maleTypes.includes(type)) return 'male';
  return 'female';
};

// Custom Select Component for Inline Form Fields
const CustomInlineSelect = ({ 
  label, 
  value, 
  displayValue,
  options, 
  onChange, 
  themeColor = 'emerald',
  drillDown = false,
  language
}: {
  label: string;
  value: string | number;
  displayValue?: string;
  options: { value: string | number; label: string; isTrigger?: boolean }[];
  onChange: (val: string | number) => void;
  themeColor?: 'emerald' | 'rose';
  drillDown?: boolean;
  language: Language;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showDrillDown, setShowDrillDown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowDrillDown(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const isActive = value !== '0' && value !== 0 && value !== 'no';
  
  const colorMap = {
    emerald: {
      activeBg: 'bg-emerald-50',
      activeText: 'text-emerald-700',
      border: 'border-emerald-500',
      hoverBg: 'hover:bg-emerald-50',
      ring: 'ring-emerald-500',
      selectedBg: 'bg-emerald-100',
    },
    rose: {
      activeBg: 'bg-rose-50',
      activeText: 'text-rose-600',
      border: 'border-rose-400',
      hoverBg: 'hover:bg-rose-50',
      ring: 'ring-rose-400',
      selectedBg: 'bg-rose-100',
    }
  };

  const colors = colorMap[themeColor];

  const subOptions = [
    { label: '1', value: 1 },
    { label: '2', value: 2 },
    { label: '3', value: 3 },
    { label: '4', value: 4 }
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          setShowDrillDown(false);
        }}
        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 transition-all flex items-center justify-between
          ${isOpen ? `ring-2 ${colors.ring} ${colors.border}` : 'border-gray-200'}
          ${isActive ? `${colors.activeBg} ${colors.activeText}` : 'bg-white text-gray-700'}`}
      >
        <span className="font-bold">{displayValue || value}</span>
        <i className={`fas fa-chevron-down text-xs transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}></i>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-2xl z-[1000] overflow-hidden">
          <div className="max-h-48 overflow-y-auto">
            {!showDrillDown ? (
              options.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    if (opt.isTrigger && drillDown) {
                      setShowDrillDown(true);
                    } else {
                      onChange(opt.value);
                      setIsOpen(false);
                    }
                  }}
                  className={`w-full px-4 py-3 text-sm text-center ${colors.hoverBg} transition-colors border-b last:border-0 border-gray-50 flex justify-between items-center
                    ${value.toString() === opt.value.toString() ? `${colors.selectedBg} font-bold ${colors.activeText}` : 'text-gray-700'}`}
                >
                  <span className="flex-1 text-center">{opt.label}</span>
                  {opt.isTrigger && drillDown && <i className={`fas fa-chevron-${language === 'en' ? 'right' : 'left'} text-[10px] text-gray-400 opacity-50`}></i>}
                </button>
              ))
            ) : (
              <>
                <button
                  onClick={() => setShowDrillDown(false)}
                  className="w-full px-4 py-2 text-start text-xs font-bold text-gray-400 hover:bg-gray-50 border-b border-gray-50 flex items-center gap-2"
                >
                  <i className={`fas fa-chevron-${language === 'en' ? 'left' : 'right'}`}></i>
                  {language === 'ar' ? 'رجوع' : language === 'ur' ? 'پیچھے' : 'Back'}
                </button>
                {subOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                      setShowDrillDown(false);
                    }}
                    className={`w-full px-4 py-3 text-sm text-center ${colors.hoverBg} transition-colors border-b last:border-0 border-gray-50
                      ${value.toString() === opt.value.toString() ? `${colors.selectedBg} font-bold ${colors.activeText}` : 'text-gray-700'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Component for Heir Card with Integrated Custom Dropdown Logic
const HeirCard = ({ 
  type, 
  count, 
  onChange, 
  t, 
  language, 
  isActive, 
  isSingleType,
}: {
  type: string, 
  count: number, 
  onChange: (val: number) => void, 
  t: (key: keyof typeof translations.ar) => string, 
  language: Language, 
  isActive: boolean, 
  isSingleType: boolean,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const selectValue = (val: number) => {
    onChange(val);
    setIsOpen(false);
  };

  const activeBlueClasses = {
    bg: 'bg-blue-600',
    bgTint: 'bg-white',
    border: 'border-[#2563eb]',
    btnBg: 'bg-[#f0f7ff]',
    btnBorder: 'border-[#bfdbfe]',
    btnRing: 'ring-[#3b82f6]/20',
    btnText: 'text-[#1e3a8a]',
    dropdownActiveBg: 'bg-[#f0f7ff]',
    dropdownActiveText: 'text-[#1e3a8a]',
    glow: 'shadow-[0_8px_30px_rgba(37,99,235,0.12)]',
    hoverBorder: '',
    hoverBg: '',
    iconColor: 'text-[#2563eb]',
    iconText: 'text-[#2563eb]',
    inactiveBorder: '',
    inactiveBtnBorder: '',
    inactiveBtnHover: '',
    inactiveBtnText: '',
    inactiveText: '',
    lightBg: 'bg-blue-50',
    ring: 'ring-[#2563eb]/20',
    text: 'text-[#1e3a8a]',
  };

  const gender = getGender(type);

  const inactiveClasses = {
    bg: '',
    bgTint: '',
    border: 'border-[#a7f3d0]',
    btnBg: 'bg-white',
    btnBorder: 'border-[#a7f3d0]',
    btnRing: 'ring-emerald-50',
    btnText: 'text-[#0d9488]',
    dropdownActiveBg: 'bg-emerald-50',
    dropdownActiveText: 'text-[#059669]',
    glow: '',
    hoverBg: 'hover:bg-emerald-50/10',
    hoverBorder: 'hover:border-[#6ee7b7]',
    iconColor: 'text-[#0d9488]',
    iconText: 'text-[#0d9488]',
    inactiveBorder: 'border-[#a7f3d0]',
    inactiveBtnBorder: 'border-[#a7f3d0]',
    inactiveBtnHover: 'hover:border-[#6ee7b7]',
    inactiveBtnText: 'text-[#0d9488]',
    inactiveText: gender === 'female' ? 'text-[#db2777]' : 'text-[#0f766e]',
    lightBg: 'bg-emerald-50',
    ring: 'ring-emerald-100',
    text: 'text-[#0f766e]',
  };

  const cc = isActive ? activeBlueClasses : inactiveClasses;

  const minVal = 0;
  const maxVal = 50;
  const options = Array.from({ length: maxVal - minVal + 1 }, (_, i) => minVal + i);

  return (
    <div 
      className={`relative flex flex-col items-center rounded-xl border-2 transition-all duration-300 group bg-white p-2.5 md:p-3
        ${isActive 
          ? `border-[#2563eb] shadow-md shadow-blue-500/10 scale-[1.01] z-10 bg-white`
          : `border-[#a7f3d0] shadow-sm hover:border-[#6ee7b7] hover:shadow-md hover:-translate-y-0.5 ${cc.hoverBg}`}
        ${isOpen ? `z-[100] ring-3 ${cc.ring}` : ''} 
      `}
      ref={dropdownRef}
    >
      {isActive && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange(0);
            }}
            className="absolute -top-2 -left-2 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-md z-30 border-2 border-white transition-colors group/reset"
            title={language === 'ar' ? 'تصفير' : language === 'ur' ? 'صفر کریں' : 'Reset'}
          >
            <i className="fas fa-times text-[8px] group-hover/reset:scale-125 transition-transform"></i>
          </button>
          <div className="absolute -top-2 -right-2 w-5 h-5 bg-[#2563eb] text-white rounded-full flex items-center justify-center shadow-md z-20 border-2 border-white">
            <i className="fas fa-check text-[8px]"></i>
          </div>
        </>
      )}
      
      <span className={`text-[15px] md:text-[18px] font-black text-center leading-tight min-h-[32px] md:min-h-[38px] flex items-center justify-center transition-all duration-300 px-1 mb-2.5
        ${isActive ? `text-[#1e3a8a] scale-102` : cc.inactiveText}`}>
        {t(type as keyof typeof translations.ar)}
      </span>
      
      <div className="relative w-full">
        <button
          type="button"
          onClick={toggleDropdown}
          className={`w-full h-9 px-2 border-2 rounded-xl text-center font-black flex items-center justify-center gap-1.5 transition-all
            ${isActive 
              ? `border-[#bfdbfe] bg-[#f0f7ff] text-[#1e3a8a]`
              : `border-[#a7f3d0] bg-white text-[#0d9488] hover:border-[#6ee7b7]`}
            ${isOpen ? 'ring-2 ring-blue-100' : ''}`}
        >
          <div className="flex items-center justify-center gap-1">
            <i className={`fas fa-chevron-down text-[9px] ${isActive ? 'text-blue-500' : 'text-[#0d9488]'} transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}></i>
            <span className="text-[15px] md:text-[17px] font-black">
              {isSingleType ? (
                count > 0 ? (language === 'ar' ? 'نعم' : language === 'ur' ? 'ہاں' : 'Yes') : (language === 'ar' ? 'لا' : language === 'ur' ? 'نہیں' : 'No')
              ) : (
                count
              )}
            </span>
          </div>
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-100 rounded-xl shadow-[0_10px_35px_rgba(0,0,0,0.15)] z-[110] max-h-56 overflow-y-auto ring-1 ring-black/5">
            {isSingleType ? (
              <>
                <button
                  type="button"
                  onClick={() => selectValue(0)}
                  className={`w-full px-3 py-2.5 text-base text-center border-b border-gray-50 hover:bg-gray-50 transition-colors ${count === 0 ? `${cc.lightBg} ${cc.iconText} font-bold` : 'text-gray-700 font-bold'}`}
                >
                  {language === 'ar' ? 'لا' : language === 'ur' ? 'نہیں' : 'No'}
                </button>
                <button
                  type="button"
                  onClick={() => selectValue(1)}
                  className={`w-full px-3 py-2.5 text-base text-center hover:bg-gray-50 transition-colors ${count === 1 ? `${cc.lightBg} ${cc.iconText} font-bold` : 'text-gray-700 font-bold'}`}
                >
                  {language === 'ar' ? 'نعم' : language === 'ur' ? 'ہاں' : 'Yes'}
                </button>
              </>
            ) : (
              options.map(n => (
                <button
                  key={n}
                  type="button"
                  onClick={() => selectValue(n)}
                  className={`w-full px-3 py-2.5 text-lg text-center border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors ${count === n ? `${cc.lightBg} ${cc.iconText} font-black` : 'text-gray-800 font-bold'}`}
                >
                  {n}
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export function App() {
  const [language, setLanguage] = useState<Language>('ar');
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [results, setResults] = useState<InheritanceResult[]>([]);
  const [isKalala, setIsKalala] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  
  const langMenuRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setIsLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard open/close behavior detection
  useEffect(() => {
    const isInputFocused = () => {
      const active = document.activeElement;
      if (!active) return false;
      const tag = active.tagName.toLowerCase();
      return tag === 'input' || tag === 'textarea' || tag === 'select' || (active as HTMLElement).isContentEditable;
    };

    if (window.visualViewport) {
      const viewport = window.visualViewport;
      const initialHeight = window.innerHeight;
      
      const handleResize = () => {
        const heightDiff = initialHeight - (viewport.height || initialHeight);
        if (heightDiff > 150 && isInputFocused()) {
          setIsKeyboardOpen(true);
        } else {
          setIsKeyboardOpen(false);
        }
      };

      viewport.addEventListener('resize', handleResize);
      return () => viewport.removeEventListener('resize', handleResize);
    } else {
      const handleFocusIn = (e: FocusEvent) => {
        const target = e.target as HTMLElement;
        const tag = target.tagName?.toLowerCase();
        if (tag === 'input' || tag === 'textarea' || tag === 'select') {
          setIsKeyboardOpen(true);
        }
      };
      
      const handleFocusOut = () => {
        setTimeout(() => {
          if (!isInputFocused()) {
            setIsKeyboardOpen(false);
          }
        }, 100);
      };

      document.addEventListener('focusin', handleFocusIn);
      document.addEventListener('focusout', handleFocusOut);
      return () => {
        document.removeEventListener('focusin', handleFocusIn);
        document.removeEventListener('focusout', handleFocusOut);
      };
    }
  }, []);

  const [deceased, setDeceased] = useState<DeceasedData>({
    area: 0,
    gender: 'male',
    name: '',
    religion: 'muslim',
    totalAmount: 0
  });
  
  const [hasSpouse, setHasSpouse] = useState(false);
  const [spouseCount, setSpouseCount] = useState(1);
  
  const [heirs, setHeirs] = useState<Record<HeirType, number>>(() => {
    const obj = {} as Record<HeirType, number>;
    heirCategories.forEach(cat => {
      obj[cat] = 0;
    });
    return obj;
  });

  const [heirDetails, setHeirDetails] = useState<HeirDetail[]>([]);
  const [step2Submitted, setStep2Submitted] = useState(false);

  useEffect(() => {
    if (currentStep === 2 || currentStep === 3) {
      handleCalculate();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, language, heirDetails, deceased.religion]);

  const t = (key: keyof typeof translations.ar) => translations[language][key];

  const getArabicOrdinal = (n: number, isFemale: boolean = false) => {
    if (language !== 'ar') return `${n}`;
    const maleOrdinals = ['الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس', 'السابع', 'الثامن', 'التاسع', 'العاشر'];
    const femaleOrdinals = ['الأولى', 'الثانية', 'الثالثة', 'الرابعة', 'الخامسة', 'السادسة', 'السابعة', 'الثامنة', 'التاسعة', 'العاشرة'];
    const ordinals = isFemale ? femaleOrdinals : maleOrdinals;
    return ordinals[n - 1] || `${n}`;
  };

  const getSingularHeirName = (type: string) => {
    return t(type as keyof typeof translations.ar);
  };

  const formatNumber = (num: number, decimals: number = 2) => {
    return num.toLocaleString(language === 'ar' ? 'ar-SA' : language === 'ur' ? 'ur-PK' : 'en-US', {
      maximumFractionDigits: decimals,
      minimumFractionDigits: decimals
    });
  };

  const getHeirSortOrder = (heirType: string): number => {
    const order: Record<string, number> = {
      'husband': 1, 'wife': 2,
      'father': 10, 'mother': 11,
      'son': 20, 'daughter': 21,
      'grandfatherPaternal': 30, 'grandmotherPaternal': 31,
      'grandfatherMaternal': 32, 'grandmotherMaternal': 33,
      'sonOfSon': 40, 'daughterOfSon': 41, 'sonOfDaughter': 42, 'daughterOfDaughter': 43,
      'brother': 50, 'sister': 51,
      'brotherPaternal': 52, 'sisterPaternal': 53,
      'brotherMaternal': 54, 'sisterMaternal': 55,
      'brotherSon': 60, 'brotherDaughter': 61, 'sisterSon': 62, 'sisterDaughter': 63,
      'brotherSonPaternal': 64, 'brotherDaughterPaternal': 65, 'sisterSonPaternal': 66, 'sisterDaughterPaternal': 67,
      'brotherSonMaternal': 68, 'brotherDaughterMaternal': 69, 'sisterSonMaternal': 70, 'sisterDaughterMaternal': 71,
      'unclePaternal': 80, 'auntPaternal': 81,
      'unclePaternalPaternal': 82, 'auntPaternalPaternal': 83,
      'unclePaternalMaternal': 84, 'auntPaternalMaternal': 85,
      'uncleMaternal': 86, 'auntMaternal': 87,
      'uncleMaternalPaternal': 88, 'auntMaternalPaternal': 89,
      'uncleMaternalMaternal': 90, 'auntMaternalMaternal': 91,
      'unclePaternalSon': 100, 'unclePaternalDaughter': 101, 'auntPaternalSon': 102, 'auntPaternalDaughter': 103,
      'unclePaternalSonPaternal': 104, 'unclePaternalDaughterPaternal': 105, 'auntPaternalSonPaternal': 106, 'auntPaternalDaughterPaternal': 107,
      'unclePaternalSonMaternal': 108, 'unclePaternalDaughterMaternal': 109, 'auntPaternalSonMaternal': 110, 'auntPaternalDaughterMaternal': 111,
      'uncleMaternalSon': 112, 'uncleMaternalDaughter': 113, 'auntMaternalSon': 114, 'auntMaternalDaughter': 115,
      'uncleMaternalSonPaternal': 116, 'uncleMaternalDaughterPaternal': 117, 'auntMaternalSonPaternal': 118, 'auntMaternalDaughterPaternal': 119,
      'uncleMaternalSonMaternal': 120, 'uncleMaternalDaughterMaternal': 121, 'auntMaternalSonMaternal': 122, 'auntMaternalDaughterMaternal': 123,
    };
    return order[heirType] ?? 999;
  };

  const generateHeirDetails = () => {
    const newDetails: HeirDetail[] = [];
    
    if (hasSpouse) {
      const spouseType = deceased.gender === 'male' ? 'wife' : 'husband';
      const count = deceased.gender === 'male' ? spouseCount : 1;
      for (let i = 0; i < count; i++) {
        const id = `${spouseType}-${i}`;
        const existing = heirDetails.find(h => h.id === id);
        newDetails.push(existing || {
          id,
          name: '',
          religion: 'muslim',
          type: spouseType
        });
      }
    }

    Object.entries(heirs).forEach(([type, count]) => {
      const countNum = count as number;
      if (countNum > 0) {
        for (let i = 0; i < countNum; i++) {
          const id = `${type}-${i}`;
          const existing = heirDetails.find(h => h.id === id);
          newDetails.push(existing || {
            id,
            name: '',
            religion: 'muslim',
            type: type as HeirType
          });
        }
      }
    });

    const sortedDetails = [...newDetails].sort((a, b) => {
      return getHeirSortOrder(a.type) - getHeirSortOrder(b.type);
    });

    setHeirDetails(sortedDetails);
    return sortedDetails;
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
        const totalHeirs = Object.values(heirs).reduce((a, b) => (a as number) + (b as number), 0);
        if (!hasSpouse && totalHeirs === 0) {
            setShowErrorModal(true);
            return;
        }
        const details = generateHeirDetails();
        handleCalculate(details);
        setCurrentStep(2);
        window.scrollTo({ behavior: 'smooth', top: 0 });
    } else if (currentStep === 2) {
        setStep2Submitted(true);
        const relatedThroughTypes = [
          'sonOfSon', 'daughterOfSon', 'sonOfDaughter', 'daughterOfDaughter',
          'brotherSon', 'sisterSon', 'brotherSonMaternal', 'sisterSonMaternal', 'brotherSonPaternal', 'sisterSonPaternal',
          'brotherDaughter', 'sisterDaughter', 'brotherDaughterMaternal', 'sisterDaughterMaternal', 'brotherDaughterPaternal', 'sisterDaughterPaternal',
          'unclePaternalSon', 'unclePaternalDaughter', 'auntPaternalSon', 'auntPaternalDaughter',
          'unclePaternalSonPaternal', 'unclePaternalSonMaternal', 'unclePaternalDaughterPaternal', 'unclePaternalDaughterMaternal',
          'auntPaternalSonMaternal', 'auntPaternalSonPaternal' as any, 'auntPaternalDaughterPaternal', 'auntPaternalDaughterMaternal',
          'uncleMaternalSon', 'uncleMaternalDaughter', 'auntMaternalSon', 'auntMaternalDaughter',
          'uncleMaternalSonPaternal', 'uncleMaternalSonMaternal', 'uncleMaternalDaughterPaternal', 'uncleMaternalDaughterMaternal',
          'auntMaternalSonPaternal', 'auntMaternalSonMaternal', 'auntMaternalDaughterPaternal', 'auntMaternalDaughterMaternal'
        ];

        const grandchildrenTypes = ['sonOfSon', 'daughterOfSon', 'sonOfDaughter', 'daughterOfDaughter'];
        const nephewNieceTypes = [
          'brotherSon', 'sisterSon', 'brotherSonMaternal', 'sisterSonMaternal', 'brotherSonPaternal', 'sisterSonPaternal',
          'brotherDaughter', 'sisterDaughter', 'brotherDaughterMaternal', 'sisterDaughterMaternal', 'brotherDaughterPaternal', 'sisterDaughterPaternal'
        ];
        const paternalCousinTypes = [
          'unclePaternalSon', 'unclePaternalDaughter', 'auntPaternalSon', 'auntPaternalDaughter',
          'unclePaternalSonPaternal', 'unclePaternalSonMaternal', 'unclePaternalDaughterPaternal', 'unclePaternalDaughterMaternal',
          'auntPaternalSonMaternal', 'auntPaternalSonPaternal' as any, 'auntPaternalDaughterPaternal', 'auntPaternalDaughterMaternal'
        ];
        const maternalCousinTypes = [
          'uncleMaternalSon', 'uncleMaternalDaughter', 'auntMaternalSon', 'auntMaternalDaughter',
          'uncleMaternalSonPaternal', 'uncleMaternalSonMaternal', 'uncleMaternalDaughterPaternal', 'uncleMaternalDaughterMaternal',
          'auntMaternalSonPaternal', 'auntMaternalSonMaternal', 'auntMaternalDaughterPaternal', 'auntMaternalDaughterMaternal'
        ];

        const getGroupCount = (type: string) => {
          let targetGroup: string[] = [];
          if (grandchildrenTypes.includes(type)) targetGroup = grandchildrenTypes;
          else if (nephewNieceTypes.includes(type)) targetGroup = nephewNieceTypes;
          else if (paternalCousinTypes.includes(type)) targetGroup = paternalCousinTypes;
          else if (maternalCousinTypes.includes(type)) targetGroup = maternalCousinTypes;
          else return 0;
          
          return heirDetails.filter(hd => 
            targetGroup.includes(hd.type) && !results.find(r => r.heirId === hd.id)?.isBlocked
          ).length;
        };

        const missingMandatory = heirDetails.some(h => {
          if (results.find(r => r.heirId === h.id)?.isBlocked) return false;
          if (!relatedThroughTypes.includes(h.type)) return false;
          const isMaternalNephewNiece = ['brotherSonMaternal', 'sisterSonMaternal', 'brotherDaughterMaternal', 'sisterDaughterMaternal'].includes(h.type);
          const isMandatory = !isMaternalNephewNiece && getGroupCount(h.type) >= 2;
          return isMandatory && !(h.parentName || '').trim();
        });

        if (missingMandatory) {
          window.scrollTo({ behavior: 'smooth', top: 0 });
          return;
        }

        handleCalculate();
        setCurrentStep(3);
        window.scrollTo({ behavior: 'smooth', top: 0 });
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
    window.scrollTo({ behavior: 'smooth', top: 0 });
  };

  const handleCalculate = (details?: HeirDetail[]) => {
    const { results: calcResults, isKalala: kalala } = calculateInheritance(deceased, details || heirDetails, language);
    setResults(calcResults);
    setIsKalala(kalala);
  };

  const handleReset = () => {
    setDeceased({ area: 0, gender: 'male', name: '', religion: 'muslim', totalAmount: 0 });
    setHasSpouse(false);
    setSpouseCount(1);
    const cleared = {} as Record<HeirType, number>;
    heirCategories.forEach(k => {
      cleared[k] = 0;
    });
    setHeirs(cleared);
    setHeirDetails([]);
    setCurrentStep(1);
    setResults([]);
    setIsKalala(false);
    window.scrollTo({ behavior: 'smooth', top: 0 });
  };

  const updateHeirDetail = (id: string, field: keyof HeirDetail, value: string) => {
    setHeirDetails(prev => prev.map(h => h.id === id ? { ...h, [field]: value } : h));
  };

  const totalPercentage = results.reduce((sum, r) => sum + r.percentage, 0);

  const sortedResults = [...results].sort((a, b) => {
    const orderA = getHeirSortOrder(a.heirType);
    const orderB = getHeirSortOrder(b.heirType);
    return orderA - orderB;
  });

  const showNameColumn = sortedResults.some(r => !r.isBlocked && r.heirName?.trim());

  const isGlobalRed = deceased.religion === 'nonMuslim';
  const bgGradient = "bg-gradient-to-br from-emerald-50 via-white to-teal-50";

  return (
    <div 
      ref={topRef}
      className={`min-h-screen ${bgGradient} font-[Tajawal] transition-colors duration-500`}
      dir={language === 'en' ? 'ltr' : 'rtl'}
    >
      <header className={`w-full z-[1000] text-white shadow-lg shadow-black/5 transition-all duration-300 print:hidden relative
        ${isKeyboardOpen ? 'relative' : 'sticky top-0'}
        bg-gradient-to-r from-emerald-700 via-[#00965e] to-teal-800`}>
        
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
           <div className="absolute top-0 left-0 w-full h-full opacity-20">
             <div className="absolute top-[-50%] left-[-10%] w-[50%] h-[200%] bg-white/10 rounded-full blur-3xl transform rotate-12"></div>
             <div className="absolute bottom-[-50%] right-[-10%] w-[50%] h-[200%] bg-white/10 rounded-full blur-3xl transform -rotate-12"></div>
           </div>
        </div>

        <div className="container mx-auto px-4 max-w-5xl h-[56px] md:h-[64px] relative z-10 flex items-center justify-between gap-2">
            
            <button
              onClick={handleReset}
              className="shrink-0 group relative flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 md:py-1.5 rounded-lg bg-white/15 hover:bg-white/25 border border-white/20 text-white text-[9px] md:text-[11px] font-bold transition-all duration-300 backdrop-blur-sm hover:scale-105 active:scale-95 shadow-lg"
              title={t('reset')}
            >
              <span className="whitespace-nowrap drop-shadow-sm">{t('reset')}</span>
              <div className="w-3.5 h-3.5 md:w-4.5 md:h-4.5 rounded-full bg-white/20 flex items-center justify-center group-hover:rotate-180 transition-transform duration-500">
                <i className="fas fa-redo-alt text-[7px] md:text-[9px] transform scale-x-[-1]"></i>
              </div>
            </button>

            <div className="flex-1 flex justify-center items-center min-w-0 mx-1 md:mx-4">
              <div className="flex items-center justify-center px-1 py-1 md:px-4 md:py-1.5 rounded-xl">
                <h1 className="text-[11px] sm:text-[12px] md:text-[18px] font-bold text-white tracking-wide drop-shadow-md whitespace-nowrap">
                  {language === 'ar' ? 'حاسبة المواريث الإسماعيلية' : language === 'ur' ? 'اسماعیلی وраثت کیلکولیٹر' : 'Ismaili Inheritance Calculator'}
                </h1>
              </div>
            </div>

            <div className="shrink-0 relative z-50" ref={langMenuRef}>
              <button
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className="group flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-white text-[10px] md:text-xs font-bold transition-all duration-300 backdrop-blur-sm hover:scale-105 active:scale-95 shadow-lg"
              >
                <div className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-white/20 flex items-center justify-center">
                   <i className="fas fa-globe text-[8px] md:text-[10px]"></i>
                </div>
                <span className="whitespace-nowrap drop-shadow-sm hidden sm:inline">
                  {language === 'ar' ? 'العربية' : language === 'ur' ? 'اردو' : 'English'}
                </span>
                <span className="whitespace-nowrap drop-shadow-sm inline sm:hidden">
                  {language === 'ar' ? 'عربي' : language === 'ur' ? 'اردو' : 'EN'}
                </span>
                <i className={`fas fa-chevron-down text-[8px] transition-transform duration-300 ${isLangMenuOpen ? 'rotate-180' : ''} opacity-70`}></i>
              </button>

              {isLangMenuOpen && (
                <div className={`absolute top-full mt-2 ${language === 'en' ? 'right-0' : 'left-0'} w-40 bg-white rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] ring-1 ring-black/5 overflow-hidden z-[99999] text-gray-800`}>
                  <button onClick={() => { setLanguage('ar'); setIsLangMenuOpen(false); }} className="w-full text-start px-4 py-3 hover:bg-gray-50 transition-colors flex justify-between items-center text-xs font-bold border-b border-gray-100">
                    <span className="flex gap-2 items-center"><span className="text-lg">🇸🇦</span> العربية</span>
                    {language === 'ar' && <i className="fas fa-check text-emerald-600"></i>}
                  </button>
                  <button onClick={() => { setLanguage('en'); setIsLangMenuOpen(false); }} className="w-full text-start px-4 py-3 hover:bg-gray-50 transition-colors flex justify-between items-center text-xs font-bold border-b border-gray-100">
                    <span className="flex gap-2 items-center"><span className="text-lg">🇺🇸</span> English</span>
                    {language === 'en' && <i className="fas fa-check text-emerald-600"></i>}
                  </button>
                  <button onClick={() => { setLanguage('ur'); setIsLangMenuOpen(false); }} className="w-full text-start px-4 py-3 hover:bg-gray-50 transition-colors flex justify-between items-center text-xs font-bold">
                    <span className="flex gap-2 items-center"><span className="text-lg">🇵🇰</span> Urdu</span>
                    {language === 'ur' && <i className="fas fa-check text-emerald-600"></i>}
                  </button>
                </div>
              )}
            </div>

        </div>
      </header>

      <div className={`bg-white border-b border-gray-100 shadow-sm z-40 print:hidden transition-all duration-300 py-1.5
        ${isKeyboardOpen ? 'relative' : 'sticky top-[56px] md:top-[64px]'}`}>
        <div className="container mx-auto px-4">
            <div className="flex items-center justify-center w-full max-w-xl mx-auto">
                {[
                  { label: 'step1', num: 1 },
                  { label: 'step2', num: 2 },
                  { label: 'step3', num: 3 }
                ].map((step, index, array) => (
                    <div key={step.num} className="flex items-center flex-1 last:flex-none relative">
                        {currentStep === step.num ? (
                           <div className={`px-2 py-0.5 rounded-full border text-[10px] font-bold flex items-center gap-1.5 z-10
                              bg-white border-[#00965e] text-[#00965e]`}>
                              <i className="fas fa-clock text-[8px]"></i>
                              {t(step.label as keyof typeof translations.ar)}
                           </div>
                        ) : currentStep > step.num ? (
                           <div className="w-5 h-5 rounded-full flex items-center justify-center text-white z-10 bg-[#00965e]">
                              <i className="fas fa-check text-[8px]"></i>
                           </div>
                        ) : (
                           <div className="w-5 h-5 rounded-full border-2 border-gray-300 bg-white z-10"></div>
                        )}

                        {index < array.length - 1 && (
                            <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-[2px] bg-gray-200 -z-0">
                                <div className={`h-full transition-all duration-500 ease-out
                                    ${currentStep > step.num ? 'w-full bg-[#00965e]' : 'w-0'}`}>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8 pb-64 max-w-5xl shadow-2xl min-h-screen bg-white relative">

        {currentStep === 1 && (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 print:hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="p-5 rounded-2xl border flex items-start gap-4 transition-colors duration-500 bg-emerald-50 border-emerald-100 text-emerald-800">
                  <div className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-emerald-100 text-emerald-600">
                    <i className="fas fa-info-circle text-lg"></i>
                  </div>
                  <p className="text-sm md:text-base font-bold leading-relaxed">
                    {t('step1Instruction')}
                  </p>
                </div>
              </div>

              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full flex items-center justify-center text-sm transition-colors bg-emerald-100 text-emerald-600">
                    <i className="fas fa-user"></i>
                  </span>
                  {t('deceasedInfo')}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="md:col-span-2 lg:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('deceasedName')} <span className="text-gray-400 text-xs font-normal">({t('optional')})</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={deceased.name || ''}
                        onChange={(e) => setDeceased({...deceased, name: e.target.value})}
                        className="w-full px-4 py-3 pr-10 border rounded-xl focus:ring-2 transition-all border-gray-200 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder={t('enterName')}
                      />
                      <span className={`absolute ${language === 'en' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-gray-400`}>
                        <i className="fas fa-user-edit"></i>
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('gender')}
                    </label>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setDeceased({...deceased, gender: 'male'});
                          setHasSpouse(false);
                          setSpouseCount(1);
                        }}
                        className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all flex items-center justify-center gap-2
                          ${deceased.gender === 'male' 
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                            : 'border-gray-200 hover:border-gray-300'}`}
                      >
                        <i className="fas fa-mars"></i>
                        {t('male')}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setDeceased({...deceased, gender: 'female'});
                          setHasSpouse(false);
                          setSpouseCount(1);
                        }}
                        className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all flex items-center justify-center gap-2
                          ${deceased.gender === 'female' 
                            ? 'border-pink-500 bg-pink-50 text-pink-700' 
                            : 'border-gray-200 hover:border-gray-300'}`}
                      >
                        <i className="fas fa-venus"></i>
                        {t('female')}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('religion')}
                    </label>
                    <div className="relative">
                      <div
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 font-bold flex items-center justify-between cursor-not-allowed"
                      >
                        <span>{t('muslim')}</span>
                        <i className="fas fa-lock text-xs opacity-30"></i>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('totalAmount')} <span className="text-gray-400 text-xs font-normal">
                        ({t('optional')})
                      </span>
                    </label>
                    <div className="relative group">
                      <div className="absolute left-0 inset-y-0 h-12 w-12 flex items-center justify-center pointer-events-none z-10">
                        <i className="fas fa-money-bill-wave text-lg text-emerald-500"></i>
                      </div>
                      <input
                        type="number"
                        value={deceased.totalAmount || ''}
                        onChange={(e) => setDeceased({...deceased, totalAmount: parseFloat(e.target.value) || 0})}
                        className="w-full pl-12 pr-4 h-12 border rounded-xl focus:ring-2 transition-all text-sm font-bold border-gray-200 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('area')} <span className="text-gray-400 text-xs font-normal">
                        ({t('optional')})
                      </span>
                    </label>
                    <div className="relative group">
                      <div className="absolute left-0 inset-y-0 h-12 w-12 flex items-center justify-center pointer-events-none z-10">
                        <i className="fas fa-ruler-combined text-lg text-gray-400"></i>
                      </div>
                      <input
                        type="number"
                        value={deceased.area || ''}
                        onChange={(e) => setDeceased({...deceased, area: parseFloat(e.target.value) || 0})}
                        className="w-full pl-12 pr-4 h-12 border rounded-xl focus:ring-2 transition-all text-sm font-bold border-gray-200 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>

                  {deceased.gender === 'male' ? (
                    <CustomInlineSelect
                      label={t('wife')}
                      value={hasSpouse ? spouseCount : 0}
                      displayValue={hasSpouse && spouseCount > 0 ? spouseCount.toString() : t('no')}
                      themeColor="emerald"
                      language={language}
                      drillDown={false}
                      options={[
                        { label: t('no'), value: 0 },
                        { label: '1', value: 1 },
                        { label: '2', value: 2 },
                        { label: '3', value: 3 },
                        { label: '4', value: 4 }
                      ]}
                      onChange={(val) => {
                        const numVal = parseInt(val as string);
                        if (numVal === 0) {
                          setHasSpouse(false);
                          setSpouseCount(0);
                        } else {
                          setHasSpouse(true);
                          setSpouseCount(numVal);
                        }
                      }}
                    />
                  ) : (
                    <CustomInlineSelect
                      label={t('husband')}
                      value={hasSpouse ? 'yes' : 'no'}
                      displayValue={hasSpouse ? t('yes') : t('no')}
                      themeColor="emerald"
                      language={language}
                      options={[
                        { label: t('no'), value: 'no' },
                        { label: t('yes'), value: 'yes' }
                      ]}
                      onChange={(val) => setHasSpouse(val === 'yes')}
                    />
                  )}
                </div>
              </div>

              <div className="p-6 pb-48">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full flex items-center justify-center text-sm transition-colors bg-teal-100 text-teal-600">
                    <i className="fas fa-users"></i>
                  </span>
                  {t('heirsCategories')}
                </h2>

                <div className="space-y-8">
                  {heirGroups.map((group, index) => (
                    <div key={group.id}>
                      {index > 0 && (
                        <div className="relative flex items-center justify-center my-8">
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t-2 transition-colors duration-500 border-emerald-100"></div>
                          </div>
                          <div className="relative flex justify-center">
                            <div className="w-2 h-2 rounded-full ring-4 ring-white transition-all duration-500 animate-pulse bg-emerald-400 shadow-lg shadow-emerald-200"></div>
                          </div>
                        </div>
                      )}

                      <h3 className="text-lg font-bold text-gray-700 mb-4 text-center">{t(group.title as keyof typeof translations.ar)}</h3>

                      <div className="flex flex-wrap justify-center gap-3 md:gap-4">
                        {group.heirs.map((type) => {
                          const isActive = heirs[type] > 0;
                          const isSingleType = type === 'father' || type === 'mother' || 
                                              type === 'grandfatherPaternal' || type === 'grandfatherMaternal' || 
                                              type === 'grandmotherPaternal' || type === 'grandmotherMaternal';
                          
                          return (
                            <div key={type} className="w-[44%] sm:w-[29%] md:w-[21%] lg:w-[17%] xl:w-[13%] min-w-[105px] md:min-w-[120px]">
                              <HeirCard
                                type={type}
                                count={heirs[type]}
                                onChange={(val) => setHeirs(prev => ({...prev, [type]: val}))}
                                t={t}
                                language={language}
                                isActive={isActive}
                                isSingleType={isSingleType}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
        )}

        {currentStep === 2 && (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 print:hidden mb-6">
                {(() => {
                  const grandchildTypes = ['sonOfSon', 'daughterOfSon', 'sonOfDaughter', 'daughterOfDaughter'];
                  const nephewTypes = [
                    'brotherSon', 'sisterSon', 'brotherSonMaternal', 'sisterSonMaternal', 'brotherSonPaternal', 'sisterSonPaternal',
                    'brotherDaughter', 'sisterDaughter', 'brotherDaughterMaternal', 'sisterDaughterMaternal', 'brotherDaughterPaternal', 'sisterDaughterPaternal'
                  ];
                  
                  const hasActiveGrandchildren = heirDetails.some(h => 
                    grandchildTypes.includes(h.type) && !results.find(r => r.heirId === h.id)?.isBlocked
                  );
                  const cousinPaternalTypes = [
                    'unclePaternalSon', 'unclePaternalDaughter', 'auntPaternalSon', 'auntPaternalDaughter',
                    'unclePaternalSonPaternal', 'unclePaternalSonMaternal', 'unclePaternalDaughterPaternal', 'unclePaternalDaughterMaternal',
                    'auntPaternalSonMaternal', 'auntPaternalSonPaternal', 'auntPaternalDaughterPaternal', 'auntPaternalDaughterMaternal'
                  ];
                  
                  const hasActiveNephews = heirDetails.some(h => 
                    nephewTypes.includes(h.type) && !results.find(r => r.heirId === h.id)?.isBlocked
                  );
                  const hasActiveCousinsPaternal = heirDetails.some(h => 
                    cousinPaternalTypes.includes(h.type) && !results.find(r => r.heirId === h.id)?.isBlocked
                  );
                  const cousinMaternalTypes = [
                    'uncleMaternalSon', 'uncleMaternalDaughter', 'auntMaternalSon', 'auntMaternalDaughter',
                    'uncleMaternalSonPaternal', 'uncleMaternalSonMaternal', 'uncleMaternalDaughterPaternal', 'uncleMaternalDaughterMaternal',
                    'auntMaternalSonPaternal', 'auntMaternalSonMaternal', 'auntMaternalDaughterPaternal', 'auntMaternalDaughterMaternal'
                  ];
                  const hasActiveCousinsMaternal = heirDetails.some(h => 
                    cousinMaternalTypes.includes(h.type) && !results.find(r => r.heirId === h.id)?.isBlocked
                  );

                  if (!hasActiveGrandchildren && !hasActiveNephews && !hasActiveCousinsPaternal && !hasActiveCousinsMaternal) return null;

                  return (
                    <div className="p-6 border-b border-gray-100 space-y-4">
                      {hasActiveGrandchildren && (
                        <div className="p-5 rounded-2xl border flex items-start gap-4 transition-colors duration-500 bg-emerald-50 border-emerald-100 text-emerald-800">
                          <div className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-emerald-100 text-emerald-600">
                            <i className="fas fa-info-circle text-lg"></i>
                          </div>
                          <p className="text-sm md:text-base font-bold leading-relaxed whitespace-pre-line">
                            {t('step2GrandchildrenInstruction')}
                          </p>
                        </div>
                      )}
                      
                      {hasActiveNephews && (
                        <div className="p-5 rounded-2xl border flex items-start gap-4 transition-colors duration-500 bg-emerald-50 border-emerald-100 text-emerald-800">
                          <div className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-emerald-100 text-emerald-600">
                            <i className="fas fa-info-circle text-lg"></i>
                          </div>
                          <p className="text-sm md:text-base font-bold leading-relaxed whitespace-pre-line">
                            {t('step2NephewsInstruction')}
                          </p>
                        </div>
                      )}

                      {hasActiveCousinsPaternal && (
                        <div className="p-5 rounded-2xl border flex items-start gap-4 transition-colors duration-500 bg-emerald-50 border-emerald-100 text-emerald-800">
                          <div className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-emerald-100 text-emerald-600">
                            <i className="fas fa-info-circle text-lg"></i>
                          </div>
                          <p className="text-sm md:text-base font-bold leading-relaxed whitespace-pre-line">
                            {t('step2CousinsPaternalInstruction')}
                          </p>
                        </div>
                      )}

                      {hasActiveCousinsMaternal && (
                        <div className="p-5 rounded-2xl border flex items-start gap-4 transition-colors duration-500 bg-emerald-50 border-emerald-100 text-emerald-800">
                          <div className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-emerald-100 text-emerald-600">
                            <i className="fas fa-info-circle text-lg"></i>
                          </div>
                          <p className="text-sm md:text-base font-bold leading-relaxed whitespace-pre-line">
                            {t('step2CousinsMaternalInstruction')}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })()}

                <div className="p-6 border-b transition-colors duration-500 text-white bg-gradient-to-r from-emerald-600 to-teal-600 border-emerald-600">
                    <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <i className="fas fa-info-circle"></i>
                        {t('deceasedInfo')}
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                        {deceased.name && (
                          <div className="bg-white/10 backdrop-blur-sm p-3 rounded-lg border border-white/20">
                              <span className="block text-emerald-100">{t('deceasedName')}</span>
                              <span className="font-bold text-white truncate block max-w-[120px]" title={deceased.name}>{deceased.name}</span>
                          </div>
                        )}
                        <div className="bg-white/10 backdrop-blur-sm p-3 rounded-lg border border-white/20">
                            <span className="block text-emerald-100">{t('gender')}</span>
                            <span className="font-bold text-white">{deceased.gender === 'male' ? t('male') : t('female')}</span>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm p-3 rounded-lg border border-white/20">
                            <span className="block text-emerald-100">{t('religion')}</span>
                            <span className="font-bold text-white">
                                {deceased.gender === 'male' ? t('muslimMale') : t('muslimFemale')}
                            </span>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm p-3 rounded-lg border border-white/20">
                            <span className="block text-emerald-100">{t('totalAmount')}</span>
                            <span className="font-bold text-white">
                                {deceased.totalAmount > 0 ? formatNumber(deceased.totalAmount) : '-'}
                            </span>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm p-3 rounded-lg border border-white/20">
                            <span className="block text-emerald-100">{t('area')}</span>
                            <span className="font-bold text-white">
                                {deceased.area > 0 ? formatNumber(deceased.area) : '-'}
                            </span>
                        </div>
                    </div>
                </div>
                
                <div className="p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-6">{t('heirsInfo')}</h2>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            {(() => {
                              const relatedThroughTypes = [
                                'sonOfSon', 'daughterOfSon', 'sonOfDaughter', 'daughterOfDaughter',
                                'brotherSon', 'sisterSon', 'brotherSonMaternal', 'sisterSonMaternal', 'brotherSonPaternal', 'sisterSonPaternal',
                                'brotherDaughter', 'sisterDaughter', 'brotherDaughterMaternal', 'sisterDaughterMaternal', 'brotherDaughterPaternal', 'sisterDaughterPaternal',
                                'unclePaternalSon', 'unclePaternalDaughter', 'auntPaternalSon', 'auntPaternalDaughter',
                                'unclePaternalSonPaternal', 'unclePaternalSonMaternal', 'unclePaternalDaughterPaternal', 'unclePaternalDaughterMaternal',
                                'auntPaternalSonMaternal', 'auntPaternalSonPaternal' as any, 'auntPaternalDaughterPaternal', 'auntPaternalDaughterMaternal',
                                'uncleMaternalSon', 'uncleMaternalDaughter', 'auntMaternalSon', 'auntMaternalDaughter',
                                'uncleMaternalSonPaternal', 'uncleMaternalSonMaternal', 'uncleMaternalDaughterPaternal', 'uncleMaternalDaughterMaternal',
                                'auntMaternalSonPaternal', 'auntMaternalSonMaternal', 'auntMaternalDaughterPaternal', 'auntMaternalDaughterMaternal'
                              ];
                              const hasRelatedThrough = heirDetails.some(h => 
                                relatedThroughTypes.includes(h.type) && 
                                !results.find(r => r.heirId === h.id)?.isBlocked
                              );
                              return (
                                <>
                                  <thead className="bg-gray-50">
                                      <tr>
                                          <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600 w-16">{t('serial')}</th>
                                          <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">{t('category')}</th>
                                          <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">{t('heirName')}</th>
                                          <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">{t('heirReligion')}</th>
                                          {hasRelatedThrough && <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">{t('deceasedParentName')}</th>}
                                      </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-100">
                                      {heirDetails.map((heir, index) => {
                                          const isHeirNonMuslim = heir.religion === 'nonMuslim';
                                          const result = results.find(r => r.heirId === heir.id);
                                          const isRelatedThroughType = relatedThroughTypes.includes(heir.type);
                                          
                                          return (
                                              <tr key={heir.id} className={`transition-colors ${isHeirNonMuslim ? 'bg-rose-50 hover:bg-rose-100' : 'hover:bg-gray-50'}`}>
                                                  <td className={`px-4 py-3 text-sm ${isHeirNonMuslim ? 'text-rose-600 font-bold' : 'text-gray-500'}`}>{index + 1}</td>
                                                  <td className={`px-4 py-3 font-medium ${isHeirNonMuslim ? 'text-rose-700' : 'text-gray-800'}`}>
                                                      <div className="flex items-center gap-2">
                                                          {(() => {
                                                              const typeBase = heir.id.split('-')[0];
                                                              const idx = parseInt(heir.id.split('-')[1]);
                                                              const totalOfThisType = heirDetails.filter(h => h.id.startsWith(`${typeBase}-`)).length;
                                                              const isFemaleHeir = getGender(heir.type) === 'female';
                                                              
                                                              let name: string;
                                                              
                                                              if (language === 'ar') {
                                                                const singular = getSingularHeirName(typeBase);
                                                                if (totalOfThisType > 1) {
                                                                  name = `${singular} ${getArabicOrdinal(idx + 1, isFemaleHeir)}`;
                                                                } else {
                                                                  name = singular;
                                                                }
                                                              } else {
                                                                name = heir.type === 'wife' ? t('wife') : heir.type === 'husband' ? t('husband') : t(heir.type as keyof typeof translations.ar);
                                                                if (totalOfThisType > 1) {
                                                                  name = `${name} ${idx + 1}`;
                                                                }
                                                              }
                                                              
                                                              return (
                                                                  <>
                                                                      <span>{name}</span>
                                                                      {isHeirNonMuslim && (
                                                                          <span className="bg-rose-600 text-white text-[10px] px-2 py-0.5 rounded-full uppercase tracking-tighter mx-1">
                                                                              {t('nonMuslim')}
                                                                          </span>
                                                                      )}
                                                                  </>
                                                              );
                                                          })()}
                                                      </div>
                                                  </td>
                                                  <td className="px-4 py-3">
                                                      {(() => {
                                                        if (result?.isBlocked) {
                                                          let reason = '';
                                                          if (result.blockedByReligion) {
                                                            reason = t('heirBlockedByReligion');
                                                          } else if (result.blockedByParentsDual) {
                                                            reason = language === 'ar' ? 'وجود الاب والام مع الجدتان يحجبهما' : 
                                                                     language === 'ur' ? 'والد اور والدہ کی دو دادیوں/نانیوں کے ساتھ موجودگی انہیں محروم کر دیتی ہے' :
                                                                     'Presence of Father and Mother with two grandmothers excludes them';
                                                          } else {
                                                            reason = t('heirBlockedBy') + getSingularHeirName(result.blockedBy || '');
                                                          }
                                                          return (
                                                            <div className="text-[10px] md:text-xs text-red-600 font-black leading-tight flex flex-col gap-1">
                                                              <div className="flex items-center gap-1.5 text-[10px] md:text-[11px] font-black bg-red-50 py-1 px-2 rounded-lg w-fit border border-red-100">
                                                                <i className="fas fa-ban"></i>
                                                                {reason}
                                                              </div>
                                                            </div>
                                                          );
                                                        }
                                                        return (
                                                          <input 
                                                            type="text"
                                                            value={heir.name || ''}
                                                            onChange={(e) => updateHeirDetail(heir.id, 'name', e.target.value)}
                                                            placeholder={t('enterName')}
                                                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 text-sm transition-all
                                                                ${isHeirNonMuslim 
                                                                    ? 'border-rose-300 bg-white text-rose-700 focus:ring-rose-500 placeholder-rose-300' 
                                                                    : 'border-gray-200 bg-white text-gray-700 focus:ring-emerald-500'}`}
                                                          />
                                                        );
                                                      })()}
                                                  </td>
                                                  <td className="px-4 py-3">
                                                      <div className="relative">
                                                          <select 
                                                              value={heir.religion}
                                                              onChange={(e) => updateHeirDetail(heir.id, 'religion', e.target.value as 'muslim' | 'nonMuslim')}
                                                              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 text-sm appearance-none cursor-pointer pr-8 transition-all
                                                                  ${isHeirNonMuslim 
                                                                      ? 'border-rose-300 bg-white text-rose-700 focus:ring-rose-500' 
                                                                      : 'border-gray-200 bg-white text-gray-700 focus:ring-emerald-500'}`}
                                                          >
                                                              <option value="muslim">{t('muslim')}</option>
                                                              <option value="nonMuslim">{t('nonMuslim')}</option>
                                                          </select>
                                                          <div className={`absolute inset-y-0 ${language === 'en' ? 'right-0 pr-2' : 'left-0 pl-2'} flex items-center pointer-events-none ${isHeirNonMuslim ? 'text-rose-400' : 'text-gray-400'}`}>
                                                              <i className="fas fa-chevron-down text-xs"></i>
                                                          </div>
                                                      </div>
                                                  </td>
                                                   {hasRelatedThrough && (
                                                     <td className="px-4 py-3">
                                                         {isRelatedThroughType ? (
                                                           <div className="flex flex-col gap-1">
                                                             {(() => {
                                                              const activeOfTypeGroup = (() => {
                                                                const grandchildrenTypes = ['sonOfSon', 'daughterOfSon', 'sonOfDaughter', 'daughterOfDaughter'];
                                                                const nephewNieceTypes = [
                                                                  'brotherSon', 'sisterSon', 'brotherSonMaternal', 'sisterSonMaternal', 'brotherSonPaternal', 'sisterSonPaternal',
                                                                  'brotherDaughter', 'sisterDaughter', 'brotherDaughterMaternal', 'sisterDaughterMaternal', 'brotherDaughterPaternal', 'sisterDaughterPaternal'
                                                                ];
                                                                const paternalCousinTypes = [
                                                                  'unclePaternalSon', 'unclePaternalDaughter', 'auntPaternalSon', 'auntPaternalDaughter',
                                                                  'unclePaternalSonPaternal', 'unclePaternalSonMaternal', 'unclePaternalDaughterPaternal', 'unclePaternalDaughterMaternal',
                                                                  'auntPaternalSonMaternal', 'auntPaternalSonPaternal' as any, 'auntPaternalDaughterPaternal', 'auntPaternalDaughterMaternal'
                                                                ];
                                                                const maternalCousinTypes = [
                                                                  'uncleMaternalSon', 'uncleMaternalDaughter', 'auntMaternalSon', 'auntMaternalDaughter',
                                                                  'uncleMaternalSonPaternal', 'uncleMaternalSonMaternal', 'uncleMaternalDaughterPaternal', 'uncleMaternalDaughterMaternal',
                                                                  'auntMaternalSonPaternal', 'auntMaternalSonMaternal', 'auntMaternalDaughterPaternal', 'auntMaternalDaughterMaternal'
                                                                ];
                                                                let targetGroup: string[] = [];
                                                                if (grandchildrenTypes.includes(heir.type)) targetGroup = grandchildrenTypes;
                                                                else if (nephewNieceTypes.includes(heir.type)) targetGroup = nephewNieceTypes;
                                                                else if (paternalCousinTypes.includes(heir.type)) targetGroup = paternalCousinTypes;
                                                                else if (maternalCousinTypes.includes(heir.type)) targetGroup = maternalCousinTypes;
                                                                else return [];
                                                                
                                                                return heirDetails.filter(hd => 
                                                                  targetGroup.includes(hd.type) && !results.find(r => r.heirId === hd.id)?.isBlocked
                                                                );
                                                              })();
                                                              const isMaternalNephewNiece = ['brotherSonMaternal', 'sisterSonMaternal', 'brotherDaughterMaternal', 'sisterDaughterMaternal'].includes(heir.type);
                                                              const isMandatory = !isMaternalNephewNiece && activeOfTypeGroup.length >= 2;
                                                              const showError = isMandatory && step2Submitted && !(heir.parentName || '').trim();
                                                              
                                                              return (
                                                                <>
                                                                  <input 
                                                                    type="text"
                                                                    value={heir.parentName || ''}
                                                                    onChange={(e) => {
                                                                      const val = e.target.value;
                                                                      setHeirDetails(prev => prev.map(h => h.id === heir.id ? { ...h, parentName: val } : h));
                                                                    }}
                                                                    placeholder={t('deceasedParentPlaceholder') + (isMandatory ? '' : ` (${t('optional')})`)}
                                                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 text-sm transition-all
                                                                      ${showError 
                                                                        ? 'border-red-500 focus:ring-red-500' 
                                                                        : 'border-gray-200 focus:ring-emerald-500'}`}
                                                                  />
                                                                  {showError && (
                                                                    <span className="text-[10px] text-red-500 font-bold leading-tight mt-1 block font-black">
                                                                       {t('mandatoryField')}
                                                                    </span>
                                                                  )}
                                                                </>
                                                              );
                                                            })()}
                                                          </div>
                                                        ) : (
                                                          <div className="text-center text-gray-300">—</div>
                                                        )}
                                                    </td>
                                                  )}
                                              </tr>
                                          );
                                      })}
                                  </tbody>
                                </>
                              );
                            })()}
                        </table>
                    </div>
                </div>
            </div>
        )}

        {currentStep === 3 && results.length > 0 && (
          <div className="max-w-4xl mx-auto mb-32">
            
            <div className="print:block">
                {isKalala && results.some(r => !r.isBlocked && [
                  'brother', 'sister', 'brotherPaternal', 'sisterPaternal', 'brotherMaternal', 'sisterMaternal',
                  'brotherSon', 'sisterSon', 'brotherSonMaternal', 'sisterSonMaternal', 'brotherSonPaternal', 'sisterSonPaternal',
                  'brotherDaughter', 'sisterDaughter', 'brotherDaughterMaternal', 'sisterDaughterMaternal', 'brotherDaughterPaternal', 'sisterDaughterPaternal'
                ].includes(r.heirType)) && (
                  <div className="mb-6 p-5 rounded-xl border-2 transition-all duration-500 bg-emerald-50 border-emerald-200 text-emerald-950">
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-emerald-100 text-emerald-600">
                          <i className="fas fa-balance-scale text-lg"></i>
                        </div>
                        <h3 className="text-lg font-bold leading-tight">{t('kalalaStatus')}</h3>
                      </div>
                      <div className="px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest bg-emerald-600 text-white">
                        {language === 'ar' ? 'نظام الكلالة' : language === 'ur' ? 'کلالہ نظام' : 'Kalala System'}
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed whitespace-pre-line opacity-90 font-bold">{t('kalalaDescription')}</p>
                  </div>
                )}

                <div className="mb-6 p-6 rounded-2xl shadow-sm border bg-emerald-50 border-emerald-100 text-emerald-950">
                  <p className="text-center font-bold text-lg md:text-xl leading-relaxed">
                    <i className="fas fa-quote-right opacity-20 text-2xl ml-2 text-emerald-600"></i>
                    {(t(deceased.gender === 'male' ? 'resultIntroMale' : 'resultIntroFemale') as string)
                      .replace('{name}', deceased.name || (t(deceased.gender === 'male' ? 'deceasedDefaultMale' : 'deceasedDefaultFemale') as string))
                      .replace('{religion}', t('muslimMale'))
                      .replace('{amount}', formatNumber(deceased.totalAmount))
                      .replace('{area}', formatNumber(deceased.area))}
                    <i className="fas fa-quote-left opacity-20 text-2xl mr-2 text-emerald-600"></i>
                  </p>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden mb-6">
                    <div className="p-4 flex items-center gap-2 bg-[#00965e]">
                        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white">
                            <i className="fas fa-chart-pie text-sm"></i>
                        </div>
                        <h2 className="text-white font-bold text-lg">{t('inheritanceResult')}</h2>
                    </div>

                    <div className="flex bg-gray-50 border-b border-gray-100 text-[10px] md:text-xs font-bold text-gray-500">
                        <div className="p-3 w-10 md:w-12 text-center">#</div>
                        <div className="p-3 flex-1 text-right">{t('heir')}</div>
                        {showNameColumn && <div className="p-3 flex-1 text-right">{language === 'ar' ? 'الإسم' : language === 'ur' ? 'نام' : 'Name'}</div>}
                        <div className="p-3 w-16 md:w-20 text-center">{t('percentage')}</div>
                        {deceased.totalAmount > 0 && <div className="p-3 w-20 md:w-24 text-center">{t('shareAmount')}</div>}
                        {deceased.area > 0 && <div className="p-3 w-20 md:w-24 text-center">{t('shareArea')}</div>}
                        <div className="p-3 flex-[1.5] md:flex-[2] text-center">{t('notes')}</div>
                    </div>

                    <div className="divide-y divide-gray-100">
                        {sortedResults.filter(r => !r.isBlocked).map((result, index) => {
                            const isCore = true;
                            
                            return (
                                <div key={index} className="flex items-center text-[11px] md:text-sm hover:bg-gray-50 transition-colors">
                                    <div className="p-3 w-10 md:w-12 text-center text-gray-400">{index + 1}</div>
                                    <div className="p-3 flex-1 text-right">
                                        <span className="font-bold text-gray-800">{result.heir}</span>
                                    </div>
                                    {showNameColumn && (
                                        <div className="p-3 flex-1 text-right text-gray-500 font-medium">
                                            {result.heirName || '—'}
                                        </div>
                                    )}
                                    <div className="p-3 w-16 md:w-20 text-center font-bold text-gray-600 dir-ltr text-[10px] md:text-xs">
                                        {isCore ? `%${formatNumber(result.percentage, 2)}` : '-'}
                                    </div>
                                    {deceased.totalAmount > 0 && (
                                        <div className="p-3 w-24 text-center font-bold text-emerald-700 dir-ltr text-xs">
                                            {isCore ? formatNumber(deceased.totalAmount * (result.percentage / 100), 2) : '-'}
                                        </div>
                                    )}
                                    {deceased.area > 0 && (
                                        <div className="p-3 w-24 text-center font-bold text-teal-700 dir-ltr text-xs">
                                            {isCore ? formatNumber(deceased.area * (result.percentage / 100), 2) : '-'}
                                        </div>
                                    )}
                                    <div className="p-3 flex-[2] text-xs text-gray-500 text-center leading-relaxed font-bold">
                                        {isCore ? result.note : '-'}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="flex items-center text-sm font-black border-t-2 print:bg-emerald-50/50 bg-emerald-50/50 border-emerald-100 text-emerald-950">
                        <div className="p-4 w-12 text-center text-gray-400 opacity-50">∑</div>
                        <div className="p-4 flex-1 text-right">{t('totalPercentage')}</div>
                        <div className="p-4 w-20 text-center dir-ltr text-[#00965e]">%{formatNumber(totalPercentage, 2)}</div>
                        {deceased.totalAmount > 0 && (
                            <div className="p-4 w-24 text-center dir-ltr text-[#00965e]">{formatNumber(deceased.totalAmount)}</div>
                        )}
                        {deceased.area > 0 && (
                            <div className="p-4 w-24 text-center dir-ltr text-[#00965e]">{formatNumber(deceased.area)} {language === 'ar' ? 'م²' : language === 'ur' ? 'م²' : 'm²'}</div>
                        )}
                        <div className="p-4 flex-[2]"></div>
                    </div>
                </div>

                <div className="flex flex-row gap-4 mb-10 w-full overflow-x-auto pb-4 px-1 no-scrollbar">
                    <div className="flex-1 min-w-[120px] bg-white rounded-2xl shadow-sm border border-gray-100 py-6 px-4 flex flex-col items-center justify-center text-center">
                        <div className="text-2xl md:text-3xl font-bold mb-1 text-teal-700">{sortedResults.filter(r => !r.isBlocked).length}</div>
                        <div className="text-xs font-medium text-gray-500">{t('heir')}</div>
                    </div>
                    {deceased.totalAmount > 0 && (
                      <div className="flex-1 min-w-[150px] bg-white rounded-2xl shadow-sm border border-gray-100 py-6 px-4 flex flex-col items-center justify-center text-center">
                          <div className="text-2xl md:text-3xl font-bold mb-1 text-teal-700">{formatNumber(deceased.totalAmount)}</div>
                          <div className="text-xs font-medium text-gray-500">{t('totalAmount')}</div>
                      </div>
                    )}
                    {deceased.area > 0 && (
                      <div className="flex-1 min-w-[150px] bg-white rounded-2xl shadow-sm border border-gray-100 py-6 px-4 flex flex-col items-center justify-center text-center">
                          <div className="text-2xl md:text-3xl font-bold mb-1 text-teal-700">{formatNumber(deceased.area)} <span className="text-lg font-bold">{language === 'ar' ? 'م²' : language === 'ur' ? 'م²' : 'm²'}</span></div>
                          <div className="text-xs font-medium text-gray-500">{t('area')}</div>
                      </div>
                    )}
                </div>
            </div>

            {results.some(r => r.isBlocked) && (
              <div className="hidden print:block mt-12" style={{ pageBreakBefore: 'always' }}>
                <div className="text-center mb-10">
                    <h2 className="text-2xl font-bold text-red-600 mb-2">{language === 'ar' ? 'تقرير الورثة المحجوبين' : language === 'ur' ? 'وراثت سے محروم افراد کی رپورٹ' : 'Excluded Heirs Report'}</h2>
                    <div className="h-1 w-24 bg-red-100 mx-auto rounded-full"></div>
                </div>
                <div className="bg-white rounded-2xl border-2 border-red-50 p-6">
                    <p className="text-red-700 text-sm font-bold mb-6 flex items-center gap-2 border-b border-red-50 pb-4"><i className="fas fa-exclamation-triangle"></i>{language === 'ar' ? 'توضيح أسباب الحجب الشرعية للفئات المستبعدة' : language === 'ur' ? 'خارج شدہ زمروں کے اخراج کی شرعی وجوہات' : 'Clarification of Legal Reasons for Exclusion'}</p>
                    <div className="grid grid-cols-1 gap-4">
                        {results.filter(r => r.isBlocked).map((blocked, idx) => (
                            <div key={idx} className="flex items-center justify-between p-4 bg-red-50/50 rounded-xl border border-red-100">
                                <span className="font-black text-gray-800">{blocked.heir}</span>
                                <div className="flex flex-col items-end">
                                    <span className="text-xs text-red-600 font-bold">{t('heirBlockedMessage')}</span>
                                    <span className="text-[11px] text-red-500 italic">{blocked.blockedByReligion ? t('heirBlockedByReligion') : (t('heirBlockedBy') + getSingularHeirName(blocked.blockedBy || ''))}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="fixed bottom-8 left-0 right-0 z-[9999] px-6 pointer-events-none print:hidden">
            <div className={`max-w-5xl mx-auto flex items-center justify-between w-full ${language === 'en' ? 'flex-row' : 'flex-row-reverse'}`}>
                <div className="pointer-events-auto">
                    <button
                        onClick={currentStep === 3 ? () => window.print() : handleNextStep}
                        className="h-11 md:h-12 px-7 md:px-8 rounded-full text-white font-bold shadow-2xl flex items-center justify-center gap-2.5 text-sm md:text-[15px] transition-all duration-300 hover:scale-105 active:scale-95 border-b-2 border-black/20 bg-gradient-to-br from-[#00965e] via-[#00965e] to-teal-700 shadow-emerald-900/20"
                    >
                        {currentStep === 3 ? (
                            <><i className="fas fa-print text-xs"></i><span className="drop-shadow-sm uppercase tracking-wide">{t('print')}</span></>
                        ) : (
                            <><span className="drop-shadow-sm uppercase tracking-wide">{t(currentStep === 2 ? 'calculate' : 'next')}</span><i className={`fas ${currentStep === 2 ? 'fa-calculator' : `fa-chevron-${language === 'en' ? 'right' : 'left'}`} text-xs drop-shadow-sm`}></i></>
                        )}
                    </button>
                </div>
                <div className="pointer-events-auto">
                    {currentStep > 1 && (
                        <button
                            onClick={handlePrevStep}
                            className="h-11 md:h-12 px-7 md:px-8 rounded-full text-white font-bold shadow-2xl flex items-center justify-center gap-2.5 text-sm md:text-[15px] transition-all duration-300 hover:scale-105 active:scale-95 border-b-2 border-black/20 bg-gradient-to-br from-[#00965e] via-[#00965e] to-teal-700 shadow-emerald-900/20"
                        >
                            <i className={`fas fa-chevron-${language === 'en' ? 'left' : 'right'} text-xs`}></i><span className="uppercase tracking-wide">{t('back')}</span>
                        </button>
                    )}
                </div>
            </div>
        </div>

        <div className={`mt-8 text-center text-sm text-gray-500 ${currentStep === 3 ? '' : 'print:hidden'}`}>
          <p className="flex items-center justify-center gap-2"><i className="fas fa-info-circle text-emerald-500"></i>{t('footerDisclaimer')}</p>
        </div>
      </main>

      {showErrorModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={() => setShowErrorModal(false)}></div>
          <div className="relative bg-white w-full max-w-sm rounded-[40px] shadow-2xl overflow-hidden">
            <button onClick={() => setShowErrorModal(false)} className={`absolute top-6 ${language === 'en' ? 'right-6' : 'left-6'} text-gray-300 hover:text-gray-500 transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100`}><i className="fas fa-times text-sm"></i></button>
            <div className="p-10 flex flex-col items-center text-center">
              <div className="relative mb-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-b from-orange-400 to-orange-500 flex items-center justify-center shadow-[0_8px_20px_rgba(249,115,22,0.4)]"><i className="fas fa-exclamation text-white text-4xl"></i></div>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-3">{language === 'ar' ? 'تنبيه هام' : language === 'ur' ? 'اہم انتباہ' : 'Important Alert'}</h3>
              <p className="text-gray-500 text-lg mb-10 text-center">{t('selectHeirs')}</p>
              <button onClick={() => setShowErrorModal(false)} className="w-full py-5 rounded-2xl font-bold text-white shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 bg-[#00965e] shadow-emerald-200"><div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center"><i className="fas fa-check text-[10px]"></i></div><span className="text-lg">{language === 'ar' ? 'حسناً، فهمت' : language === 'ur' ? 'ٹھیک ہے، میں سمجھ گیا' : 'Okay, I understand'}</span></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
