import React, { useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'
import { GameState, BuildingType } from '../App'

interface CitySceneProps {
  gameState: GameState
  onBuildingPlace: (x: number, z: number) => void
}

const GRID_SIZE = 20
const CELL_SIZE = 1

// Building colors
const BUILDING_COLORS = {
  residential: '#10B981', // Green
  commercial: '#3B82F6', // Blue  
  industrial: '#F59E0B', // Orange
  road: '#6B7280' // Gray
}

// Building heights
const BUILDING_HEIGHTS = {
  residential: 1.5,
  commercial: 2,
  industrial: 1,
  road: 0.1
}

function GridPlane({ onCellClick }: { onCellClick: (x: number, z: number) => void }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hoveredCell, setHoveredCell] = useState<{ x: number, z: number } | null>(null)

  const handleClick = (event: THREE.Event) => {
    event.stopPropagation()
    const point = event.point
    const x = Math.floor(point.x + 0.5)
    const z = Math.floor(point.z + 0.5)
    
    // Ensure within grid bounds
    if (x >= -GRID_SIZE/2 && x < GRID_SIZE/2 && z >= -GRID_SIZE/2 && z < GRID_SIZE/2) {
      onCellClick(x, z)
    }
  }

  const handlePointerMove = (event: THREE.Event) => {
    const point = event.point
    const x = Math.floor(point.x + 0.5)
    const z = Math.floor(point.z + 0.5)
    
    if (x >= -GRID_SIZE/2 && x < GRID_SIZE/2 && z >= -GRID_SIZE/2 && z < GRID_SIZE/2) {
      setHoveredCell({ x, z })
    }
  }

  const handlePointerLeave = () => {
    setHoveredCell(null)
  }

  return (
    <group>
      {/* Ground plane */}
      <mesh 
        ref={meshRef}
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 0, 0]}
        onClick={handleClick}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
      >
        <planeGeometry args={[GRID_SIZE, GRID_SIZE]} />
        <meshLambertMaterial color="#22C55E" />
      </mesh>

      {/* Grid lines */}
      {Array.from({ length: GRID_SIZE + 1 }, (_, i) => {
        const pos = i - GRID_SIZE / 2
        return (
          <group key={`grid-${i}`}>
            {/* Vertical lines */}
            <line>
              <bufferGeometry>
                <bufferAttribute
                  attach="attributes-position"
                  count={2}
                  array={new Float32Array([
                    pos, 0.01, -GRID_SIZE/2,
                    pos, 0.01, GRID_SIZE/2
                  ])}
                  itemSize={3}
                />
              </bufferGeometry>
              <lineBasicMaterial color="#16A34A" opacity={0.3} transparent />
            </line>
            {/* Horizontal lines */}
            <line>
              <bufferGeometry>
                <bufferAttribute
                  attach="attributes-position"
                  count={2}
                  array={new Float32Array([
                    -GRID_SIZE/2, 0.01, pos,
                    GRID_SIZE/2, 0.01, pos
                  ])}
                  itemSize={3}
                />
              </bufferGeometry>
              <lineBasicMaterial color="#16A34A" opacity={0.3} transparent />
            </line>
          </group>
        )
      })}

      {/* Hover indicator */}
      {hoveredCell && (
        <mesh position={[hoveredCell.x, 0.02, hoveredCell.z]}>
          <planeGeometry args={[0.9, 0.9]} />
          <meshBasicMaterial color="#FBBF24" opacity={0.5} transparent />
        </mesh>
      )}
    </group>
  )
}

function Building({ 
  type, 
  position, 
  id 
}: { 
  type: BuildingType
  position: [number, number, number]
  id: string 
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)
  
  useFrame((state) => {
    if (meshRef.current && type !== 'road') {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.02
    }
  })

  const height = BUILDING_HEIGHTS[type]
  const color = BUILDING_COLORS[type]

  if (type === 'road') {
    return (
      <mesh 
        ref={meshRef}
        position={[position[0], height/2, position[2]]}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        <boxGeometry args={[0.8, height, 0.8]} />
        <meshLambertMaterial 
          color={hovered ? '#9CA3AF' : color}
          transparent
          opacity={0.8}
        />
      </mesh>
    )
  }

  return (
    <group position={[position[0], 0, position[2]]}>
      {/* Building base */}
      <mesh 
        ref={meshRef}
        position={[0, height/2, 0]}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[0.8, height, 0.8]} />
        <meshLambertMaterial 
          color={hovered ? '#FFFFFF' : color}
        />
      </mesh>

      {/* Building details */}
      {type === 'residential' && (
        <>
          {/* Roof */}
          <mesh position={[0, height + 0.2, 0]}>
            <coneGeometry args={[0.5, 0.4, 4]} />
            <meshLambertMaterial color="#DC2626" />
          </mesh>
          {/* Windows */}
          <mesh position={[0.35, height * 0.7, 0]}>
            <boxGeometry args={[0.1, 0.2, 0.2]} />
            <meshLambertMaterial color="#60A5FA" />
          </mesh>
          <mesh position={[-0.35, height * 0.7, 0]}>
            <boxGeometry args={[0.1, 0.2, 0.2]} />
            <meshLambertMaterial color="#60A5FA" />
          </mesh>
        </>
      )}

      {type === 'commercial' && (
        <>
          {/* Sign */}
          <mesh position={[0, height + 0.3, 0]}>
            <boxGeometry args={[0.6, 0.2, 0.1]} />
            <meshLambertMaterial color="#FBBF24" />
          </mesh>
          {/* Large windows */}
          <mesh position={[0.35, height * 0.5, 0]}>
            <boxGeometry args={[0.1, 0.6, 0.6]} />
            <meshLambertMaterial color="#93C5FD" />
          </mesh>
          <mesh position={[-0.35, height * 0.5, 0]}>
            <boxGeometry args={[0.1, 0.6, 0.6]} />
            <meshLambertMaterial color="#93C5FD" />
          </mesh>
        </>
      )}

      {type === 'industrial' && (
        <>
          {/* Chimney */}
          <mesh position={[0.2, height + 0.5, 0.2]}>
            <cylinderGeometry args={[0.1, 0.1, 1]} />
            <meshLambertMaterial color="#7C2D12" />
          </mesh>
          {/* Smoke effect */}
          <mesh position={[0.2, height + 1.2, 0.2]}>
            <sphereGeometry args={[0.15]} />
            <meshBasicMaterial color="#6B7280" opacity={0.6} transparent />
          </mesh>
        </>
      )}

      {/* Building label */}
      {hovered && (
        <Text
          position={[0, height + 0.8, 0]}
          fontSize={0.2}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </Text>
      )}
    </group>
  )
}

export default function CityScene({ gameState, onBuildingPlace }: CitySceneProps) {
  return (
    <group>
      {/* Ground and grid */}
      <GridPlane onCellClick={onBuildingPlace} />
      
      {/* Buildings */}
      {gameState.buildings.map((building) => (
        <Building
          key={building.id}
          type={building.type}
          position={[building.x, 0, building.z]}
          id={building.id}
        />
      ))}

      {/* Sky box effect */}
      <mesh position={[0, 25, 0]}>
        <sphereGeometry args={[50, 32, 32]} />
        <meshBasicMaterial 
          color="#87CEEB" 
          side={THREE.BackSide}
          transparent
          opacity={0.8}
        />
      </mesh>
    </group>
  )
}