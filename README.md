# UA Version Stats

브라우저 사용자 에이전트 문자열을 분석하여 통계를 생성하는 도구입니다.

## 설치

```bash
npm install
# or
yarn install
```

## 사용 방법

```bash
yarn start
```

## 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`yarn commit`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 라이선스

MIT 라이선스에 따라 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 설치 방법

```bash
npm install
```

## 사용 방법

JSON 파일 형식:

```json
[
  {
    "time": "2024-03-20T12:00:00Z",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
  }
]
```

분석 실행:

```bash
node analyze.js input.json
```

## 결과

분석이 완료되면 `result` 디렉토리에 다음 파일들이 생성됩니다:

1. `step_1_data.json`: 파싱된 사용자 에이전트 정보
2. `step_2_data.json`: 브라우저별 통계
3. `step_3_data.json`: 버전별 사용자 수

## 지원하는 브라우저

- Chrome
- Safari
- Firefox
- Edge
- Opera
- Samsung Browser
- Whale

## 최소 지원 버전

- Chrome: 87+
- Safari: 14+
- Firefox: 78+
- Edge: 88+
- Opera: 73+
- Samsung Browser: 14+
- Whale: 3+
