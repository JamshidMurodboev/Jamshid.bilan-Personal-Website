'use client';
import { useState, useRef, useEffect } from 'react';

interface Country {
  code: string;
  dial: string;
  name: string;
  flag: string;
  digits: number;
}

const COUNTRIES: Country[] = [
  { code: 'UZ', dial: '998', name: 'Uzbekiston', flag: '🇺🇿', digits: 9 },
  { code: 'RU', dial: '7',   name: 'Rossiya', flag: '🇷🇺', digits: 10 },
  { code: 'KZ', dial: '7',   name: 'Qozogiston', flag: '🇰🇿', digits: 10 },
  { code: 'KG', dial: '996', name: "Qirg'iziston", flag: '🇰🇬', digits: 9 },
  { code: 'TJ', dial: '992', name: 'Tojikiston', flag: '🇹🇯', digits: 9 },
  { code: 'TM', dial: '993', name: 'Turkmaniston', flag: '🇹🇲', digits: 8 },
  { code: 'TR', dial: '90',  name: 'Turkiya', flag: '🇹🇷', digits: 10 },
  { code: 'AZ', dial: '994', name: 'Ozarbayjon', flag: '🇦🇿', digits: 9 },
  { code: 'GE', dial: '995', name: 'Gruziya', flag: '🇬🇪', digits: 9 },
  { code: 'UA', dial: '380', name: 'Ukraina', flag: '🇺🇦', digits: 9 },
  { code: 'BY', dial: '375', name: 'Belarus', flag: '🇧🇾', digits: 9 },
  { code: 'AM', dial: '374', name: 'Armaniston', flag: '🇦🇲', digits: 8 },
  { code: 'MD', dial: '373', name: 'Moldova', flag: '🇲🇩', digits: 8 },
  { code: 'DE', dial: '49',  name: 'Germaniya', flag: '🇩🇪', digits: 10 },
  { code: 'FR', dial: '33',  name: 'Fransiya', flag: '🇫🇷', digits: 9 },
  { code: 'GB', dial: '44',  name: 'Buyuk Britaniya', flag: '🇬🇧', digits: 10 },
  { code: 'IT', dial: '39',  name: 'Italiya', flag: '🇮🇹', digits: 10 },
  { code: 'ES', dial: '34',  name: 'Ispaniya', flag: '🇪🇸', digits: 9 },
  { code: 'PL', dial: '48',  name: 'Polsha', flag: '🇵🇱', digits: 9 },
  { code: 'NL', dial: '31',  name: 'Niderlandiya', flag: '🇳🇱', digits: 9 },
  { code: 'SE', dial: '46',  name: 'Shvetsiya', flag: '🇸🇪', digits: 9 },
  { code: 'NO', dial: '47',  name: 'Norvegiya', flag: '🇳🇴', digits: 8 },
  { code: 'DK', dial: '45',  name: 'Daniya', flag: '🇩🇰', digits: 8 },
  { code: 'FI', dial: '358', name: 'Finlandiya', flag: '🇫🇮', digits: 9 },
  { code: 'CH', dial: '41',  name: 'Shveytsariya', flag: '🇨🇭', digits: 9 },
  { code: 'AT', dial: '43',  name: 'Avstriya', flag: '🇦🇹', digits: 10 },
  { code: 'BE', dial: '32',  name: 'Belgiya', flag: '🇧🇪', digits: 9 },
  { code: 'PT', dial: '351', name: 'Portugaliya', flag: '🇵🇹', digits: 9 },
  { code: 'GR', dial: '30',  name: 'Gretsiya', flag: '🇬🇷', digits: 10 },
  { code: 'CZ', dial: '420', name: 'Chexiya', flag: '🇨🇿', digits: 9 },
  { code: 'HU', dial: '36',  name: 'Vengriya', flag: '🇭🇺', digits: 9 },
  { code: 'RO', dial: '40',  name: 'Ruminiya', flag: '🇷🇴', digits: 9 },
  { code: 'BG', dial: '359', name: 'Bolgariya', flag: '🇧🇬', digits: 9 },
  { code: 'RS', dial: '381', name: 'Serbiya', flag: '🇷🇸', digits: 9 },
  { code: 'HR', dial: '385', name: 'Xorvatiya', flag: '🇭🇷', digits: 9 },
  { code: 'SK', dial: '421', name: 'Slovakiya', flag: '🇸🇰', digits: 9 },
  { code: 'US', dial: '1',   name: 'AQSh', flag: '🇺🇸', digits: 10 },
  { code: 'CA', dial: '1',   name: 'Kanada', flag: '🇨🇦', digits: 10 },
  { code: 'AU', dial: '61',  name: 'Avstraliya', flag: '🇦🇺', digits: 9 },
  { code: 'CN', dial: '86',  name: 'Xitoy', flag: '🇨🇳', digits: 11 },
  { code: 'JP', dial: '81',  name: 'Yaponiya', flag: '🇯🇵', digits: 10 },
  { code: 'KR', dial: '82',  name: 'Janubiy Koreya', flag: '🇰🇷', digits: 10 },
  { code: 'IN', dial: '91',  name: 'Hindiston', flag: '🇮🇳', digits: 10 },
  { code: 'PK', dial: '92',  name: 'Pokiston', flag: '🇵🇰', digits: 10 },
  { code: 'BD', dial: '880', name: 'Bangladesh', flag: '🇧🇩', digits: 10 },
  { code: 'ID', dial: '62',  name: 'Indoneziya', flag: '🇮🇩', digits: 10 },
  { code: 'MY', dial: '60',  name: 'Malayziya', flag: '🇲🇾', digits: 9 },
  { code: 'SA', dial: '966', name: 'Saudiya Arabistoni', flag: '🇸🇦', digits: 9 },
  { code: 'AE', dial: '971', name: 'BAA', flag: '🇦🇪', digits: 9 },
  { code: 'EG', dial: '20',  name: 'Misr', flag: '🇪🇬', digits: 10 },
  { code: 'NG', dial: '234', name: 'Nigeriya', flag: '🇳🇬', digits: 10 },
  { code: 'ZA', dial: '27',  name: 'Janubiy Afrika', flag: '🇿🇦', digits: 9 },
  { code: 'KE', dial: '254', name: 'Keniya', flag: '🇰🇪', digits: 9 },
  { code: 'BR', dial: '55',  name: 'Braziliya', flag: '🇧🇷', digits: 11 },
  { code: 'MX', dial: '52',  name: 'Meksika', flag: '🇲🇽', digits: 10 },
  { code: 'AR', dial: '54',  name: 'Argentina', flag: '🇦🇷', digits: 10 },
  { code: 'IR', dial: '98',  name: 'Eron', flag: '🇮🇷', digits: 10 },
  { code: 'IQ', dial: '964', name: 'Iroq', flag: '🇮🇶', digits: 10 },
  { code: 'JO', dial: '962', name: 'Iordaniya', flag: '🇯🇴', digits: 9 },
  { code: 'IL', dial: '972', name: 'Isroil', flag: '🇮🇱', digits: 9 },
  { code: 'TH', dial: '66',  name: 'Tailand', flag: '🇹🇭', digits: 9 },
  { code: 'SG', dial: '65',  name: 'Singapur', flag: '🇸🇬', digits: 8 },
  { code: 'PH', dial: '63',  name: 'Filippin', flag: '🇵🇭', digits: 10 },
  { code: 'VN', dial: '84',  name: 'Vyetnam', flag: '🇻🇳', digits: 9 },
];

