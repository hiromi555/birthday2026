import React, { Suspense, useState, useEffect, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { CameraControls, Environment, useProgress, Sparkles } from '@react-three/drei'
import { Avatar } from './components/AvatarOptimized.jsx'
import { Desk } from './components/DeskOptimized.jsx'
import { Laptop } from './components/LaptopOptimized.jsx'

export default function App() {
  const cameraRef = useRef()
  const laptopRef = useRef() // Laptopコンポーネントを操作するためのRef

  const [phase, setPhase] = useState(0)
  const { progress } = useProgress()
  const [isPortrait, setIsPortrait] = useState(window.innerHeight > window.innerWidth)
  const [isReady, setIsReady] = useState(false)
  const [isVideoReady, setIsVideoReady] = useState(false)

  // モデルさえ読み込めれば表示を開始（動画のロード待機はしない）
  const isLoaded = progress === 100

  useEffect(() => {
    if (isLoaded) {
      const timer = setTimeout(() => setIsReady(true), 700)
      return () => clearTimeout(timer)
    }
  }, [isLoaded])

  // リサイズ検知
  useEffect(() => {
    const handleResize = () => setIsPortrait(window.innerHeight > window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // カメラワーク制御
  useEffect(() => {
    if (!cameraRef.current) return
    if (phase === 0) {
      cameraRef.current.setLookAt(1.50, 0.61, 1.72, 0.00, 0.00, 0.00, true)
    } else if (phase === 1) {
      cameraRef.current.setLookAt(0, 0.7, 2, 0.3, 0.4, 0, true)
    } else if (phase === 2) {
      isPortrait
        ? cameraRef.current.setLookAt(0.29, 0.26, -0.12, 0.29, 0.15, 1.00, true)
        : cameraRef.current.setLookAt(0.29, 0.35, 0.34, 0.29, 0.30, 1.00, true)
    } else if (phase === 3) {
      cameraRef.current.setLookAt(0, 0.3, 1.6, -0.1, -0.2, 0, true)
    }
  }, [phase, isPortrait])

  const handleVideoEnd = () => setPhase(3)

  return (
    <div style={{ width: '100vw', height: '100dvh', overflow: 'hidden' }}>
      <div className="ui-layer">
        {/* ローディング画面 */}
        {!isReady && (
          <div className="loading-screen" style={{ opacity: isReady ? 0 : 1, transition: 'opacity 1s ease' }}>
            <div className="spinner"></div>
            <div>Loading... {Math.round(progress)}%</div>
          </div>
        )}

        {/* ボタン制御 */}
        {isReady && phase === 0 && (
          <button className="action-btn btn-finish" onClick={() => setPhase(1)}>
            ✅ Finish Work
          </button>
        )}

        {phase === 1 && (
          <button
            className="action-btn btn-play"
            disabled={!isVideoReady}
            onClick={() => {
              laptopRef.current?.playWithSound() // 子コンポーネントの関数を実行
              setPhase(2)
            }}
          >
          {isVideoReady ? "🎵 🎬 Play Movie" : "🎬 Video Loading..."}
          </button>
        )}

        {phase === 3 && (
          <div className="end-card">
            <h1><span>素敵な一年になりますように</span>🎉</h1>
          </div>
        )}
      </div>

      <Canvas camera={{ position: [1, 1, 2.1] }} dpr={[1, 1.5]} style={{ opacity: isReady ? 1 : 0, transition: 'opacity 1s ease' }}>
        <color attach="background" args={['#101018']} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <Environment preset="warehouse"/>

        <Suspense fallback={null}>
          <CameraControls ref={cameraRef}
            minDistance={phase === 2 ? (isPortrait ? 0 : 0.3) : 1.5}
            maxDistance={6}
          />

          {phase !== 3 && (
            <group position={[0.2, -0.5, 0]}>
              <group visible={phase !== 2} position={[0.05, 0, -0.05]}>
                <Avatar animation={phase === 0 ? "Typing" : "Pointing"} />
              </group>

              <group visible={phase === 0} scale={[1, 0.92, 1]}>
                <Desk />
              </group>

              <group scale={[1, 0.92, 0.9]}>
                <Laptop
                  ref={laptopRef}
                  phase={phase}
                  onEnded={handleVideoEnd}
                  onVideoReady={() => setIsVideoReady(true)}
                />
              </group>
            </group>
          )}

          {phase === 3 && (
            <group position={[0, -1.2, 0]}>
              <Avatar animation="Dancing" />
              <Sparkles count={50} size={4} speed={0.4} color="#ffd6ff" scale={[2, 2, 2]} position={[0, 1, 0]} />
            </group>
          )}
        </Suspense>
      </Canvas>
    </div>
  )
}
