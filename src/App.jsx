import React, { Suspense, useState, useEffect, useRef} from 'react'
import { Canvas } from '@react-three/fiber'
import { CameraControls, Environment, useProgress, Sparkles } from '@react-three/drei'
import { Avatar } from './components/AvatarOptimized.jsx'
import { Desk } from './components/DeskOptimized.jsx'
import { Laptop } from './components/LaptopOptimized.jsx'

export default function App() {
  const cameraRef = useRef()
  // 0:仕事中, 1:指差し, 2:動画再生, 3:終了
  const [phase, setPhase] = useState(0)
  const { progress } = useProgress()
  const [isPortrait, setIsPortrait] = useState(window.innerHeight > window.innerWidth)
  const [isReady, setIsReady] = useState(false)
  const [isVideoReady, setIsVideoReady] = useState(false)
 //progressバー
  const isLoaded = progress === 100 && isVideoReady
  useEffect(() => {
    if (isLoaded) {
      const timer = setTimeout(() => {
        setIsReady(true)
      }, 700)
      return () => clearTimeout(timer)
    }
  }, [isLoaded])
 //リサイズ
   useEffect(() => {
        const handleResize = () => setIsPortrait(window.innerHeight > window.innerWidth)
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])
// カメラワークの制御
  useEffect(() => {
    if (!cameraRef.current) return
    if (phase === 0) {
       cameraRef.current.setLookAt(1.50, 0.61, 1.72, 0.00, 0.00, 0.00, true)
    } else if (phase === 1) {
       cameraRef.current.setLookAt(0, 0.7, 2, 0.3, 0.4, 0, true)
    } else if (phase === 2) {
      if (isPortrait) {// 縦長デバイスの場合
        cameraRef.current.setLookAt(0.29, 0.26, -0.12, 0.29, 0.10, 1.00, true)
     //    cameraRef.current.setLookAt(0.29, 0.35, -0.01, 0.29, 0.10, 1.00, true)
       // cameraRef.current.setLookAt(0.29, 0.35, -0.01, 0.29, 0.30, 1.00, true)
      } else {
        cameraRef.current.setLookAt(0.29, 0.35, 0.34, 0.29, 0.30, 1.00, true)
      }
    } else if (phase === 3) {
      cameraRef.current.setLookAt(0, 0.3, 1.6, -0.1, -0.2, 0, true)
    }
  }, [phase, isPortrait])

//デバック用
  useEffect(() => {
  const logPosition = () => {
    if (cameraRef.current) {
      const pos = cameraRef.current.getPosition() // カメラの位置
      const tgt = cameraRef.current.getTarget()   // 見ている中心点
      console.log(`cameraRef.current.setLookAt(${pos.x.toFixed(2)}, ${pos.y.toFixed(2)}, ${pos.z.toFixed(2)}, ${tgt.x.toFixed(2)}, ${tgt.y.toFixed(2)}, ${tgt.z.toFixed(2)}, true)`)
    }
  }
  window.addEventListener('click', logPosition)
  return () => window.removeEventListener('click', logPosition)
  }, [])

  const handleVideoEnd = () => {
    setPhase(3)
  }
  return (
  <div style={{ width: '100vw', height: '100dvh', overflow: 'hidden' }}>
     <div className="ui-layer">
      {/*HTML*/}
        {!isReady && (
          <div className="loading-screen"
            style={{
                opacity: isReady ? 0 : 1,
                transition: 'opacity 1s ease',
                pointerEvents: isReady ? 'none' : 'auto'
            }}
          >
            <div className="spinner"></div>
            <div>Loading... {Math.round(progress)}%</div>
          </div>
        )}

        {isReady && phase === 0 && (
          <button
            className="action-btn btn-finish"
            onClick={() => setPhase(1)}
          >
            ✅ Finish Work
          </button>
        )}

        {phase === 1 && (
          <button
            className="action-btn btn-play"
            onClick={() => setPhase(2)}
          >
           🎵 🎬 Play Movie
          </button>
        )}

        {phase === 3 && (
            <div className="end-card">
                {/* <h1><span>HAPPY BIRTHDAY!</span> </h1>
                */}
                <h1><span>素敵な一年になりますように</span>🎉</h1>
                <button
                className="action-btn btn-replay"
                onClick={() => setPhase(2)}
                >
                🔄 Replay
                </button>
            </div>
         )}
        </div>

      <Canvas camera={{ position: [1, 1, 2.1] }}
       style={{
            opacity: isReady ? 1 : 0,
            transition: 'opacity 1s ease'
        }}
        dpr={[1, 1.5]}
        >
          {/* <axesHelper args={[5]} />
        <gridHelper args={[10, 10]} /> */}
        <color attach="background" args={['#101018']} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <Environment preset="warehouse"/>

        {/* モデル */}
        <Suspense fallback={null}>
           <CameraControls ref={cameraRef}
            minDistance={
                phase === 2
                ? (isPortrait ? 0 : 0.3)
                : 1.5
            }
            maxDistance={6}
           />
            {phase !== 3 && (
                <group position={[0.2, -0.5, 0]}>
                    <group visible={phase !== 2}  position-x={ 0.05 } position-z={ -0.05 }>
                        <Avatar animation={phase === 0 ? "Typing" : "Pointing"} />
                    </group>
                    {/* 最初（Phase 0）だけデスクを表示 */}

                    <group visible={phase === 0} scale={[1, 0.92, 1]}>
                        <Desk />
                    </group>
                    {/* PCは動画が終わるまでずっと表示 */}
                    <group scale={[1, 0.92, 0.9]}>
                        <Laptop
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
                 <Sparkles
                    count={50}
                    size={4}
                    speed={0.4}
                    color="#ffd6ff"
                    scale={[2, 2, 2]}
                    position={[0, 1, 0]}
                    />
                </group>
            )}
        </Suspense>
      </Canvas>
    </div>
  )
}
