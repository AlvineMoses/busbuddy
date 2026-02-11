import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useMapsLibrary } from '@vis.gl/react-google-maps';
import { MapPin, Loader2 } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

export interface PlaceResult {
  address: string;
  placeId: string;
  lat: number;
  lng: number;
}

interface PlacesAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onPlaceSelect: (place: PlaceResult) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  /** Bias results toward Kenya */
  regionBias?: string;
}

export const PlacesAutocomplete: React.FC<PlacesAutocompleteProps> = ({
  value,
  onChange,
  onPlaceSelect,
  placeholder = 'Search address...',
  disabled = false,
  className = '',
  regionBias = 'ke',
}) => {
  const { colors } = useTheme();
  const placesLib = useMapsLibrary('places');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const sessionTokenRef = useRef<any>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSuggestions = useCallback(
    async (input: string) => {
      if (!placesLib || !input.trim()) {
        setSuggestions([]);
        setIsLoading(false);
        return;
      }

      const { AutocompleteSessionToken, AutocompleteSuggestion } = placesLib;

      if (!sessionTokenRef.current) {
        sessionTokenRef.current = new AutocompleteSessionToken();
      }

      try {
        setIsLoading(true);
        const response = await AutocompleteSuggestion.fetchAutocompleteSuggestions({
          input,
          sessionToken: sessionTokenRef.current,
          includedRegionCodes: [regionBias],
        });
        setSuggestions(response.suggestions);
        setIsOpen(response.suggestions.length > 0);
      } catch {
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    },
    [placesLib, regionBias]
  );

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 300);
  };

  const handleSelect = async (suggestion: any) => {
    if (!placesLib || !suggestion.placePrediction) return;

    const place = suggestion.placePrediction.toPlace();
    try {
      await place.fetchFields({ fields: ['displayName', 'formattedAddress', 'location'] });

      const result: PlaceResult = {
        address: place.formattedAddress || suggestion.placePrediction.text.text || '',
        placeId: place.id || '',
        lat: place.location?.lat() || 0,
        lng: place.location?.lng() || 0,
      };

      onChange(result.address);
      onPlaceSelect(result);
      setIsOpen(false);
      setSuggestions([]);

      // Reset session token after place selection
      sessionTokenRef.current = null;
    } catch {
      // If fetchFields fails, use prediction text
      onChange(suggestion.placePrediction.text.text || '');
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={value}
          onChange={handleInput}
          onFocus={() => { if (suggestions.length > 0) setIsOpen(true); }}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full pl-9 pr-8 p-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium placeholder:text-gray-400 outline-none transition-all ${
            disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''
          }`}
          style={{ fontSize: '13px' }}
          onFocusCapture={(e) => {
            if (!disabled) {
              e.currentTarget.style.borderColor = colors.primary;
              e.currentTarget.style.boxShadow = `0 0 0 2px ${colors.primary}15`;
            }
          }}
          onBlurCapture={(e) => {
            e.currentTarget.style.borderColor = '#e5e7eb';
            e.currentTarget.style.boxShadow = 'none';
          }}
        />
        {isLoading && (
          <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" />
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-gray-100 z-[90] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <ul className="max-h-48 overflow-y-auto">
            {suggestions.map((suggestion, idx) => {
              const prediction = suggestion.placePrediction;
              if (!prediction) return null;
              return (
                <li
                  key={prediction.placeId || idx}
                  onClick={() => handleSelect(suggestion)}
                  className="flex items-start gap-2.5 px-3 py-2.5 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-50 last:border-0"
                >
                  <MapPin size={14} className="text-gray-400 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-brand-black truncate">
                      {prediction.mainText?.text || prediction.text.text}
                    </p>
                    {prediction.secondaryText?.text && (
                      <p className="text-xs text-gray-400 truncate">{prediction.secondaryText.text}</p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};
