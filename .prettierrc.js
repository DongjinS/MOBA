module.exports = {
  printWidth: 80, // 한 줄 최대 문자 수
  tabWidth: 2, // 들여쓰기 시, 탭 너비는 2
  useTabs: false, // tab대신 스페이스바 사용으로 대체
  semi: true, // 문장 끝 세미콜론 사용
  singleQuote: true, // 작은 따옴표 사용
  trailingComma: 'all', // 꼬리 콤마 사용
  bracketSpacing: true, // 중괄호 내에 공백 사용
  arrowParens: 'always', // 화살표 함수 단일 인자 시, 괄호 무조건 사용 - 8.4 일관성 위해
  proseWrap: 'never', // 마크다운 포매팅 제외
  endOfLine: 'auto', // windows에 뜨는 'Delete cr' 에러 해결
};