interface Props {
  onChange: (fullPhone: string, isValid: boolean) => void;
  className?: string;
  required?: boolean;
}

export default function PhoneInput({ onChange, className, required }: Props) {
  const [country, setCountry] = useState<Country>(COUNTRIES[0]);
  const [digits, setDigits] = useState('');
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onClickOut(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    }
    document.addEventListener('mousedown', onClickOut);
    return () => document.removeEventListener('mousedown', onClickOut);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 50);
  }, [open]);

  const filtered = COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.dial.includes(search.replace('+', '')) ||
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, '').slice(0, country.digits);
    setDigits(raw);
    const fullPhone = `+${country.dial}${raw}`;
    const isValid = raw.length === country.digits;
    onChange(fullPhone, isValid);
  }

  function selectCountry(c: Country) {
    setCountry(c);
    setDigits('');
    setOpen(false);
    setSearch('');
    onChange(`+${c.dial}`, false);
  }

  const isComplete = digits.length === country.digits;

  return (
    <div className="flex" ref={wrapRef}>
      {/* Country selector */}
      <div className="relative flex-shrink-0">
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          className="h-full flex items-center gap-1 px-2.5 border border-line border-r-0 rounded-l-xl bg-card hover:bg-soft transition-colors text-sm"
        >
          <span>{country.flag}</span>
          <span className="text-body font-medium text-xs whitespace-nowrap">+{country.dial}</span>
          <svg className="w-3 h-3 text-muted-e flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {open && (
          <div className="absolute z-50 top-full left-0 mt-2 w-64 bg-card border border-card rounded-2xl shadow-xl shadow-black/10 overflow-hidden">
            <div className="p-2 border-b border-line">
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Qidirish..."
                className="w-full text-sm px-3 py-1.5 rounded-lg border border-line bg-soft text-heading focus:outline-none focus:border-[var(--accent)] transition-colors"
              />
            </div>
            <ul className="overflow-y-auto max-h-56">
              {filtered.length === 0 && (
                <li className="px-4 py-3 text-sm text-muted-e text-center">Topilmadi</li>
              )}
              {filtered.map(c => (
                <li key={c.code}>
                  <button
                    type="button"
                    onClick={() => selectCountry(c)}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-soft text-left transition-colors ${
                      country.code === c.code ? 'bg-soft' : ''
                    }`}
                  >
                    <span className="text-base w-6 text-center">{c.flag}</span>
                    <span className="flex-1 text-body truncate">{c.name}</span>
                    <span className="text-muted-e text-xs">+{c.dial}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Local number input */}
      <div className="flex-1 relative flex items-center">
        <input
          type="tel"
          required={required}
          value={digits}
          onChange={handleInput}
          placeholder={'0'.repeat(country.digits)}
          className={`w-full border border-line rounded-r-xl px-3 py-2.5 pr-14 text-sm text-heading bg-card focus:outline-none focus:border-[var(--accent)] focus:z-10 transition-colors ${className || ''}`}
        />
        <span className="absolute right-3 text-xs font-medium pointer-events-none select-none">
          {isComplete ? (
            <span className="text-accent">✓</span>
          ) : (
            <span className="text-muted-e">{digits.length}/{country.digits}</span>
          )}
        </span>
      </div>
    </div>
  );
}
