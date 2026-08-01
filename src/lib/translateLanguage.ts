const LABELS: Record<string, Record<string, string>> = {
  uz: {
    turkish: 'Turk tili', english: 'Ingliz tili', english30: '30% Ingliz tili',
    arabic: 'Arab tili', arabic30: '30% Arab tili', french: 'Fransuz tili',
    german: 'Nemis tili', russian: 'Rus tili',
  },
  en: {
    turkish: 'Turkish', english: 'English', english30: '30% English',
    arabic: 'Arabic', arabic30: '30% Arabic', french: 'French',
    german: 'German', russian: 'Russian',
  },
  ru: {
    turkish: 'Турецкий', english: 'Английский', english30: '30% Английский',
    arabic: 'Арабский', arabic30: '30% Арабский', french: 'Французский',
    german: 'Немецкий', russian: 'Русский',
  },
}

export function translateLanguage(value: string, locale: string): string {
  return LABELS[locale]?.[value] ?? value
}
