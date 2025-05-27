import fs from 'fs/promises';
import path from 'path';

interface Config {
  defaultInputPath: string;
  outputDir: string;
}

async function loadConfig(): Promise<Config> {
  try {
    const configPath = path.resolve(process.cwd(), 'config.json');
    const configData = await fs.readFile(configPath, 'utf-8');
    return JSON.parse(configData);
  } catch (error) {
    // 기본 설정값 반환
    return {
      defaultInputPath: './data.json',
      outputDir: './result',
    };
  }
}

const config = await loadConfig();
export default config;
