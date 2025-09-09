import { useState, useCallback, useEffect } from 'react'
import { Block, DailyEntry } from '../types/daily'

const STORAGE_KEY = 'ymd-diary-entries'

export const useDailyEntries = () => {
  const [entries, setEntries] = useState<DailyEntry[]>([])
  const [currentBlocks, setCurrentBlocks] = useState<Block[]>([])

  // 로컬 스토리지에서 엔트리 로드
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsedEntries = JSON.parse(stored).map((entry: any) => ({
          ...entry,
          date: new Date(entry.date),
          blocks: entry.blocks.map((block: any) => ({
            ...block,
            createdAt: new Date(block.createdAt),
            updatedAt: new Date(block.updatedAt)
          }))
        }))
        setEntries(parsedEntries)
      }
    } catch (error) {
      console.error('Failed to load entries from localStorage:', error)
    }
  }, [])

  // 엔트리 변경 시 로컬 스토리지에 저장
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
    } catch (error) {
      console.error('Failed to save entries to localStorage:', error)
    }
  }, [entries])

  const toggleTodo = useCallback((blockId: string) => {
    setCurrentBlocks(prevBlocks => {
      const updatedBlocks = prevBlocks.map(block => 
        block.id === blockId && block.type === 'todo'
          ? { ...block, completed: !block.completed, updatedAt: new Date() }
          : block
      )
      
      // Todo 상태 변경 시 자동 저장
      const todoBlock = updatedBlocks.find(block => block.id === blockId && block.type === 'todo')
      if (todoBlock) {
        // 현재 날짜로 자동 저장
        const today = new Date()
        const entry: DailyEntry = {
          id: `entry_${today.getTime()}`,
          date: today,
          blocks: updatedBlocks,
          createdAt: new Date(),
          updatedAt: new Date()
        }
        
        setEntries(prevEntries => {
          const existingIndex = prevEntries.findIndex(e => 
            e.date.toDateString() === today.toDateString()
          )
          
          if (existingIndex >= 0) {
            const updated = [...prevEntries]
            updated[existingIndex] = entry
            return updated
          } else {
            return [...prevEntries, entry]
          }
        })
      }
      
      return updatedBlocks
    })
  }, [])

  const updateBlocks = useCallback((blocks: Block[]) => {
    setCurrentBlocks(blocks)
  }, [])

  const saveEntry = useCallback((date: Date, blocks: Block[]) => {
    const entry: DailyEntry = {
      id: `entry_${date.getTime()}`,
      date,
      blocks,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    setEntries(prevEntries => {
      const existingIndex = prevEntries.findIndex(e => 
        e.date.toDateString() === date.toDateString()
      )
      
      if (existingIndex >= 0) {
        const updated = [...prevEntries]
        updated[existingIndex] = entry
        return updated
      } else {
        return [...prevEntries, entry]
      }
    })
  }, [])

  const loadEntry = useCallback((date: Date) => {
    const entry = entries.find(e => 
      e.date.toDateString() === date.toDateString()
    )
    
    if (entry) {
      setCurrentBlocks(entry.blocks)
    } else {
      setCurrentBlocks([])
    }
  }, [entries])

  return {
    entries,
    currentBlocks,
    toggleTodo,
    updateBlocks,
    saveEntry,
    loadEntry
  }
}
