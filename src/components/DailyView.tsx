import React, { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { DailyParser } from '../utils/dailyParser'
import { Block, DailyEntry } from '../types/daily'
import BlockComponent from './BlockComponent'
import { useDailyEntries } from '../hooks/useDailyEntries'

const DailyView: React.FC = () => {
  const [inputText, setInputText] = useState('')
  const [parser] = useState(() => new DailyParser())
  const { 
    entries,
    currentBlocks, 
    toggleTodo, 
    updateBlocks, 
    updateBlock,
    saveEntry, 
    loadEntry 
  } = useDailyEntries()

  const handleParse = () => {
    const result = parser.parse(inputText)
    updateBlocks(result.blocks)
    
    if (result.errors.length > 0) {
      console.warn('Parse errors:', result.errors)
    }
  }

  const handleClear = () => {
    setInputText('')
    updateBlocks([])
  }

  const handleSave = () => {
    saveEntry(today, currentBlocks)
    alert('저장되었습니다!')
  }

  const today = new Date()

  // 오늘 날짜의 엔트리 로드 (한 번만 실행)
  useEffect(() => {
    const entry = entries.find(e => 
      e.date.toDateString() === today.toDateString()
    )
    
    if (entry) {
      updateBlocks(entry.blocks)
    } else {
      updateBlocks([])
    }
  }, [entries, updateBlocks]) // entries가 변경될 때만 실행

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Daily View
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {format(today, 'yyyy년 M월 d일 EEEE', { locale: ko })}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleParse}
              className="btn-primary"
            >
              파싱
            </button>
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

      {/* 입력 영역 */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Daily 기록 입력
        </h3>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`예시:
일반 메모 (기본 불릿)
[ ] 할 일 #중요
- [ ] 다른 할 일
! 중요한 메모
@ 오후 12시 점심 약속 #일정
@ 내일 e-ticket 인쇄
> 회고
이번 달은 정말 바빴다...
다음 달 목표는 더 체계적으로 관리하는 것이다.

빈 줄도 불릿으로 처리`}
          className="w-full h-64 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
        />
        <div className="mt-2 text-xs text-gray-500">
          <p><strong>지원하는 기호:</strong></p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li><strong>기본</strong>: 일반 텍스트는 불릿(Note) 블록</li>
            <li><code>[ ]</code> 또는 <code>- [ ]</code>: 할 일</li>
            <li><code>!</code>: 중요한 메모</li>
            <li><code>@ 시간</code> 또는 <code>시간</code>: 이벤트/일정</li>
            <li><code>@ 오전/오후 시간</code>: 한국어 시간 (예: @ 오후 12시)</li>
            <li><code>@ 오늘/내일/모레</code>: 상대 날짜</li>
            <li><code>{'>'}</code>: 긴 메모 (다음 빈 줄까지)</li>
            <li><code>#태그</code>: 태그 (어디든 사용 가능)</li>
          </ul>
        </div>
      </div>

      {/* 파싱 결과 */}
      {currentBlocks.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            파싱 결과 ({currentBlocks.length}개 블록)
          </h3>
          <div className="space-y-3">
            {currentBlocks.map((block) => (
              <BlockComponent 
                key={block.id} 
                block={block} 
                onToggle={toggleTodo}
                onUpdate={updateBlock}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default DailyView
