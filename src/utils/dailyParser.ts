import { Block, BlockType, ParseResult, ParserOptions, TodoBlock, NoteBlock, ImportantBlock, EventBlock, LongMemoBlock } from '../types/daily';

/**
 * Daily 텍스트를 파싱하여 블록 배열로 변환
 */
export class DailyParser {
  private options: ParserOptions;

  constructor(options: Partial<ParserOptions> = {}) {
    this.options = {
      enableLongMemo: true,
      enableEventParsing: true,
      enableTagExtraction: true,
      ...options
    };
  }

  /**
   * 텍스트를 파싱하여 블록 배열 반환
   */
  parse(text: string): ParseResult {
    const lines = text.split('\n');
    const blocks: Block[] = [];
    const errors: string[] = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i].trim();
      
      if (!line) {
        i++;
        continue;
      }

      try {
        const result = this.parseLine(line, lines, i);
        if (result.block) {
          blocks.push(result.block);
        }
        i = result.nextIndex;
      } catch (error) {
        errors.push(`Line ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        i++;
      }
    }

    return { blocks, errors };
  }

  /**
   * 단일 라인을 파싱
   */
  private parseLine(line: string, allLines: string[], currentIndex: number): { block: Block | null; nextIndex: number } {
    // 빈 줄 처리 - 기본 Note 블록 생성
    if (!line.trim()) {
      return { block: this.parseNote(''), nextIndex: currentIndex + 1 };
    }

    // Long Memo 처리
    if (this.options.enableLongMemo && line.startsWith('> ')) {
      return this.parseLongMemo(line, allLines, currentIndex);
    }

    // Todo 처리 - `[`로 시작하는 경우도 Todo로 처리
    if (line.startsWith('- [ ]') || line.startsWith('- ') || line.startsWith('[ ]')) {
      return { block: this.parseTodo(line), nextIndex: currentIndex + 1 };
    }

    // Important 처리
    if (line.startsWith('! ')) {
      return { block: this.parseImportant(line), nextIndex: currentIndex + 1 };
    }

    // Event 처리
    if (this.options.enableEventParsing && this.isEventLine(line)) {
      return { block: this.parseEvent(line), nextIndex: currentIndex + 1 };
    }

    // 기본 Note 처리
    return { block: this.parseNote(line), nextIndex: currentIndex + 1 };
  }

  /**
   * Todo 블록 파싱
   */
  private parseTodo(line: string): TodoBlock {
    // `- [x]`, `- [X]`, `[x]`, `[X]`, `[ ]` 패턴 처리
    const isCompleted = line.startsWith('- [x]') || line.startsWith('- [X]') || 
                       line.startsWith('[x]') || line.startsWith('[X]');
    
    // 텍스트에서 기호 제거
    let text = line;
    if (line.startsWith('- [x]') || line.startsWith('- [X]')) {
      text = line.replace(/^- \[[ xX]\]\s*/, '');
    } else if (line.startsWith('[x]') || line.startsWith('[X]')) {
      text = line.replace(/^\[[ xX]\]\s*/, '');
    } else if (line.startsWith('[ ]')) {
      text = line.replace(/^\[\s*\]\s*/, '');
    } else if (line.startsWith('- ')) {
      text = line.replace(/^-\s*/, '');
    }
    
    const tags = this.extractTags(text);

    return {
      id: this.generateId(),
      type: 'todo',
      text: text.replace(/#\w+/g, '').trim(),
      tags,
      completed: isCompleted,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  /**
   * Note 블록 파싱
   */
  private parseNote(line: string): NoteBlock {
    const tags = this.extractTags(line);

    return {
      id: this.generateId(),
      type: 'note',
      text: line.replace(/#\w+/g, '').trim(),
      tags,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  /**
   * Important 블록 파싱
   */
  private parseImportant(line: string): ImportantBlock {
    const text = line.replace(/^!\s*/, '');
    const tags = this.extractTags(text);

    return {
      id: this.generateId(),
      type: 'important',
      text: text.replace(/#\w+/g, '').trim(),
      tags,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  /**
   * Event 블록 파싱
   */
  private parseEvent(line: string): EventBlock {
    const cleanLine = line.replace(/^@\s*/, '');
    
    // 한국어 시간/날짜 파싱 시도
    const koreanTimeMatch = this.parseKoreanTime(cleanLine);
    if (koreanTimeMatch) {
      return koreanTimeMatch;
    }
    
    // 기존 숫자 시간 파싱
    const timeMatch = cleanLine.match(/^(\d{1,2}[:시]\d{0,2}[분]?)\s+(.+)/);
    
    if (!timeMatch) {
      throw new Error('Invalid event format');
    }

    const [, timeStr, title] = timeMatch;
    const normalizedTime = this.normalizeTime(timeStr);
    const tags = this.extractTags(title);

    return {
      id: this.generateId(),
      type: 'event',
      startTime: normalizedTime,
      title: title.replace(/#\w+/g, '').trim(),
      tags,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  /**
   * Long Memo 블록 파싱
   */
  private parseLongMemo(line: string, allLines: string[], currentIndex: number): { block: LongMemoBlock; nextIndex: number } {
    const title = line.replace(/^>\s*/, '');
    let body = '';
    let nextIndex = currentIndex + 1;

    // 다음 빈 줄까지 모든 내용을 body로 수집
    while (nextIndex < allLines.length) {
      const nextLine = allLines[nextIndex].trim();
      if (nextLine === '') {
        break;
      }
      body += (body ? '\n' : '') + nextLine;
      nextIndex++;
    }

    const tags = this.extractTags(title + ' ' + body);

    return {
      block: {
        id: this.generateId(),
        type: 'long_memo',
        title: title.replace(/#\w+/g, '').trim(),
        body: body.replace(/#\w+/g, '').trim(),
        text: title, // BaseBlock의 text 필드
        tags,
        collapsed: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      nextIndex
    };
  }

  /**
   * 이벤트 라인인지 확인
   */
  private isEventLine(line: string): boolean {
    // @ 시간 패턴 또는 시간 패턴으로 시작하는지 확인
    return /^@\s*\d{1,2}[:시]\d{0,2}[분]?/.test(line) || 
           /^\d{1,2}[:시]\d{0,2}[분]?\s+/.test(line) ||
           /^@\s*(오전|오후)\s*\d{1,2}시/.test(line) ||
           /^@\s*(오늘|내일|모레)/.test(line);
  }

  /**
   * 시간 문자열 정규화
   */
  private normalizeTime(timeStr: string): string {
    // 12시, 12:30, 12시 30분 등을 HH:mm 형식으로 변환
    const match = timeStr.match(/(\d{1,2})[:시](\d{0,2})[분]?/);
    if (!match) {
      throw new Error('Invalid time format');
    }

    const [, hour, minute] = match;
    const h = hour.padStart(2, '0');
    const m = (minute || '00').padStart(2, '0');
    
    return `${h}:${m}`;
  }

  /**
   * 태그 추출
   */
  private extractTags(text: string): string[] {
    if (!this.options.enableTagExtraction) {
      return [];
    }

    const tagMatches = text.match(/#\w+/g);
    const tags = tagMatches ? tagMatches.map(tag => tag.substring(1)) : [];
    console.log('Extracting tags from:', text, 'Found:', tags);
    return tags;
  }

  /**
   * 한국어 시간/날짜 파싱
   */
  private parseKoreanTime(line: string): EventBlock | null {
    // 오전/오후 시간 파싱: @ 오후 12시 점심
    const ampmMatch = line.match(/^(오전|오후)\s*(\d{1,2})시(?:\s*(\d{1,2})분)?\s+(.+)/);
    if (ampmMatch) {
      const [, period, hour, minute, title] = ampmMatch;
      const normalizedTime = this.normalizeAmPmTime(period, hour, minute);
      const tags = this.extractTags(title);
      
      return {
        id: this.generateId(),
        type: 'event',
        startTime: normalizedTime,
        title: title.replace(/#\w+/g, '').trim(),
        tags,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }
    
    // 상대 날짜 파싱: @내일 e-ticket 인쇄
    const relativeDateMatch = line.match(/^(오늘|내일|모레)\s+(.+)/);
    if (relativeDateMatch) {
      const [, dateKeyword, title] = relativeDateMatch;
      const tags = this.extractTags(title);
      
      return {
        id: this.generateId(),
        type: 'event',
        startTime: '00:00', // 상대 날짜는 시간을 00:00으로 설정
        title: title.replace(/#\w+/g, '').trim(),
        tags,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }
    
    return null;
  }

  /**
   * 오전/오후 시간 정규화
   */
  private normalizeAmPmTime(period: string, hour: string, minute?: string): string {
    let h = parseInt(hour);
    const m = minute ? parseInt(minute) : 0;
    
    // 오후 12시는 12시, 오전 12시는 0시
    if (period === '오후' && h !== 12) {
      h += 12;
    } else if (period === '오전' && h === 12) {
      h = 0;
    }
    
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  }

  /**
   * 고유 ID 생성
   */
  private generateId(): string {
    return `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// 기본 파서 인스턴스
export const defaultParser = new DailyParser();
