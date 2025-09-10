import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { execSync } from 'child_process'
import { readFileSync } from 'fs'

// 빌드 시점에 버전 정보 생성
const getVersionInfo = () => {
  const packageJson = JSON.parse(readFileSync('package.json', 'utf-8'))
  const version = packageJson.version
  
  let commitHash = 'unknown'
  let buildTime = new Date().toISOString()
  
  try {
    commitHash = execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim()
  } catch (error) {
    console.warn('Git commit hash not available:', error)
  }
  
  return {
    VITE_APP_VERSION: version,
    VITE_APP_COMMIT: commitHash,
    VITE_APP_BUILD_TIME: buildTime
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    ...getVersionInfo()
  },
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
