import React, { useState } from 'react'
import { Building, Home, Factory, Store, Route, DollarSign, Users, Heart, RotateCcw } from 'lucide-react'
import { Button } from './components/ui/button'
import { Card } from './components/ui/card'
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

const BUILDING_COLORS = {
  residential: '#10B981', // Green
  commercial: '#3B82F6', // Blue  
  industrial: '#F59E0B', // Orange
  road: '#6B7280' // Gray
}

const GRID_SIZE = 20

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

  const resetGame = () => {
    setGameState({
      money: 10000,
      population: 0,
      happiness: 50,
      selectedTool: null,
      buildings: []
    })
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
            <Button
              onClick={resetGame}
              variant="outline"
              size="sm"
              className="bg-slate-700 hover:bg-slate-600 border-slate-600"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
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

        {/* Isometric Game Grid */}
        <div className="flex-1 relative bg-gradient-to-b from-sky-400 to-green-300 overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <div 
              className="isometric-grid"
              style={{
                transform: 'rotateX(60deg) rotateY(-45deg)',
                transformStyle: 'preserve-3d'
              }}
            >
              {/* Grid cells */}
              {Array.from({ length: GRID_SIZE }, (_, row) =>
                Array.from({ length: GRID_SIZE }, (_, col) => {
                  const x = col - GRID_SIZE / 2
                  const z = row - GRID_SIZE / 2
                  const building = gameState.buildings.find(b => b.x === x && b.z === z)
                  
                  return (
                    <div
                      key={`${row}-${col}`}
                      className="grid-cell"
                      style={{
                        position: 'absolute',
                        left: `${col * 30}px`,
                        top: `${row * 30}px`,
                        width: '28px',
                        height: '28px',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        backgroundColor: building ? BUILDING_COLORS[building.type] : 'rgba(34, 197, 94, 0.3)',
                        cursor: gameState.selectedTool ? 'pointer' : 'default',
                        transition: 'all 0.2s ease',
                        borderRadius: '2px'
                      }}
                      onClick={() => handleBuildingPlace(x, z)}
                      onMouseEnter={(e) => {
                        if (gameState.selectedTool && !building) {
                          e.currentTarget.style.backgroundColor = BUILDING_COLORS[gameState.selectedTool] + '80'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!building) {
                          e.currentTarget.style.backgroundColor = 'rgba(34, 197, 94, 0.3)'
                        }
                      }}
                    >
                      {building && (
                        <div
                          className="building"
                          style={{
                            position: 'absolute',
                            bottom: '0',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '20px',
                            height: building.type === 'road' ? '4px' : '24px',
                            backgroundColor: BUILDING_COLORS[building.type],
                            borderRadius: '2px',
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {building.type !== 'road' && (
                            <div
                              style={{
                                fontSize: '10px',
                                color: 'white',
                                fontWeight: 'bold'
                              }}
                            >
                              {building.type[0].toUpperCase()}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Instructions Overlay */}
          <div className="absolute top-4 right-4 bg-slate-800/90 backdrop-blur-sm rounded-lg p-4 max-w-xs">
            <h3 className="font-semibold mb-2 text-slate-200">How to Play</h3>
            <div className="text-sm text-slate-300 space-y-1">
              <div>• Select a building type from the left panel</div>
              <div>• Click on empty grid cells to place buildings</div>
              <div>• Residential buildings increase population</div>
              <div>• Commercial buildings boost happiness</div>
              <div>• Roads connect your city infrastructure</div>
              <div>• Manage your budget wisely!</div>
            </div>
          </div>

          {/* Game Status */}
          {gameState.money < 100 && gameState.buildings.length > 0 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-red-600/90 backdrop-blur-sm rounded-lg p-4">
              <div className="text-center text-white">
                <div className="font-semibold">Low on Funds!</div>
                <div className="text-sm">You need more money to continue building</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App