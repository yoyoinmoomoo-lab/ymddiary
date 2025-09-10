import React from 'react'
import DailyView from './components/DailyView'
import VersionInfo from './components/VersionInfo'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">YMD Diary</h1>
          <p className="text-sm text-gray-600 mt-1">
            Digital diary combining Daily / Weekly / Monthly / Yearly views
          </p>
        </div>
      </header>
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        <DailyView />
      </main>
      
      {/* 버전 정보 */}
      <VersionInfo />
    </div>
  )
}

export default App
