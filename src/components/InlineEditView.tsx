import React, { useState, useEffect, useRef } from 'react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { DailyParser } from '../utils/dailyParser'
import { Block, DailyEntry } from '../types/daily'
import { useDailyEntries } from '../hooks/useDailyEntries'

interface EditableLine {
  id: string
  text: string
  isEditing: boolean
  block?: Block
}

const InlineEditView: React.FC = () => {
  const [lines, setLines] = useState<EditableLine[]>([])
  const [parser] = useState(() => new DailyParser())
  const [focusedLineId, setFocusedLineId] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  
  const { 
    entries,
    currentBlocks, 
    updateBlocks, 
    saveEntry
  } = useDailyEntries()

  const today = new Date()

  // 오늘 날짜의 엔트리 로드
  useEffect(() => {
    const entry = entries.find(e => 
      e.date.toDateString() === today.toDateString()
    )
    
    if (entry) {
      // 기존 블록들을 라인으로 변환
      const newLines: EditableLine[] = entry.blocks.map((block, index) => ({
        id: `line-${index}`,
        text: getBlockDisplayText(block),
        isEditing: false,
        block
      }))
      setLines(newLines)
    } else {
      // 빈 라인 하나 추가
      setLines([{
        id: 'line-0',
        text: '',
        isEditing: false
      }])
    }
  }, [entries])

  // 블록을 표시 텍스트로 변환
  const getBlockDisplayText = (block: Block): string => {
    switch (block.type) {
      case 'todo':
        return `[ ] ${block.text}`
      case 'important':
        return `! ${block.text}`
      case 'event':
        if (block.startTime) {
          return `@ ${block.startTime} ${block.text}`
        } else if (block.date) {
          const relativeDate = format(block.date, 'M월 d일', { locale: ko })
          return `@ ${relativeDate} ${block.text}`
        }
        return `@ ${block.text}`
      case 'long_memo':
        return `> ${block.text}`
      default:
        return block.text
    }
  }

  // 라인 텍스트를 블록으로 파싱
  const parseLineToBlock = (text: string): Block | null => {
    if (!text.trim()) return null
    
    const result = parser.parse(text)
    return result.blocks.length > 0 ? result.blocks[0] : null
  }

  // 라인 편집 시작
  const startEditing = (lineId: string) => {
    setLines(prev => prev.map(line => 
      line.id === lineId 
        ? { ...line, isEditing: true }
        : { ...line, isEditing: false }
    ))
    setFocusedLineId(lineId)
  }

  // 라인 편집 완료
  const finishEditing = (lineId: string, newText: string) => {
    const block = parseLineToBlock(newText)
    
    setLines(prev => prev.map(line => 
      line.id === lineId 
        ? { 
            ...line, 
            text: newText, 
            isEditing: false, 
            block: block || undefined
          }
        : line
    ))
    
    setFocusedLineId(null)
    
    // 전체 블록 업데이트
    updateAllBlocks()
  }

  // 모든 라인을 블록으로 변환하여 업데이트
  const updateAllBlocks = () => {
    const blocks: Block[] = []
    
    lines.forEach(line => {
      if (line.block) {
        blocks.push(line.block)
      } else if (line.text.trim()) {
        const parsedBlock = parseLineToBlock(line.text)
        if (parsedBlock) {
          blocks.push(parsedBlock)
        }
      }
    })
    
    updateBlocks(blocks)
  }

  // 새 라인 추가
  const addNewLine = () => {
    const newLineId = `line-${Date.now()}`
    setLines(prev => [...prev, {
      id: newLineId,
      text: '',
      isEditing: true
    }])
    setFocusedLineId(newLineId)
  }

  // 라인 삭제
  const deleteLine = (lineId: string) => {
    setLines(prev => prev.filter(line => line.id !== lineId))
    updateAllBlocks()
  }

  // Enter 키 처리
  const handleKeyPress = (e: React.KeyboardEvent, lineId: string) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const target = e.target as HTMLInputElement
      finishEditing(lineId, target.value)
      
      // 새 라인 추가
      setTimeout(() => {
        addNewLine()
      }, 100)
    }
  }

  // 저장
  const handleSave = () => {
    updateAllBlocks()
    saveEntry(today, currentBlocks)
    alert('저장되었습니다!')
  }

  // 초기화
  const handleClear = () => {
    setLines([{
      id: 'line-0',
      text: '',
      isEditing: false
    }])
    updateBlocks([])
  }

  // 포커스 처리
  useEffect(() => {
    if (focusedLineId && inputRef.current) {
      inputRef.current.focus()
    }
  }, [focusedLineId])

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Daily 인라인 편집
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {format(today, 'yyyy년 M월 d일 EEEE', { locale: ko })}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="btn-primary"
            >
              저장
            </button>
            <button
              onClick={handleClear}
              className="btn-secondary"
            >
              초기화
            </button>
          </div>
        </div>
      </div>

      {/* 인라인 편집 영역 */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Daily 기록 (줄 단위 편집)
        </h3>
        
        <div className="space-y-2">
          {lines.map((line, index) => (
            <div key={line.id} className="flex items-center gap-2 group">
              {line.isEditing ? (
                <input
                  ref={focusedLineId === line.id ? inputRef : null}
                  type="text"
                  defaultValue={line.text}
                  onKeyPress={(e) => handleKeyPress(e, line.id)}
                  onBlur={(e) => finishEditing(line.id, e.target.value)}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm"
                  placeholder="텍스트를 입력하세요..."
                />
              ) : (
                <div
                  className="flex-1 px-2 py-1 border border-transparent rounded cursor-pointer hover:bg-gray-50 hover:border-gray-200 font-mono text-sm"
                  onClick={() => startEditing(line.id)}
                >
                  {line.text || '클릭하여 편집...'}
                </div>
              )}
              
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => startEditing(line.id)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                  title="편집"
                >
                  ✏️
                </button>
                <button
                  onClick={() => deleteLine(line.id)}
                  className="p-1 text-gray-400 hover:text-red-600"
                  title="삭제"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 text-xs text-gray-500">
          <p><strong>사용법:</strong></p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>줄을 클릭하여 편집 모드로 전환</li>
            <li>Enter로 저장하고 새 줄 추가</li>
            <li>지원 기호: <code>[ ]</code>, <code>!</code>, <code>@</code>, <code>{'>'}</code>, <code>#태그</code></li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default InlineEditView
