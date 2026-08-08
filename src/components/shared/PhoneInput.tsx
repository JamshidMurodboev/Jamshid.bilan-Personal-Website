'use client';
import { useState, useRef, useEffect } from 'react';

interface Country {
  code: string;
  dial: string;
  name: string;
  flag: string;
}

const COUNTRIES: Country[] = [
  { code: 'UZ', dial: '998', name: 'Uzbekiston', flag: '🇺🇿' },
  { code: 'RU', dial: '7', name: 'Rossiya', flag: '🇷🇺' },
  { code: 'KZ', dial: '7', name: 'Qozogiston', flag: '🇰🇿' },
  { code: 'TR', dial: '90', name: 'Turkiya', flag: '🇹🇷' },
  { code: 'KG', dial: '996', name: "Qirg'iziston", flag: '🇰🇬' },
  { code: 'TJ', dial: '992', name: 'Tojikiston', flag: '🇹🇯' },
  { code: 'TM', dial: '993', name: 'Turkmaniston', flag: '🇹🇲' },
  { code: 'AZ', dial: '994', name: 'Ozarbayjon', flag: '🇦🇿' },
  { code: 'GE', dial: '995', name: 'Gruziya', flag: '🇬🇪' },
  { code: 'AM', dial: '374', name: 'Armaniston', flag: '🇦🇲' },
  { code: 'UA', dial: '380', name: 'Ukraina', flag: '🇺🇦' },
  { code: 'BY', dial: '375', name: 'Belarus', flag: '🇧🇾' },
  { code: 'MD', dial: '373', name: 'Moldova', flag: '🇲🇩' },
  { code: 'GB', dial: '44', name: 'Britaniya', flag: '🇬🇧' },
  { code: 'DE', dial: '49', name: 'Germaniya', flag: '🇩🇪' },
  { code: 'FR', dial: '33', name: 'Fransiya', flag: '🇫🇷' },
  { code: 'IT', dial: '39', name: 'Italiya', flag: '🇮🇹' },
  { code: 'ES', dial: '34', name: 'Ispaniya', flag: '🇪🇸' },
  { code: 'NL', dial: '31', name: 'Niderlandiya', flag: '🇳🇱' },
  { code: 'BE', dial: '32', name: 'Belgiya', flag: '🇧🇪' },
  { code: 'CH', dial: '41', name: 'Shveytsariya', flag: '🇨🇭' },
  { code: 'AT', dial: '43', name: 'Avstriya', flag: '🇦🇹' },
  { code: 'SE', dial: '46', name: 'Shvetsiya', flag: '🇸🇪' },
  { code: 'NO', dial: '47', name: 'Norvegiya', flag: '🇳🇴' },
  { code: 'DK', dial: '45', name: 'Daniya', flag: '🇩🇰' },
  { code: 'FI', dial: '358', name: 'Finlandiya', flag: '🇫🇮' },
  { code: 'PL', dial: '48', name: 'Polsha', flag: '🇵🇱' },
  { code: 'CZ', dial: '420', name: 'Chexiya', flag: '🇨🇿' },
  { code: 'SK', dial: '421', name: 'Slovakiya', flag: '🇸🇰' },
  { code: 'HU', dial: '36', name: 'Vengriya', flag: '🇭🇺' },
  { code: 'RO', dial: '40', name: 'Ruminiya', flag: '🇷🇴' },
  { code: 'BG', dial: '359', name: 'Bolgariya', flag: '🇧🇬' },
  { code: 'GR', dial: '30', name: 'Gretsiya', flag: '🇬🇷' },
  { code: 'HR', dial: '385', name: 'Xorvatiya', flag: '🇭🇷' },
  { code: 'RS', dial: '381', name: 'Serbiya', flag: '🇷🇸' },
  { code: 'SI', dial: '386', name: 'Sloveniya', flag: '🇸🇮' },
  { code: 'PT', dial: '351', name: 'Portugaliya', flag: '🇵🇹' },
  { code: 'IE', dial: '353', name: 'Irlandiya', flag: '🇮🇪' },
  { code: 'LT', dial: '370', name: 'Litva', flag: '🇱🇹' },
  { code: 'LV', dial: '371', name: 'Latviya', flag: '🇱🇻' },
  { code: 'EE', dial: '372', name: 'Estoniya', flag: '🇪🇪' },
  { code: 'IS', dial: '354', name: 'Islandiya', flag: '🇮🇸' },
  { code: 'LU', dial: '352', name: 'Lyuksemburg', flag: '🇱🇺' },
  { code: 'MT', dial: '356', name: 'Malta', flag: '🇲🇹' },
  { code: 'CY', dial: '357', name: 'Kipr', flag: '🇨🇾' },
  { code: 'AL', dial: '355', name: 'Albaniya', flag: '🇦🇱' },
  { code: 'BA', dial: '387', name: 'Bosniya', flag: '🇧🇦' },
  { code: 'MK', dial: '389', name: 'Makedoniya', flag: '🇲🇰' },
  { code: 'ME', dial: '382', name: 'Chernogoriya', flag: '🇲🇪' },
  { code: 'US', dial: '1', name: 'AQSH', flag: '🇺🇸' },
  { code: 'CA', dial: '1', name: 'Kanada', flag: '🇨🇦' },
  { code: 'MX', dial: '52', name: 'Meksika', flag: '🇲🇽' },
  { code: 'BR', dial: '55', name: 'Braziliya', flag: '🇧🇷' },
  { code: 'AR', dial: '54', name: 'Argentina', flag: '🇦🇷' },
  { code: 'CL', dial: '56', name: 'Chili', flag: '🇨🇱' },
  { code: 'CO', dial: '57', name: 'Kolumbiya', flag: '🇨🇴' },
  { code: 'PE', dial: '51', name: 'Peru', flag: '🇵🇪' },
  { code: 'VE', dial: '58', name: 'Venesuela', flag: '🇻🇪' },
  { code: 'EC', dial: '593', name: 'Ekvador', flag: '🇪🇨' },
  { code: 'BO', dial: '591', name: 'Boliviya', flag: '🇧🇴' },
  { code: 'PY', dial: '595', name: 'Paragvay', flag: '🇵🇾' },
  { code: 'UY', dial: '598', name: 'Urugvay', flag: '🇺🇾' },
  { code: 'CN', dial: '86', name: 'Xitoy', flag: '🇨🇳' },
  { code: 'JP', dial: '81', name: 'Yaponiya', flag: '🇯🇵' },
  { code: 'KR', dial: '82', name: 'Janubiy Koreya', flag: '🇰🇷' },
  { code: 'IN', dial: '91', name: 'Hindiston', flag: '🇮🇳' },
  { code: 'PK', dial: '92', name: 'Pokiston', flag: '🇵🇰' },
  { code: 'BD', dial: '880', name: 'Bangladesh', flag: '🇧🇩' },
  { code: 'NP', dial: '977', name: 'Nepal', flag: '🇳🇵' },
  { code: 'LK', dial: '94', name: 'Shri-Lanka', flag: '🇱🇰' },
  { code: 'MM', dial: '95', name: 'Myanma', flag: '🇲🇲' },
  { code: 'TH', dial: '66', name: 'Tailand', flag: '🇹🇭' },
  { code: 'VN', dial: '84', name: 'Vyetnam', flag: '🇻🇳' },
  { code: 'ID', dial: '62', name: 'Indoneziya', flag: '🇮🇩' },
  { code: 'MY', dial: '60', name: 'Malayziya', flag: '🇲🇾' },
  { code: 'SG', dial: '65', name: 'Singapur', flag: '🇸🇬' },
  { code: 'PH', dial: '63', name: 'Filippin', flag: '🇵🇭' },
  { code: 'KH', dial: '855', name: 'Kambodja', flag: '🇰🇭' },
  { code: 'LA', dial: '856', name: 'Laos', flag: '🇱🇦' },
  { code: 'MN', dial: '976', name: "Mo'g'uliston", flag: '🇲🇳' },
  { code: 'AF', dial: '93', name: 'Afgoniston', flag: '🇦🇫' },
  { code: 'IR', dial: '98', name: 'Eron', flag: '🇮🇷' },
  { code: 'IQ', dial: '964', name: 'Iroq', flag: '🇮🇶' },
  { code: 'SA', dial: '966', name: 'Saudiya Arabistoni', flag: '🇸🇦' },
  { code: 'AE', dial: '971', name: 'BAA', flag: '🇦🇪' },
  { code: 'QA', dial: '974', name: 'Qatar', flag: '🇶🇦' },
  { code: 'KW', dial: '965', name: 'Quvayt', flag: '🇰🇼' },
  { code: 'BH', dial: '973', name: 'Bahrayn', flag: '🇧🇭' },
  { code: 'OM', dial: '968', name: 'Ummon', flag: '🇴🇲' },
  { code: 'JO', dial: '962', name: 'Iordaniya', flag: '🇯🇴' },
  { code: 'IL', dial: '972', name: 'Isroil', flag: '🇮🇱' },
  { code: 'LB', dial: '961', name: 'Livan', flag: '🇱🇧' },
  { code: 'SY', dial: '963', name: 'Suriya', flag: '🇸🇾' },
  { code: 'YE', dial: '967', name: 'Yaman', flag: '🇾🇪' },
  { code: 'EG', dial: '20', name: 'Misr', flag: '🇪🇬' },
  { code: 'MA', dial: '212', name: 'Marokash', flag: '🇲🇦' },
  { code: 'TN', dial: '216', name: 'Tunis', flag: '🇹🇳' },
  { code: 'DZ', dial: '213', name: 'Jazoir', flag: '🇩🇿' },
  { code: 'LY', dial: '218', name: 'Liviya', flag: '🇱🇾' },
  { code: 'NG', dial: '234', name: 'Nigeriya', flag: '🇳🇬' },
  { code: 'KE', dial: '254', name: 'Keniya', flag: '🇰🇪' },
  { code: 'ZA', dial: '27', name: 'Janubiy Afrika', flag: '🇿🇦' },
  { code: 'GH', dial: '233', name: 'Gana', flag: '🇬🇭' },
  { code: 'ET', dial: '251', name: 'Efiopiya', flag: '🇪🇹' },
  { code: 'TZ', dial: '255', name: 'Tanzaniya', flag: '🇹🇿' },
  { code: 'UG', dial: '256', name: 'Uganda', flag: '🇺🇬' },
  { code: 'SD', dial: '249', name: 'Sudan', flag: '🇸🇩' },
  { code: 'AU', dial: '61', name: 'Avstraliya', flag: '🇦🇺' },
  { code: 'NZ', dial: '64', name: 'Yangi Zelandiya', flag: '🇳🇿' },
];

