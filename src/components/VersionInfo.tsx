import React, { useState } from 'react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

interface VersionInfoProps {
  className?: string
}

const VersionInfo: React.FC<VersionInfoProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false)

  // 빌드 시점에 주입된 환경변수
  const version = import.meta.env.VITE_APP_VERSION || 'unknown'
  const commit = import.meta.env.VITE_APP_COMMIT || 'unknown'
  const buildTime = import.meta.env.VITE_APP_BUILD_TIME || new Date().toISOString()

  // 빌드 시간을 로컬 타임존으로 포맷팅
  const formatBuildTime = (isoString: string) => {
    try {
      const date = new Date(isoString)
      return format(date, 'yyyy-MM-dd HH:mm:ss', { locale: ko })
    } catch (error) {
      return 'unknown'
    }
  }

  const handleClick = () => {
    setIsOpen(!isOpen)
  }

  const handleClose = () => {
    setIsOpen(false)
  }

  return (
    <>
      {/* 버전 표시 */}
      <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
        <button
          onClick={handleClick}
          className="text-xs text-gray-400 hover:text-gray-600 transition-colors duration-200 font-mono"
          title="버전 정보 보기"
        >
          v{version}
        </button>
      </div>

      {/* 팝오버 */}
      {isOpen && (
        <>
          {/* 배경 오버레이 */}
          <div 
            className="fixed inset-0 z-40 bg-black bg-opacity-25"
            onClick={handleClose}
          />
          
          {/* 팝오버 내용 */}
          <div className="fixed bottom-16 right-4 z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-4 min-w-64">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">버전 정보</h3>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">버전:</span>
                <span className="font-mono text-gray-900">v{version}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">커밋:</span>
                <span className="font-mono text-gray-900">{commit}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">빌드:</span>
                <span className="font-mono text-gray-900">{formatBuildTime(buildTime)}</span>
              </div>
            </div>
            
            {/* 꼬리표 */}
            <div className="absolute -bottom-1 right-6 w-2 h-2 bg-white border-r border-b border-gray-200 transform rotate-45"></div>
          </div>
        </>
      )}
    </>
  )
}

export default VersionInfo
