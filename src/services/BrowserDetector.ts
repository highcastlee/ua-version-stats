export const detectBrowserType = (browserName: string, osName: string): string => {
  switch (browserName) {
    case 'Firefox':
      return 'Firefox';
    case 'Edge':
      return 'Edge';
    case 'Opera':
      return 'Opera';
    case 'Safari':
      return 'Safari';
    case 'Chrome':
      return 'Chrome';
    case 'Samsung Internet':
    case 'Samsungbrowser':
      return 'Samsungbrowser';
    case 'Whale':
      return 'Whale';
    default:
      return osName === 'iOS' || osName === 'Mac OS' ? 'Safari' : 'Chrome';
  }
};

export const handleSpecialBrowsers = (
  browserName: string,
  osName: string,
  osVersion: string,
  userAgentString: string
): { targetBrowser: string; version: string } | null => {
  // iOS 앱들 처리
  const isIOSApp =
    (userAgentString.includes('FBAN/FBIOS') ||
      userAgentString.includes('DaumApps') ||
      userAgentString.includes('KAKAOTALK') ||
      userAgentString.includes('WorksMobile') ||
      userAgentString.includes('CriOS') ||
      userAgentString.includes('FxiOS') ||
      userAgentString.includes('EdgiOS') ||
      userAgentString.includes('OPiOS')) &&
    osName === 'iOS';

  // iOS 기반 앱들
  if ((isIOSApp || browserName === 'NAVER') && osName === 'iOS' && osVersion) {
    return {
      targetBrowser: 'Safari',
      version: osVersion.split('.')[0],
    };
  }

  // Android/기타 OS의 NAVER 앱 또는 인앱 브라우저
  const isAndroidApp =
    (browserName === 'NAVER' ||
      (userAgentString.includes('KAKAOTALK') && userAgentString.includes('INAPP')) ||
      userAgentString.includes('DaumApps') ||
      userAgentString.includes('WorksMobile')) &&
    osName !== 'iOS';

  if (isAndroidApp) {
    const chromeMatch = userAgentString.match(/Chrome\/(\d+)/);
    if (chromeMatch) {
      return {
        targetBrowser: 'Chrome',
        version: chromeMatch[1],
      };
    }
  }

  return null;
};
