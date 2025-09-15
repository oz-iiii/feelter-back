// 한글 자모음 검색을 위한 유틸리티 함수들

// 한글 자모음 매핑
const KOREAN_INITIAL_CONSONANTS = [
  'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ',
  'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
];

const KOREAN_VOWELS = [
  'ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ',
  'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'
];

const KOREAN_FINAL_CONSONANTS = [
  '', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ',
  'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ',
  'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
];

/**
 * 한글 문자를 자모음으로 분해
 */
export function decomposeKorean(char: string): string {
  const code = char.charCodeAt(0);

  // 한글 완성형 범위 (가-힣)
  if (code >= 0xAC00 && code <= 0xD7A3) {
    const base = code - 0xAC00;
    const initialIndex = Math.floor(base / 588);
    const vowelIndex = Math.floor((base % 588) / 28);
    const finalIndex = base % 28;

    return KOREAN_INITIAL_CONSONANTS[initialIndex] +
           KOREAN_VOWELS[vowelIndex] +
           KOREAN_FINAL_CONSONANTS[finalIndex];
  }

  // 한글 자모음이면 그대로 반환
  if ((code >= 0x3131 && code <= 0x318E)) {
    return char;
  }

  // 한글이 아니면 그대로 반환
  return char;
}

/**
 * 텍스트를 자모음으로 분해된 형태로 변환
 */
export function decomposeText(text: string): string {
  return text.split('').map(decomposeKorean).join('');
}

/**
 * 검색어가 텍스트에 포함되는지 자모음 단위로 검사
 */
export function koreanIncludes(text: string, searchTerm: string): boolean {
  if (!text || !searchTerm) return false;

  const decomposedText = decomposeText(text.toLowerCase());
  const decomposedSearch = decomposeText(searchTerm.toLowerCase());

  return decomposedText.includes(decomposedSearch);
}

/**
 * 초성으로만 검색 (ㅍ -> 파이널, 프리미엄 등)
 */
export function searchByInitialConsonants(text: string, searchTerm: string): boolean {
  if (!text || !searchTerm) return false;

  // 검색어가 모두 초성인지 확인
  const isAllInitialConsonants = searchTerm.split('').every(char =>
    KOREAN_INITIAL_CONSONANTS.includes(char)
  );

  if (!isAllInitialConsonants) return false;

  // 텍스트에서 초성만 추출
  const textInitials = text.split('').map(char => {
    const code = char.charCodeAt(0);
    if (code >= 0xAC00 && code <= 0xD7A3) {
      const base = code - 0xAC00;
      const initialIndex = Math.floor(base / 588);
      return KOREAN_INITIAL_CONSONANTS[initialIndex];
    }
    return char;
  }).join('');

  return textInitials.includes(searchTerm);
}

/**
 * 고급 한글 검색 함수 (초성, 자모음, 완성형 모두 지원)
 */
export function advancedKoreanSearch(text: string, searchTerm: string): boolean {
  if (!text || !searchTerm) return false;

  const lowerText = text.toLowerCase();
  const lowerSearch = searchTerm.toLowerCase();

  // 1. 기본 문자열 포함 검사
  if (lowerText.includes(lowerSearch)) return true;

  // 2. 초성 검색
  if (searchByInitialConsonants(text, searchTerm)) return true;

  // 3. 자모음 분해 검색
  if (koreanIncludes(text, searchTerm)) return true;

  // 4. 영문 검색 (기본)
  return false;
}

/**
 * 영화 제목 배열에서 검색어에 매칭되는 항목들 필터링
 */
export function filterMoviesByKoreanSearch<T extends { title: string }>(
  movies: T[],
  searchTerm: string
): T[] {
  if (!searchTerm.trim()) return movies;

  return movies.filter(movie =>
    advancedKoreanSearch(movie.title, searchTerm.trim())
  );
}