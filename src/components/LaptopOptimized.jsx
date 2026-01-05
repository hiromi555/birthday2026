import React, { useEffect } from 'react'
import { useGLTF, useVideoTexture } from '@react-three/drei'

export function Laptop({ phase, onEnded, onVideoReady, ...props }) {
  const { nodes, materials } = useGLTF('Laptop-transformed.glb')

  const texture = useVideoTexture('video1.mp4', {
    src: 'video1.mp4',
    start: false,
    loop: false,
    muted: true,
    playsInline: true
  })

  // 追加箇所：ビデオの読み込み完了を監視する処理
  useEffect(() => {
    const video = texture.image
    // すでに読み込みが終わっている場合 (キャッシュなど)
    if (video.readyState >= 3) {
      onVideoReady && onVideoReady()
    } else {
      // まだなら読み込み完了イベントを待つ
      const handleCanPlay = () => {
        onVideoReady && onVideoReady()
      }
      video.addEventListener('canplay', handleCanPlay)
      return () => video.removeEventListener('canplay', handleCanPlay)
    }
  }, [texture, onVideoReady])


  // 既存の処理：再生コントロール
  useEffect(() => {
    const video = texture.image

    if (video) {
      video.loop = false
      if (phase === 2) {
        video.muted = false // ここで音を解禁！
        video.currentTime = 0.2
        video.muted = false
        video.play().catch((e) => console.error("Play error:", e))
        const handleEnded = () => {
            if (onEnded) onEnded();
        }
        video.addEventListener('ended', handleEnded)
        return () => {
            video.removeEventListener('ended', handleEnded)
        }
      } else {
        video.pause()
      }
    }
  }, [phase, texture, onEnded])

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
}

useGLTF.preload('Laptop-transformed.glb')
