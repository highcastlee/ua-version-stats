export interface UserAgentEntry {
  time: string;
  userAgent: string;
}

export interface ParsedUserAgent {
  time: string;
  userAgentString: string;
  osName: string;
  osVersion: string;
  browserName: string;
  browserVersion: string;
}

export interface OperatingSystemStats {
  osName: string;
  osVersion: string;
  count: number;
}

export interface BrowserVersionStat {
  browserVersion: string;
  osStats: OperatingSystemStats[];
  exampleUserAgent: string;
}

export interface BrowserVersionStats {
  [key: string]: {
    [version: string]: {
      osStats: OperatingSystemStats[];
      exampleUserAgent: string;
    };
  };
}

export interface DetectedBrowserInfo {
  targetBrowser: string | null;
  version: string | null;
}

export interface BrowserStats {
  [browserKey: string]: {
    [version: string]: {
      osStats: OperatingSystemStats[];
      exampleUserAgent: string;
    };
  };
}

export interface VersionCounts {
  [browserKey: string]: {
    [version: string]: number;
  };
}

export interface BelowMinVersionData {
  count: number;
  examples: Array<{
    userAgentString: string;
    osStats: OperatingSystemStats[];
  }>;
}

export interface BelowMinVersionCounts {
  [browserKey: string]: {
    [version: string]: BelowMinVersionData;
  };
}

export interface BrowserAnalysisResult {
  all: VersionCounts;
  belowMinVersion: BelowMinVersionCounts;
}
