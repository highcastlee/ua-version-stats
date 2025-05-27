export const MIN_BROWSER_VERSIONS = {
  chrome: 87,
  safari: 14,
  firefox: 78,
  edge: 88,
  opera: 73,
  samsungbrowser: 14,
  whale: 3,
} as const;

export const BROWSER_MAP = {
  Firefox: 'Firefox',
  Edge: 'Edge',
  Opera: 'Opera',
  Safari: 'Safari',
  Chrome: 'Chrome',
  'Samsung Internet': 'Samsungbrowser',
  Samsungbrowser: 'Samsungbrowser',
  Whale: 'Whale',
} as const;

export const IOS_APP_IDENTIFIERS = ['FBAN/FBIOS', 'DaumApps', 'KAKAOTALK', 'WorksMobile'] as const;
