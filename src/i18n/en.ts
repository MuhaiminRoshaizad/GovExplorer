export const en = {
  common: {
    appName: 'GovExplorer',
    loading: 'Loading…',
    retry: 'Try again',
    error: 'Something went wrong',
    seeAll: 'See all',
    today: 'Today',
    yesterday: 'Yesterday',
    updated: 'Updated',
    source: 'Source',
    share: 'Share',
    save: 'Save',
    cancel: 'Cancel',
    done: 'Done',
    confirm: 'Confirm',
  },
  tabs: {
    today: 'Today',
    explore: 'Explore',
    insights: 'Insights',
    about: 'About',
  },
  today: {
    greetingMorning: 'Good morning',
    greetingAfternoon: 'Good afternoon',
    greetingEvening: 'Good evening',
    brandLine: 'Malaysia, today.',
    pulseTitle: 'Malaysia today',
    streakLabel: 'day streak',
    surpriseTitle: 'Today’s surprise',
    surpriseTap: 'Tap to reveal',
  },
  explore: {
    title: 'Explore the map',
    subtitle: 'Tap a state to see its story.',
  },
  insights: {
    title: 'Insights',
    subtitle: 'Beautifully crafted charts from open data.',
    economy: 'Economy & finance',
    transit: 'Transit & mobility',
    climate: 'Climate & environment',
    society: 'Population & society',
  },
  settings: {
    title: 'About',
    appearance: 'Appearance',
    language: 'Language',
    location: 'Home state',
    about: 'About',
    themeSystem: 'Match system',
    themeLight: 'Light',
    themeDark: 'Dark',
  },
  about: {
    tagline: 'Malaysian open data, beautifully.',
    description:
      'A daily glance at Malaysia — economy, transit, climate, and people — powered by data.gov.my. No login, no tracking, just clean public data.',
    features: {
      today: 'Daily pulse',
      explore: 'Interactive map',
      insights: 'Editorial insights',
      chat: 'AI assistant',
    },
    sections: {
      preferences: 'Preferences',
      info: 'About',
      legal: 'Legal',
    },
    rows: {
      dataSource: 'Data source',
      dataSourceValue: 'data.gov.my',
      privacy: 'Privacy',
      privacyValue: 'No login, no tracking',
      version: 'Version',
      source: 'Source code',
      sourceValue: 'GitHub',
      terms: 'Terms of use',
      privacyPolicy: 'Privacy policy',
    },
    madeBy: 'Made with care for Malaysia.',
  },
  chat: {
    title: 'Ask GovExplorer',
    subtitle: 'Your AI guide to Malaysian open data.',
    placeholder: 'Ask anything about Malaysia’s data…',
    comingSoon: 'Coming soon',
    description: 'Soon you’ll be able to chat with an AI assistant trained on Malaysia’s open data. Ask for trends, comparisons, or instant summaries.',
    sampleQuestion1: 'How has inflation changed in 2025?',
    sampleQuestion2: 'Which state has the highest population growth?',
    sampleQuestion3: 'Compare LRT vs MRT ridership.',
  },
  onboarding: {
    skip: 'Skip',
    next: 'Next',
    start: 'Start exploring',
    slide1Title: 'Malaysia, at a glance',
    slide1Body: 'Open data made daily. Weather, ringgit, ridership, and more — all in one feed.',
    slide2Title: 'Explore by map',
    slide2Body: 'Tap any state to dive into its story — climate, economy, mobility, people.',
    slide3Title: 'Beautiful insights',
    slide3Body: 'Charts you’ll actually want to look at. Save the ones that matter.',
  },
} as const;

type Widen<T> = T extends string
  ? string
  : T extends readonly (infer U)[]
    ? Widen<U>[]
    : T extends object
      ? { [K in keyof T]: Widen<T[K]> }
      : T;

export type Strings = Widen<typeof en>;
