import React, { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid } from '@react-three/drei'
import { Building, Home, Factory, Store, Route, DollarSign, Users, Heart } from 'lucide-react'
import { Button } from './components/ui/button'
import { Card } from './components/ui/card'
import { Badge } from './components/ui/badge'
import CityScene from './components/CityScene'
import './App.css'

export type BuildingType = 'residential' | 'commercial' | 'industrial' | 'road'

export interface GameState {
  money: number
  population: number
  happiness: number
  selectedTool: BuildingType | null
  buildings: Array<{
    id: string
    type: BuildingType
    x: number
    z: number
    cost: number
  }>
}

const BUILDING_COSTS = {
  residential: 100,
  commercial: 200,
  industrial: 300,
  road: 50
}

const BUILDING_ICONS = {
  residential: Home,
  commercial: Store,
  industrial: Factory,
  road: Route
}

function App() {
  const [gameState, setGameState] = useState<GameState>({
    money: 10000,
    population: 0,
    happiness: 50,
    selectedTool: null,
    buildings: []
  })

  const handleToolSelect = (tool: BuildingType) => {
    setGameState(prev => ({
      ...prev,
      selectedTool: prev.selectedTool === tool ? null : tool
    }))
  }

  const handleBuildingPlace = (x: number, z: number) => {
    if (!gameState.selectedTool) return
    
    const cost = BUILDING_COSTS[gameState.selectedTool]
    if (gameState.money < cost) return

    // Check if position is already occupied
    const isOccupied = gameState.buildings.some(building => 
      building.x === x && building.z === z
    )
    if (isOccupied) return

    const newBuilding = {
      id: `${gameState.selectedTool}-${Date.now()}`,
      type: gameState.selectedTool,
      x,
      z,
      cost
    }

    setGameState(prev => ({
      ...prev,
      money: prev.money - cost,
      buildings: [...prev.buildings, newBuilding],
      population: prev.population + (gameState.selectedTool === 'residential' ? 10 : 0),
      happiness: Math.min(100, prev.happiness + (gameState.selectedTool === 'commercial' ? 2 : 0))
    }))
  }

  return (
    <div className="h-screen bg-slate-900 text-white flex flex-col">
      {/* Header with Resources */}
      <div className="bg-slate-800 border-b border-slate-700 p-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-blue-400">City Builder 3D</h1>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-400" />
              <span className="font-medium">${gameState.money.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              <span className="font-medium">{gameState.population.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-400" />
              <span className="font-medium">{gameState.happiness}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Building Toolbar */}
        <div className="w-64 bg-slate-800 border-r border-slate-700 p-4">
          <h2 className="text-lg font-semibold mb-4 text-slate-200">Buildings</h2>
          
          <div className="space-y-2">
            {Object.entries(BUILDING_COSTS).map(([type, cost]) => {
              const Icon = BUILDING_ICONS[type as BuildingType]
              const isSelected = gameState.selectedTool === type
              const canAfford = gameState.money >= cost
              
              return (
                <Button
                  key={type}
                  variant={isSelected ? "default" : "outline"}
                  className={`w-full justify-start gap-3 h-12 ${
                    isSelected 
                      ? 'bg-blue-600 hover:bg-blue-700 border-blue-500' 
                      : 'bg-slate-700 hover:bg-slate-600 border-slate-600'
                  } ${!canAfford ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => canAfford && handleToolSelect(type as BuildingType)}
                  disabled={!canAfford}
                >
                  <Icon className="w-5 h-5" />
                  <div className="flex-1 text-left">
                    <div className="capitalize font-medium">{type}</div>
                    <div className="text-xs text-slate-400">${cost}</div>
                  </div>
                </Button>
              )
            })}
          </div>

          {gameState.selectedTool && (
            <Card className="mt-4 p-3 bg-slate-700 border-slate-600">
              <div className="text-sm text-slate-300">
                <div className="font-medium capitalize mb-1">{gameState.selectedTool} Selected</div>
                <div className="text-xs text-slate-400">
                  Click on the grid to place building
                </div>
              </div>
            </Card>
          )}

          <div className="mt-6">
            <h3 className="text-sm font-semibold mb-2 text-slate-300">City Stats</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Buildings:</span>
                <span>{gameState.buildings.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Roads:</span>
                <span>{gameState.buildings.filter(b => b.type === 'road').length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Houses:</span>
                <span>{gameState.buildings.filter(b => b.type === 'residential').length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3D Game Canvas */}
        <div className="flex-1 relative">
          <Canvas
            camera={{ 
              position: [10, 10, 10], 
              fov: 50,
              near: 0.1,
              far: 1000
            }}
            className="bg-gradient-to-b from-sky-400 to-sky-200"
          >
            <ambientLight intensity={0.6} />
            <directionalLight 
              position={[10, 10, 5]} 
              intensity={1}
              castShadow
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
            />
            
            <OrbitControls 
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              maxPolarAngle={Math.PI / 2.2}
              minDistance={5}
              maxDistance={50}
            />
            
            <CityScene 
              gameState={gameState}
              onBuildingPlace={handleBuildingPlace}
            />
          </Canvas>

          {/* Instructions Overlay */}
          <div className="absolute top-4 right-4 bg-slate-800/90 backdrop-blur-sm rounded-lg p-4 max-w-xs">
            <h3 className="font-semibold mb-2 text-slate-200">Controls</h3>
            <div className="text-sm text-slate-300 space-y-1">
              <div>• Left click: Place building</div>
              <div>• Right click + drag: Rotate camera</div>
              <div>• Scroll: Zoom in/out</div>
              <div>• Middle click + drag: Pan view</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App