interface Props {
  onChange: (fullNumber: string) => void;
  className?: string;
  required?: boolean;
}

export default function PhoneInput({ onChange, className, required }: Props) {
  const [country, setCountry] = useState<Country>(COUNTRIES[0]);
  const [local, setLocal] = useState('');
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapRef = useRef<HTMLDivElement>(null);

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

  function handleLocal(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value.replace(/[^\d\s\-()]/g, '');
    setLocal(val);
    onChange(`+${country.dial}${val.replace(/\D/g, '')}`);
  }

  function selectCountry(c: Country) {
    setCountry(c);
    setOpen(false);
    setSearch('');
    onChange(`+${c.dial}${local.replace(/\D/g, '')}`);
  }

  const filtered = search.trim()
    ? COUNTRIES.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.code.toLowerCase().includes(search.toLowerCase()) ||
        c.dial.includes(search.replace('+', ''))
      )
    : COUNTRIES;

  return (
    <div className="flex" ref={wrapRef}>
      <div className="relative flex-shrink-0">
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          className="h-full flex items-center gap-1 px-2.5 border border-gray-300 dark:border-gray-600 border-r-0 rounded-l-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition text-sm"
        >
          <span>{country.flag}</span>
          <span className="text-gray-700 dark:text-gray-300 font-medium text-xs whitespace-nowrap">+{country.dial}</span>
          <svg className="w-3 h-3 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {open && (
          <div className="absolute z-50 top-full left-0 mt-1 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl overflow-hidden">
            <div className="p-2 border-b border-gray-100 dark:border-gray-700">
              <input
                autoFocus
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Qidirish..."
                className="w-full px-2.5 py-1.5 text-sm bg-gray-50 dark:bg-gray-700 rounded-lg outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400"
              />
            </div>
            <ul className="overflow-y-auto max-h-52">
              {filtered.map(c => (
                <li key={c.code}>
                  <button
                    type="button"
                    onClick={() => selectCountry(c)}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-left transition-colors ${
                      country.code === c.code ? 'bg-teal-50 dark:bg-teal-900/20' : ''
                    }`}
                  >
                    <span className="text-base w-6 text-center">{c.flag}</span>
                    <span className="flex-1 text-gray-800 dark:text-gray-200 truncate">{c.name}</span>
                    <span className="text-gray-400 dark:text-gray-500 text-xs">+{c.dial}</span>
                  </button>
                </li>
              ))}
              {filtered.length === 0 && (
                <li className="px-3 py-4 text-sm text-gray-400 text-center">Topilmadi</li>
              )}
            </ul>
          </div>
        )}
      </div>

      <input
        type="tel"
        required={required}
        value={local}
        onChange={handleLocal}
        placeholder={country.code === 'UZ' ? '90 123 45 67' : '000 000 0000'}
        className={`flex-1 border border-gray-300 dark:border-gray-600 rounded-r-lg px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:z-10 ${className || ''}`}
      />
    </div>
  );
}
