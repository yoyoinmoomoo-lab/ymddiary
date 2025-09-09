import React, { useState } from 'react'
import { Block, TodoBlock, EventBlock, LongMemoBlock, BlockType } from '../types/daily'
import { parseTags, formatTags } from '../utils/tagUtils'

interface BlockComponentProps {
  block: Block
  onToggle?: (blockId: string) => void
  onUpdate?: (blockId: string, updates: Partial<Block>) => void
}

const BlockComponent: React.FC<BlockComponentProps> = ({ block, onToggle, onUpdate }) => {
  const [isExpanded, setIsExpanded] = useState(!block.collapsed)
  const [isEditing, setIsEditing] = useState(false)

  const renderBlockContent = () => {
    switch (block.type) {
      case 'todo':
        return <TodoBlockComponent block={block as TodoBlock} onToggle={onToggle} />
      case 'event':
        return <EventBlockComponent block={block as EventBlock} />
      case 'long_memo':
        return <LongMemoBlockComponent 
          block={block as LongMemoBlock} 
          isExpanded={isExpanded}
          onToggle={() => setIsExpanded(!isExpanded)}
        />
      case 'important':
        return <ImportantBlockComponent block={block} />
      case 'note':
        return <NoteBlockComponent block={block} />
      default:
        return <div className="text-gray-500">알 수 없는 블록 타입</div>
    }
  }

  return (
    <div className={`border rounded-lg p-3 ${
      block.type === 'important' ? 'border-red-200 bg-red-50' :
      block.type === 'event' ? 'border-blue-200 bg-blue-50' :
      block.type === 'todo' ? 'border-green-200 bg-green-50' :
      block.type === 'long_memo' ? 'border-purple-200 bg-purple-50' :
      'border-gray-200 bg-gray-50'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {isEditing ? (
            <BlockEditForm 
              block={block} 
              onSave={(updates) => {
                onUpdate?.(block.id, updates)
                setIsEditing(false)
              }}
              onCancel={() => setIsEditing(false)}
            />
          ) : (
            renderBlockContent()
          )}
        </div>
        <div className="ml-3 flex items-center space-x-2">
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="text-xs text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100"
              title="편집"
            >
              ✏️
            </button>
          )}
          <div className="text-xs text-gray-500">
            {block.type}
          </div>
        </div>
      </div>
      
      {!isEditing && block.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {block.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

const TodoBlockComponent: React.FC<{ 
  block: TodoBlock
  onToggle?: (blockId: string) => void 
}> = ({ block, onToggle }) => (
  <div className="flex items-center space-x-2">
    <input
      type="checkbox"
      checked={block.completed}
      onChange={() => onToggle?.(block.id)}
      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 cursor-pointer"
    />
    <span className={`${block.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
      {block.text}
    </span>
  </div>
)

const EventBlockComponent: React.FC<{ block: EventBlock }> = ({ block }) => (
  <div>
    <div className="flex items-center space-x-2">
      <span className="text-sm font-medium text-blue-600">
        🕐 {block.startTime}
      </span>
      {block.endTime && (
        <span className="text-sm text-blue-500">
          - {block.endTime}
        </span>
      )}
    </div>
    <div className="mt-1 text-gray-900">
      {block.title}
    </div>
    {block.location && (
      <div className="mt-1 text-sm text-gray-600">
        📍 {block.location}
      </div>
    )}
  </div>
)

const LongMemoBlockComponent: React.FC<{ 
  block: LongMemoBlock
  isExpanded: boolean
  onToggle: () => void
}> = ({ block, isExpanded, onToggle }) => (
  <div>
    <div className="flex items-center space-x-2">
      <button
        onClick={onToggle}
        className="text-sm font-medium text-purple-600 hover:text-purple-700"
      >
        {isExpanded ? '▼' : '▶'} {block.title || '긴 메모'}
      </button>
    </div>
    {isExpanded && (
      <div className="mt-2 text-gray-900 whitespace-pre-wrap">
        {block.body}
      </div>
    )}
  </div>
)

const ImportantBlockComponent: React.FC<{ block: Block }> = ({ block }) => (
  <div className="flex items-center space-x-2">
    <span className="text-red-600 font-bold">⚠️</span>
    <span className="text-gray-900 font-medium">{block.text}</span>
  </div>
)

const NoteBlockComponent: React.FC<{ block: Block }> = ({ block }) => (
  <div className="text-gray-900">
    {block.text}
  </div>
)

// 블록 편집 폼 컴포넌트
interface BlockEditFormProps {
  block: Block
  onSave: (updates: Partial<Block>) => void
  onCancel: () => void
}

const BlockEditForm: React.FC<BlockEditFormProps> = ({ block, onSave, onCancel }) => {
  const [blockType, setBlockType] = useState<BlockType>(block.type)
  const [text, setText] = useState(block.text)
  const [tags, setTags] = useState(formatTags(block.tags))
  const [startTime, setStartTime] = useState(
    block.type === 'event' ? (block as EventBlock).startTime : ''
  )
  const [endTime, setEndTime] = useState(
    block.type === 'event' ? (block as EventBlock).endTime || '' : ''
  )
  const [title, setTitle] = useState(
    block.type === 'event' ? (block as EventBlock).title :
    block.type === 'long_memo' ? (block as LongMemoBlock).title || '' : ''
  )
  const [body, setBody] = useState(
    block.type === 'long_memo' ? (block as LongMemoBlock).body : ''
  )

  const handleSave = () => {
    const normalizedTags = parseTags(tags)

    const updates: Partial<Block> = {
      type: blockType,
      text,
      tags: normalizedTags,
      updatedAt: new Date()
    }

    // 이벤트 블록인 경우 시간 정보 추가
    if (blockType === 'event') {
      Object.assign(updates, {
        startTime,
        endTime: endTime || undefined,
        title: title || text
      })
    }

    // 긴 메모 블록인 경우 body 정보 추가
    if (blockType === 'long_memo') {
      Object.assign(updates, {
        title: title || '긴 메모',
        body: body || text,
        collapsed: false
      })
    }

    onSave(updates)
  }

  return (
    <div className="space-y-3">
      {/* 블록 타입 선택 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          블록 타입
        </label>
        <select
          value={blockType}
          onChange={(e) => setBlockType(e.target.value as BlockType)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="note">📝 메모</option>
          <option value="todo">✅ 할 일</option>
          <option value="important">⚠️ 중요</option>
          <option value="event">🕐 이벤트</option>
          <option value="long_memo">📄 긴 메모</option>
        </select>
      </div>

      {/* 이벤트 시간 입력 */}
      {blockType === 'event' && (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              시작 시간
            </label>
            <input
              type="text"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              placeholder="예: 14:30, 오후 2시"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              종료 시간 (선택)
            </label>
            <input
              type="text"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              placeholder="예: 15:30, 오후 3시"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      )}

      {/* 제목 입력 (이벤트, 긴 메모) */}
      {(blockType === 'event' || blockType === 'long_memo') && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            제목
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목을 입력하세요"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      )}

      {/* 텍스트 입력 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          내용
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="내용을 입력하세요"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          rows={3}
        />
      </div>

      {/* 긴 메모 본문 */}
      {blockType === 'long_memo' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            본문
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="긴 메모 본문을 입력하세요"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            rows={5}
          />
        </div>
      )}

      {/* 태그 입력 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          태그
        </label>
        <input
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="태그를 공백으로 구분하여 입력하세요 (예: #중요 #프로젝트)"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* 버튼 */}
      <div className="flex justify-end space-x-2">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          취소
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          저장
        </button>
      </div>
    </div>
  )
}

export default BlockComponent
