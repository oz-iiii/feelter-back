import { advancedKoreanSearch, decomposeText } from './koreanSearch';

/**
 * 텍스트에서 검색어에 해당하는 부분을 찾아 하이라이팅 정보를 반환
 */
export function getHighlightInfo(text: string, searchTerm: string): {
  isMatch: boolean;
  highlightedText: string;
} {
  if (!text || !searchTerm.trim()) {
    return {
      isMatch: false,
      highlightedText: text
    };
  }

  const isMatch = advancedKoreanSearch(text, searchTerm);

  if (!isMatch) {
    return {
      isMatch: false,
      highlightedText: text
    };
  }

  // 간단한 하이라이팅: 정확히 일치하는 부분만 하이라이트
  const lowerText = text.toLowerCase();
  const lowerSearch = searchTerm.toLowerCase();

  // 정확한 문자열 매치를 찾아 하이라이트
  const index = lowerText.indexOf(lowerSearch);
  if (index !== -1) {
    const before = text.substring(0, index);
    const matched = text.substring(index, index + searchTerm.length);
    const after = text.substring(index + searchTerm.length);

    return {
      isMatch: true,
      highlightedText: `${before}<mark class="bg-yellow-300 text-black px-1 rounded">${matched}</mark>${after}`
    };
  }

  // 정확한 매치가 없으면 원본 텍스트 반환 (하지만 매치된 상태로)
  return {
    isMatch: true,
    highlightedText: text
  };
}

/**
 * React에서 사용할 수 있는 하이라이트된 텍스트 컴포넌트 생성 정보
 */
export function createHighlightProps(text: string, searchTerm: string) {
  const { isMatch, highlightedText } = getHighlightInfo(text, searchTerm);

  // DOM 요소에 전달될 props만 반환 (isMatch는 제외)
  return {
    dangerouslySetInnerHTML: { __html: highlightedText }
  };
}