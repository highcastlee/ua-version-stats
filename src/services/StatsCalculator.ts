import {
  OperatingSystemStats,
  BrowserVersionStat,
  VersionCounts,
  BelowMinVersionCounts,
} from '../types/index.js';
import { MIN_BROWSER_VERSIONS } from '../constants/browsers.js';

export const calculateTotalCount = (osStats: OperatingSystemStats[]): number => {
  return osStats.reduce((sum, stat) => sum + stat.count, 0);
};

export const updateVersionCount = (
  browserKey: string,
  version: number,
  count: number,
  versionCounts: VersionCounts
): VersionCounts => {
  return {
    ...versionCounts,
    [browserKey]: {
      ...(versionCounts[browserKey] || {}),
      [version]: count,
    },
  };
};

export const checkAndUpdateBelowMinVersion = (
  browserKey: string,
  version: number,
  count: number,
  entry: BrowserVersionStat,
  belowMinVersionCounts: BelowMinVersionCounts
): BelowMinVersionCounts => {
  const minVersion = MIN_BROWSER_VERSIONS[browserKey as keyof typeof MIN_BROWSER_VERSIONS];
  if (version >= (minVersion || 0)) {
    return belowMinVersionCounts;
  }

  const existingBrowserVersions = belowMinVersionCounts[browserKey] || {};
  const existingVersionData = existingBrowserVersions[version] || { count: 0, examples: [] };

  return {
    ...belowMinVersionCounts,
    [browserKey]: {
      ...existingBrowserVersions,
      [version]: {
        count,
        examples: [
          ...existingVersionData.examples,
          {
            userAgentString: entry.exampleUserAgent,
            osStats: entry.osStats,
          },
        ],
      },
    },
  };
};

export const addOrUpdateStats = (
  statsArray: OperatingSystemStats[],
  osName: string,
  osVersion: string
): OperatingSystemStats[] => {
  const normalizedOsName = osName || '';
  const normalizedOsVersion = osVersion || '';
  const existingStatIndex = statsArray.findIndex(
    (stat) => stat.osName === normalizedOsName && stat.osVersion === normalizedOsVersion
  );

  if (existingStatIndex === -1) {
    return [
      ...statsArray,
      {
        osName: normalizedOsName,
        osVersion: normalizedOsVersion,
        count: 1,
      },
    ];
  }

  return statsArray.map((stat, index) =>
    index === existingStatIndex ? { ...stat, count: stat.count + 1 } : stat
  );
};

export const calculateTotals = (
  all: VersionCounts,
  belowMinVersion: BelowMinVersionCounts
): { totalCount: number; belowMinVersionTotal: number } => {
  return Object.entries(all).reduce(
    (acc, [browser, versions]) => {
      const browserTotal = Object.values(versions).reduce((sum, count) => sum + count, 0);
      const belowMinVersions = belowMinVersion[browser] || {};
      const belowMinCount = Object.values(belowMinVersions).reduce(
        (sum, versionData) => sum + versionData.count,
        0
      );

      return {
        totalCount: acc.totalCount + browserTotal,
        belowMinVersionTotal: acc.belowMinVersionTotal + belowMinCount,
      };
    },
    { totalCount: 0, belowMinVersionTotal: 0 }
  );
};
