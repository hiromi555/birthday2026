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
    const handleCanPlay = () => onVideoReady && onVideoReady()

    if (video.readyState >= 3) {
      handleCanPlay()
    } else {
      video.addEventListener('canplay', handleCanPlay)
      return () => video.removeEventListener('canplay', handleCanPlay)
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
