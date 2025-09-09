import React, { useState } from 'react'
import { Block, TodoBlock, EventBlock, LongMemoBlock } from '../types/daily'

interface BlockComponentProps {
  block: Block
}

const BlockComponent: React.FC<BlockComponentProps> = ({ block }) => {
  const [isExpanded, setIsExpanded] = useState(!block.collapsed)

  const renderBlockContent = () => {
    switch (block.type) {
      case 'todo':
        return <TodoBlockComponent block={block as TodoBlock} />
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
          {renderBlockContent()}
        </div>
        <div className="ml-3 text-xs text-gray-500">
          {block.type}
        </div>
      </div>
      
      {block.tags.length > 0 && (
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

const TodoBlockComponent: React.FC<{ block: TodoBlock }> = ({ block }) => (
  <div className="flex items-center space-x-2">
    <input
      type="checkbox"
      checked={block.completed}
      readOnly
      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
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

export default BlockComponent
