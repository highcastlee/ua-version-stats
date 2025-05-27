import { promises as fs } from 'fs';
import path from 'path';

export const initializeResultDir = async (resultDir: string): Promise<void> => {
  try {
    await fs.mkdir(resultDir, { recursive: true });
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`결과 디렉토리 생성 중 오류 발생: ${error.message}`);
    }
    throw new Error('결과 디렉토리 생성 중 알 수 없는 오류가 발생했습니다.');
  }
};

export const readFileContent = async (filePath: string): Promise<string> => {
  try {
    return await fs.readFile(filePath, 'utf8');
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`파일 읽기 중 오류 발생: ${error.message}`);
    }
    throw new Error('파일 읽기 중 알 수 없는 오류가 발생했습니다.');
  }
};

export const saveToFile = async (
  resultDir: string,
  filename: string,
  data: unknown
): Promise<void> => {
  try {
    await fs.writeFile(path.join(resultDir, filename), JSON.stringify(data, null, 2));
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`파일 저장 중 오류 발생: ${error.message}`);
    }
    throw new Error('파일 저장 중 알 수 없는 오류가 발생했습니다.');
  }
};
