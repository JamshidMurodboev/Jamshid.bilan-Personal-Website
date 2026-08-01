const UZ: Record<string, string> = {
  'Turkey': 'Turkiya', 'Germany': 'Germaniya', 'United States': 'AQSh',
  'United Kingdom': 'Buyuk Britaniya', 'France': 'Fransiya', 'Russia': 'Rossiya',
  'China': 'Xitoy', 'Japan': 'Yaponiya', 'South Korea': 'Janubiy Koreya',
  'Hungary': 'Vengriya', 'Italy': 'Italiya', 'Spain': 'Ispaniya',
  'Canada': 'Kanada', 'Australia': 'Avstraliya', 'Netherlands': 'Niderlandiya',
  'Sweden': 'Shvetsiya', 'Norway': 'Norvegiya', 'Finland': 'Finlandiya',
  'Denmark': 'Daniya', 'Switzerland': 'Shveytsariya', 'Austria': 'Avstriya',
  'Poland': 'Polsha', 'Czech Republic': 'Chexiya', 'Belgium': 'Belgiya',
  'Portugal': 'Portugaliya', 'Greece': 'Gretsiya', 'Egypt': 'Misr',
  'Saudi Arabia': 'Saudiya Arabistoni', 'UAE': 'BAA', 'Jordan': 'Iordaniya',
  'Malaysia': 'Malayziya', 'Indonesia': 'Indoneziya', 'India': 'Hindiston',
  'Pakistan': 'Pokiston', 'Kazakhstan': "Qozog'iston", 'Kyrgyzstan': "Qirg'iziston",
  'Tajikistan': 'Tojikiston', 'Azerbaijan': 'Ozarbayjon', 'Georgia': 'Gruziya',
  'Ukraine': 'Ukraina', 'Belarus': 'Belarus', 'Uzbekistan': "O'zbekiston",
}

const RU: Record<string, string> = {
  'Turkey': 'Турция', 'Germany': 'Германия', 'United States': 'США',
  'United Kingdom': 'Великобритания', 'France': 'Франция', 'Russia': 'Россия',
  'China': 'Китай', 'Japan': 'Япония', 'South Korea': 'Южная Корея',
  'Hungary': 'Венгрия', 'Italy': 'Италия', 'Spain': 'Испания',
  'Canada': 'Канада', 'Australia': 'Австралия', 'Netherlands': 'Нидерланды',
  'Sweden': 'Швеция', 'Norway': 'Норвегия', 'Finland': 'Финляндия',
  'Denmark': 'Дания', 'Switzerland': 'Швейцария', 'Austria': 'Австрия',
  'Poland': 'Польша', 'Czech Republic': 'Чехия', 'Belgium': 'Бельгия',
  'Portugal': 'Португалия', 'Greece': 'Греция', 'Egypt': 'Египет',
  'Saudi Arabia': 'Саудовская Аравия', 'UAE': 'ОАЭ', 'Jordan': 'Иордания',
  'Malaysia': 'Малайзия', 'Indonesia': 'Индонезия', 'India': 'Индия',
  'Pakistan': 'Пакистан', 'Kazakhstan': 'Казахстан', 'Kyrgyzstan': 'Кыргызстан',
  'Tajikistan': 'Таджикистан', 'Azerbaijan': 'Азербайджан', 'Georgia': 'Грузия',
  'Ukraine': 'Украина', 'Belarus': 'Беларусь', 'Uzbekistan': 'Узбекистан',
}

export function translateCountry(name: string, locale: string): string {
  if (locale === 'uz') return UZ[name] ?? name
  if (locale === 'ru') return RU[name] ?? name
  return name
}
