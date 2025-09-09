// Daily Entry 관련 타입 정의

export type BlockType = 'todo' | 'note' | 'important' | 'event' | 'long_memo';

export interface BaseBlock {
  id: string;
  type: BlockType;
  text: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TodoBlock extends BaseBlock {
  type: 'todo';
  completed: boolean;
}

export interface NoteBlock extends BaseBlock {
  type: 'note';
}

export interface ImportantBlock extends BaseBlock {
  type: 'important';
}

export interface EventBlock extends BaseBlock {
  type: 'event';
  startTime: string;
  endTime?: string;
  title: string;
  location?: string;
}

export interface LongMemoBlock extends BaseBlock {
  type: 'long_memo';
  title?: string;
  body: string;
  collapsed: boolean;
}

export type Block = TodoBlock | NoteBlock | ImportantBlock | EventBlock | LongMemoBlock;

export interface DailyEntry {
  id: string;
  date: Date;
  blocks: Block[];
  createdAt: Date;
  updatedAt: Date;
}

// 파서 관련 타입
export interface ParseResult {
  blocks: Block[];
  errors: string[];
}

export interface ParserOptions {
  enableLongMemo: boolean;
  enableEventParsing: boolean;
  enableTagExtraction: boolean;
}
