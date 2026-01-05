import React, {
  useEffect,
  forwardRef,
  useImperativeHandle
} from 'react'
import { useGLTF, useVideoTexture } from '@react-three/drei'

export const Laptop = forwardRef(
  ({ phase, onEnded, onVideoReady, ...props }, ref) => {

    const { nodes, materials } = useGLTF('Laptop-transformed.glb')

    const texture = useVideoTexture('video.mp4', {
      src: 'video.mp4',
      start: false,
      loop: false,
      muted: true,
      playsInline: true
    })

    const video = texture.image

    /* ----------------------------------
       ① 親から呼ばれる「命令」を定義
       ---------------------------------- */
    useImperativeHandle(ref, () => ({
      playWithSound() {
        if (!video) return
        video.currentTime = 0.2
        video.muted = false
        video.play().catch((e) => {
          console.error('Play error:', e)
        })
      }
    }), [video])

    /* ----------------------------------
       ② 動画の読み込み完了通知（そのまま）
       ---------------------------------- */
    useEffect(() => {
      if (!video) return

      if (video.readyState >= 3) {
        onVideoReady && onVideoReady()
      } else {
        const handleCanPlay = () => {
          onVideoReady && onVideoReady()
        }
        video.addEventListener('canplay', handleCanPlay)
        return () => video.removeEventListener('canplay', handleCanPlay)
      }
    }, [video, onVideoReady])

    /* ----------------------------------
       ③ phase は「停止・後始末」だけ担当
       （再生・unmute は絶対にしない）
       ---------------------------------- */
    useEffect(() => {
      if (!video) return

      video.loop = false

      const handleEnded = () => {
        onEnded && onEnded()
      }

      video.addEventListener('ended', handleEnded)

      if (phase !== 2) {
        video.pause()
      }

      return () => {
        video.removeEventListener('ended', handleEnded)
      }
    }, [phase, video, onEnded])

    return (
      <group {...props} dispose={null}>
        <mesh geometry={nodes.Screen.geometry}>
          <meshBasicMaterial map={texture} toneMapped={false} />
        </mesh>
        <mesh
          geometry={nodes['LapTop_Cube002-Mesh'].geometry}
          material={materials.DarkGray}
        />
        <mesh
          geometry={nodes['LapTop_Cube002-Mesh_1'].geometry}
          material={materials.lighterGray}
        />
        <mesh
          geometry={nodes['LapTop_Cube002-Mesh_2'].geometry}
          material={materials.Gray2}
        />
        <mesh
          geometry={nodes['LapTop_Cube002-Mesh_3'].geometry}
          material={materials.Screen}
        />
      </group>
    )
  }
)

useGLTF.preload('Laptop-transformed.glb')
