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
    // Long Memo 처리
    if (this.options.enableLongMemo && line.startsWith('+ ')) {
      return this.parseLongMemo(line, allLines, currentIndex);
    }

    // Todo 처리
    if (line.startsWith('- [ ]') || line.startsWith('- ')) {
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
    const isCompleted = line.startsWith('- [x]') || line.startsWith('- [X]');
    const text = line.replace(/^- \[[ xX]\]\s*/, '').replace(/^-\s*/, '');
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
    const title = line.replace(/^\+\s*/, '');
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
    return /^@\s*\d{1,2}[:시]\d{0,2}[분]?/.test(line) || /^\d{1,2}[:시]\d{0,2}[분]?\s+/.test(line);
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
    return tagMatches ? tagMatches.map(tag => tag.substring(1)) : [];
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
