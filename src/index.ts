import { run } from './cli.js';

if (import.meta.url === new URL(import.meta.url).href) {
  run().catch((error) => {
    console.error('❌ 예기치 않은 오류가 발생했습니다:', error);
    process.exit(1);
  });
}

export { analyze } from './services/BrowserAnalyzer.js';
