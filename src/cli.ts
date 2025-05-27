import { Command } from 'commander';
import inquirer from 'inquirer';
import path from 'path';
import fs from 'fs/promises';
import defaultConfig from './config.js';
import { analyze } from './services/BrowserAnalyzer.js';

interface Config {
  inputPath: string;
  outputDir: string;
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function promptForConfig(): Promise<Config> {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'inputPath',
      message: '입력 파일 경로를 입력하세요:',
      default: defaultConfig.defaultInputPath,
      async validate(input: string) {
        if (!input) return '파일 경로를 입력해주세요.';
        if (!(await fileExists(input))) return '파일이 존재하지 않습니다.';
        return true;
      },
    },
    {
      type: 'input',
      name: 'outputDir',
      message: '결과 저장 경로를 입력하세요:',
      default: defaultConfig.outputDir,
    },
  ]);

  return {
    inputPath: path.resolve(answers.inputPath),
    outputDir: path.resolve(answers.outputDir),
  };
}

export async function run(): Promise<void> {
  const program = new Command();

  program
    .name('ua-version-stats')
    .description('User Agent 버전 통계 분석 도구')
    .version('1.0.0')
    .option('-i, --input <path>', '입력 JSON 파일 경로')
    .option('-o, --output <path>', '결과 저장 디렉토리 경로')
    .parse(process.argv);

  const options = program.opts();
  let config: Config;

  if (options.input) {
    // CLI 옵션이 제공된 경우
    config = {
      inputPath: path.resolve(options.input),
      outputDir: path.resolve(options.output || defaultConfig.outputDir),
    };
  } else {
    // 대화형 모드로 전환
    console.log('🔍 대화형 모드를 시작합니다...\n');
    config = await promptForConfig();
  }

  try {
    console.log('\n📊 분석을 시작합니다...');
    await analyze(config.inputPath, config.outputDir);
  } catch (error) {
    console.error(
      '\n❌ 오류가 발생했습니다:',
      error instanceof Error ? error.message : '알 수 없는 오류'
    );
    process.exit(1);
  }
}
