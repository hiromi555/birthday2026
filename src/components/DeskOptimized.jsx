import React from 'react'
import { useGLTF } from '@react-three/drei'

export function Desk(props) {
  const { nodes, materials } = useGLTF('Desk-transformed.glb')
    return (
    <group {...props} dispose={null}>
      <mesh geometry={nodes.Chair.geometry} material={materials.PaletteMaterial001} scale={[1, 1.021, 1]} />
      <mesh geometry={nodes.Desk.geometry} material={materials.ComputerMouse_mat1} />
    </group>
  )
}

useGLTF.preload('Desk-transformed.glb')
