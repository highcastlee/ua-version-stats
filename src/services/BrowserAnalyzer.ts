import path from 'path';
import UAParser from 'ua-parser-js';
import {
  UserAgentEntry,
  ParsedUserAgent,
  BrowserVersionStats,
  BrowserVersionStat,
  BrowserAnalysisResult,
  VersionCounts,
  BelowMinVersionCounts,
} from '../types/index.js';
import { detectBrowserType, handleSpecialBrowsers } from './BrowserDetector.js';
import * as statsCalculator from './StatsCalculator.js';
import { initializeResultDir, readFileContent, saveToFile } from '../utils/FileHandler.js';
import { MIN_BROWSER_VERSIONS } from '../constants/browsers.js';

const parseUserAgent = (userAgent: string): Omit<ParsedUserAgent, 'time'> => {
  const parser = new UAParser(userAgent);
  const result = parser.getResult();

  return {
    userAgentString: userAgent,
    osName: result.os.name || '',
    osVersion: result.os.version || '',
    browserName: result.browser.name || '',
    browserVersion: result.browser.version || '',
  };
};

const parseUserAgentData = async (
  inputFilePath: string,
  resultDir: string
): Promise<ParsedUserAgent[]> => {
  try {
    const rawData = await readFileContent(inputFilePath);
    const userAgents = JSON.parse(rawData) as UserAgentEntry[];

    const parsedUserAgents = userAgents.map((entry) => ({
      ...parseUserAgent(entry.userAgent),
      time: entry.time,
    }));

    await saveToFile(resultDir, 'step_1_data.json', parsedUserAgents);
    return parsedUserAgents;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`사용자 에이전트 데이터 파싱 중 오류 발생: ${error.message}`);
    }
    throw new Error('사용자 에이전트 데이터 파싱 중 알 수 없는 오류가 발생했습니다.');
  }
};

const initializeBrowserStats = (): BrowserVersionStats => ({
  Chrome: {},
  Safari: {},
  Firefox: {},
  Edge: {},
  Opera: {},
  Samsungbrowser: {},
  Whale: {},
});

const generateBrowserStats = async (
  parsedData: ParsedUserAgent[],
  resultDir: string
): Promise<{ [key: string]: BrowserVersionStat[] }> => {
  try {
    const browsers: BrowserVersionStats = initializeBrowserStats();

    parsedData.forEach((data) => {
      const { browserName, browserVersion, osName, osVersion, userAgentString = '' } = data;
      if (!browserName || !browserVersion) return;

      let version = browserVersion.split('.')[0];
      let targetStats;

      // 특수 브라우저 처리
      const specialBrowser = handleSpecialBrowsers(browserName, osName, osVersion, userAgentString);
      if (specialBrowser && specialBrowser.targetBrowser in browsers) {
        targetStats = browsers[specialBrowser.targetBrowser];
        version = specialBrowser.version;
      } else {
        const browserType = detectBrowserType(browserName, osName);
        targetStats = browsers[browserType];
      }

      if (!targetStats[version]) {
        targetStats[version] = {
          osStats: [],
          exampleUserAgent: userAgentString,
        };
      }

      targetStats[version].osStats = statsCalculator.addOrUpdateStats(
        targetStats[version].osStats,
        osName,
        osVersion
      );
    });

    const formattedStats = formatBrowserStats(browsers);
    await saveToFile(resultDir, 'step_2_data.json', formattedStats);
    return formattedStats;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`브라우저 통계 생성 중 오류 발생: ${error.message}`);
    }
    throw new Error('브라우저 통계 생성 중 알 수 없는 오류가 발생했습니다.');
  }
};

