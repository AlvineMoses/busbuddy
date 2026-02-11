import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

interface CountryCode {
  code: string;
  dialCode: string;
  flag: string;
  name: string;
}

const COUNTRY_CODES: CountryCode[] = [
  { code: 'KE', dialCode: '+254', flag: '🇰🇪', name: 'Kenya' },
  { code: 'UG', dialCode: '+256', flag: '🇺🇬', name: 'Uganda' },
  { code: 'TZ', dialCode: '+255', flag: '🇹🇿', name: 'Tanzania' },
  { code: 'RW', dialCode: '+250', flag: '🇷🇼', name: 'Rwanda' },
  { code: 'ET', dialCode: '+251', flag: '🇪🇹', name: 'Ethiopia' },
  { code: 'NG', dialCode: '+234', flag: '🇳🇬', name: 'Nigeria' },
  { code: 'ZA', dialCode: '+27', flag: '🇿🇦', name: 'South Africa' },
  { code: 'GH', dialCode: '+233', flag: '🇬🇭', name: 'Ghana' },
  { code: 'US', dialCode: '+1', flag: '🇺🇸', name: 'United States' },
  { code: 'GB', dialCode: '+44', flag: '🇬🇧', name: 'United Kingdom' },
  { code: 'IN', dialCode: '+91', flag: '🇮🇳', name: 'India' },
  { code: 'AE', dialCode: '+971', flag: '🇦🇪', name: 'UAE' },
  { code: 'SA', dialCode: '+966', flag: '🇸🇦', name: 'Saudi Arabia' },
  { code: 'CN', dialCode: '+86', flag: '🇨🇳', name: 'China' },
  { code: 'JP', dialCode: '+81', flag: '🇯🇵', name: 'Japan' },
  { code: 'AU', dialCode: '+61', flag: '🇦🇺', name: 'Australia' },
  { code: 'CA', dialCode: '+1', flag: '🇨🇦', name: 'Canada' },
  { code: 'DE', dialCode: '+49', flag: '🇩🇪', name: 'Germany' },
  { code: 'FR', dialCode: '+33', flag: '🇫🇷', name: 'France' },
  { code: 'BR', dialCode: '+55', flag: '🇧🇷', name: 'Brazil' },
];

// Map timezone to country code for auto-detection
const TIMEZONE_TO_COUNTRY: Record<string, string> = {
  'Africa/Nairobi': 'KE',
  'Africa/Kampala': 'UG',
  'Africa/Dar_es_Salaam': 'TZ',
  'Africa/Kigali': 'RW',
  'Africa/Addis_Ababa': 'ET',
  'Africa/Lagos': 'NG',
  'Africa/Johannesburg': 'ZA',
  'Africa/Accra': 'GH',
  'America/New_York': 'US',
  'America/Chicago': 'US',
  'America/Denver': 'US',
  'America/Los_Angeles': 'US',
  'Europe/London': 'GB',
  'Asia/Kolkata': 'IN',
  'Asia/Dubai': 'AE',
  'Asia/Riyadh': 'SA',
  'Asia/Shanghai': 'CN',
  'Asia/Tokyo': 'JP',
  'Australia/Sydney': 'AU',
  'America/Toronto': 'CA',
  'Europe/Berlin': 'DE',
  'Europe/Paris': 'FR',
  'America/Sao_Paulo': 'BR',
};

function detectCountryCode(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return TIMEZONE_TO_COUNTRY[tz] || 'KE';
  } catch {
    return 'KE';
  }
}

interface PhoneInputProps {
  value: string;
  onChange: (fullNumber: string) => void;
  placeholder?: string;
  className?: string;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({ value, onChange, placeholder, className = '' }) => {
  const { colors } = useTheme();
  const detectedCode = useMemo(() => detectCountryCode(), []);
  const defaultCountry = COUNTRY_CODES.find(c => c.code === detectedCode) || COUNTRY_CODES[0];

  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(defaultCountry);
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Extract phone number part (without dial code) from value
  const phoneNumber = useMemo(() => {
    if (!value) return '';
    // If value starts with a dial code, strip it
    const country = COUNTRY_CODES.find(c => value.startsWith(c.dialCode));
    if (country) {
      return value.slice(country.dialCode.length).trim();
    }
    return value;
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCountries = useMemo(() => {
    if (!search) return COUNTRY_CODES;
    const q = search.toLowerCase();
    return COUNTRY_CODES.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.dialCode.includes(q) ||
      c.code.toLowerCase().includes(q)
    );
  }, [search]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = e.target.value.replace(/[^\d\s\-()]/g, '');
    onChange(`${selectedCountry.dialCode} ${num}`);
  };

  const handleSelectCountry = (country: CountryCode) => {
    setSelectedCountry(country);
    setIsOpen(false);
    setSearch('');
    onChange(`${country.dialCode} ${phoneNumber}`);
    inputRef.current?.focus();
  };

  return (
    <div className={`relative flex ${className}`} ref={dropdownRef}>
      {/* Country Code Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-4 py-3 bg-white border border-gray-200 border-r-0 rounded-l-full hover:bg-gray-50 transition-colors min-w-[100px] justify-center"
        style={isOpen ? { borderColor: colors.primary, boxShadow: `0 0 0 3px ${colors.primary}20` } : {}}
      >
        <span className="text-lg">{selectedCountry.flag}</span>
        <span className="text-sm font-bold text-gray-600">{selectedCountry.dialCode}</span>
        <ChevronDown size={12} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Phone Number Input */}
      <input
        ref={inputRef}
        type="tel"
        value={phoneNumber}
        onChange={handlePhoneChange}
        placeholder={placeholder || '712 345 678'}
        className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-r-full outline-none transition-all font-medium placeholder:text-gray-300"
        onFocus={(e) => {
          e.currentTarget.style.borderColor = colors.primary;
          e.currentTarget.style.boxShadow = `0 0 0 3px ${colors.primary}20`;
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = '#e5e7eb';
          e.currentTarget.style.boxShadow = 'none';
        }}
      />

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 z-[80] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search country..."
                className="w-full pl-9 pr-3 py-2.5 bg-gray-50 rounded-xl text-sm font-medium placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-brand-lilac/20"
                autoFocus
              />
            </div>
          </div>
          <div className="max-h-52 overflow-y-auto">
            {filteredCountries.map(country => (
              <button
                key={country.code + country.dialCode}
                onClick={() => handleSelectCountry(country)}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left ${
                  selectedCountry.code === country.code ? 'bg-brand-lilac/5' : ''
                }`}
              >
                <span className="text-lg">{country.flag}</span>
                <span className="text-sm font-bold text-brand-black flex-1">{country.name}</span>
                <span className="text-xs font-medium text-gray-400">{country.dialCode}</span>
              </button>
            ))}
            {filteredCountries.length === 0 && (
              <p className="px-4 py-6 text-sm text-gray-400 text-center">No results</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
