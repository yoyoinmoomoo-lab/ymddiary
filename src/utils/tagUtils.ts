// 태그 관련 유틸리티 함수

/**
 * 태그 문자열을 정규화합니다
 * - 소문자로 변환
 * - # 접두사 제거
 * - 공백 제거
 * - 빈 문자열 필터링
 */
export const normalizeTag = (tag: string): string => {
  return tag
    .trim()
    .toLowerCase()
    .replace(/^#/, '')
    .replace(/\s+/g, '')
}

/**
 * 태그 배열을 정규화하고 중복을 제거합니다
 */
export const normalizeTags = (tags: string[]): string[] => {
  const normalized = tags
    .map(normalizeTag)
    .filter(tag => tag.length > 0)
  
  // 중복 제거
  return [...new Set(normalized)]
}

/**
 * 태그 문자열을 파싱하여 정규화된 태그 배열로 변환합니다
 * - 공백으로 구분
 * - 쉼표로 구분
 * - # 접두사 자동 처리
 */
export const parseTags = (tagString: string): string[] => {
  if (!tagString.trim()) return []
  
  const tags = tagString
    .split(/[\s,]+/)
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0)
  
  return normalizeTags(tags)
}

/**
 * 태그 배열을 표시용 문자열로 변환합니다
 */
export const formatTags = (tags: string[]): string => {
  return tags.map(tag => `#${tag}`).join(' ')
}
