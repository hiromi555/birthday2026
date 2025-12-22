import React, { useRef, useEffect } from 'react'
import { useGraph } from '@react-three/fiber'
import { useGLTF, useAnimations } from '@react-three/drei'
import { SkeletonUtils } from 'three-stdlib'

export function Avatar({ animation = "Typing", ...props }) {
  const group = useRef()
  const { scene, animations } = useGLTF('Avatar-transformed.glb')
  const clone = React.useMemo(() => SkeletonUtils.clone(scene), [scene])
  const { nodes, materials } = useGraph(clone)
  const { actions } = useAnimations(animations, group)

  useEffect(() => {
        // 1. 次にやる動き（Typing? Pointing?）を取得
        const nextAction = actions[animation]
        if (nextAction) {
        // 2. 今動いている全てのアニメーションをじわっと止める
          Object.values(actions).forEach((action) => {
            if (action !== nextAction && action.isRunning()) {
              action.fadeOut(0.5)
            }
          })
        // 3. 次の動きをじわっと開始する
          nextAction.reset().fadeIn(0.5).play()
        }
        // コンポーネントが消える時に止める
        return () => {
          if (nextAction) nextAction.fadeOut(0.5)
        }
  }, [animation, actions])

   return (
    <group ref={group} {...props} dispose={null}>
      <group name="Scene">
        <group name="Armature" rotation={[-Math.PI / 2, 0, 0]} scale={-0.01}>
          <primitive object={nodes.mixamorigHips} />
          <skinnedMesh name="Ch03" geometry={nodes.Ch03.geometry} material={materials.Ch03_Body} skeleton={nodes.Ch03.skeleton} />
        </group>
        <mesh name="Screen" geometry={nodes.Screen.geometry} material={nodes.Screen.material} rotation={[-Math.PI / 2, 0, 0]} scale={-0.01} />
      </group>
    </group>
  )
}
useGLTF.preload('Avatar-transformed.glb')
