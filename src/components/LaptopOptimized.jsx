import React, { useEffect, forwardRef, useImperativeHandle } from 'react'
import { useGLTF, useVideoTexture } from '@react-three/drei'

export const Laptop = forwardRef(({ phase, onEnded, onVideoReady, ...props }, ref) => {
  const { nodes, materials } = useGLTF('Laptop-transformed.glb')

  // 動画設定：iPhoneの自動ロードを促すため最初はmuted: true
  const texture = useVideoTexture('video.mp4', {
    src: 'video.mp4',
    start: false,
    loop: false,
    muted: true,
    playsInline: true
  })

  const video = texture.image

  // 親(App.jsx)から動画を操作するための命令セット
  useImperativeHandle(ref, () => ({
    playWithSound() {
      if (!video) return
      video.currentTime = 0.2
      video.muted = false // ユーザー操作のタイミングなのでミュート解除OK
      video.play().catch((e) => console.error('Play error:', e))
    }
  }), [video])

  // ビデオのロード監視
  useEffect(() => {
    if (!video) return

    let isReady = false
    const handleReady = () => {
      if (!isReady) {
        isReady = true
        onVideoReady && onVideoReady()
      }
    }

    // A. 普通の監視（レベル1以上で合格）
    if (video.readyState >= 1) {
      handleReady()
    } else {
      video.addEventListener('loadedmetadata', handleReady)
    }

    // B. 【保険】もし3秒経っても反応がなければ、強制的にReadyにする
    // （iPhoneが完全に読み込みをサボっている場合への対策）
    const timer = setTimeout(() => {
      console.log("Force video ready due to timeout")
      handleReady()
    }, 3000) // 3000ms = 3秒

    return () => {
      video.removeEventListener('loadedmetadata', handleReady)
      clearTimeout(timer)
    }
  }, [video, onVideoReady])

  // 再生終了とポーズの管理
  useEffect(() => {
    if (!video) return
    video.loop = false
    const handleEnded = () => onEnded && onEnded()
    video.addEventListener('ended', handleEnded)
    if (phase !== 2) {
      video.pause()
    }
    return () => video.removeEventListener('ended', handleEnded)
  }, [phase, video, onEnded])

  return (
    <group {...props} dispose={null}>
      <mesh geometry={nodes.Screen.geometry}>
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
      <mesh geometry={nodes['LapTop_Cube002-Mesh'].geometry} material={materials.DarkGray} />
      <mesh geometry={nodes['LapTop_Cube002-Mesh_1'].geometry} material={materials.lighterGray} />
      <mesh geometry={nodes['LapTop_Cube002-Mesh_2'].geometry} material={materials.Gray2} />
      <mesh geometry={nodes['LapTop_Cube002-Mesh_3'].geometry} material={materials.Screen} />
    </group>
  )
})

useGLTF.preload('Laptop-transformed.glb')