const formatBrowserStats = (
  browsers: BrowserVersionStats
): {
  [key: string]: BrowserVersionStat[];
} => {
  return Object.entries(browsers).reduce<{ [key: string]: BrowserVersionStat[] }>(
    (acc, [name, stats]) => {
      acc[name] = Object.entries(stats).map(([browserVersion, data]) => ({
        browserVersion,
        osStats: data.osStats.sort((a, b) => b.count - a.count),
        exampleUserAgent: data.exampleUserAgent || '',
      }));
      return acc;
    },
    {}
  );
};

const calculateVersionCounts = async (
  browserStats: { [key: string]: BrowserVersionStat[] },
  resultDir: string
): Promise<BrowserAnalysisResult> => {
  try {
    let versionCounts = initializeVersionCounts();
    let belowMinVersionCounts = initializeBelowMinVersionCounts();

    const minVersions = MIN_BROWSER_VERSIONS;

    Object.entries(browserStats).forEach(([browserName, stats]) => {
      const browserKey = browserName.toLowerCase().replace(/\s+/g, '');
      stats.forEach((entry) => {
        const version = parseInt(entry.browserVersion, 10);
        const totalCount = statsCalculator.calculateTotalCount(entry.osStats);

        // 모든 버전 통계 저장
        if (!versionCounts[browserKey]) {
          versionCounts[browserKey] = {};
        }
        versionCounts[browserKey][version] = totalCount;

        // 최소 버전 미만인 경우 따로 저장
        if (version < (minVersions[browserKey as keyof typeof minVersions] || 0)) {
          if (!belowMinVersionCounts[browserKey as keyof typeof belowMinVersionCounts]) {
            belowMinVersionCounts[browserKey as keyof typeof belowMinVersionCounts] = {};
          }
          if (!belowMinVersionCounts[browserKey as keyof typeof belowMinVersionCounts][version]) {
            belowMinVersionCounts[browserKey][version] = {
              count: 0,
              examples: [],
            };
          }
          belowMinVersionCounts[browserKey][version].count = totalCount;
          belowMinVersionCounts[browserKey][version].examples.push({
            userAgentString: entry.exampleUserAgent,
            osStats: entry.osStats,
          });
        }
      });
    });

    const result = { all: versionCounts, belowMinVersion: belowMinVersionCounts };
    await saveToFile(resultDir, 'step_3_data.json', result);
    return result;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`버전 카운트 계산 중 오류 발생: ${error.message}`);
    }
    throw new Error('버전 카운트 계산 중 알 수 없는 오류가 발생했습니다.');
  }
};

const initializeVersionCounts = (): VersionCounts => ({
  chrome: {},
  safari: {},
  firefox: {},
  edge: {},
  opera: {},
  samsungbrowser: {},
  whale: {},
});

const initializeBelowMinVersionCounts = (): BelowMinVersionCounts => ({
  chrome: {},
  safari: {},
  firefox: {},
  edge: {},
  opera: {},
  samsungbrowser: {},
  whale: {},
});

export const analyze = async (inputFilePath: string, outputDir: string): Promise<void> => {
  try {
    await initializeResultDir(outputDir);

    const parsedData = await parseUserAgentData(inputFilePath, outputDir);
    const browserStats = await generateBrowserStats(parsedData, outputDir);
    const analysisResult = await calculateVersionCounts(browserStats, outputDir);

    const { totalCount, belowMinVersionTotal } = statsCalculator.calculateTotals(
      analysisResult.all,
      analysisResult.belowMinVersion
    );

    console.log('✅ 분석이 성공적으로 완료되었습니다.');
    console.log(`📊 총 ${totalCount.toLocaleString('ko-KR')}개의 데이터가 처리되었습니다.`);
    if (belowMinVersionTotal > 0) {
      console.log(
        `⚠️ ${belowMinVersionTotal.toLocaleString('ko-KR')}개의 데이터가 최소 버전 미만입니다.`
      );
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('❌ 분석 중 오류가 발생했습니다:', error.message);
    } else {
      console.error('❌ 분석 중 알 수 없는 오류가 발생했습니다.');
    }
    process.exit(1);
  }
};
