'use client'

import { useMemo, useRef, useState, useCallback } from 'react'
import { useParcelContext } from '@/lib/parcel-context'
import { FIELD_CONFIG } from '@/lib/parcels'
import { cn } from '@/lib/utils'

const VIEWBOX_WIDTH = 1050
const VIEWBOX_HEIGHT = 680
const FIELD_PADDING = 40
const FIELD_WIDTH = VIEWBOX_WIDTH - FIELD_PADDING * 2
const FIELD_HEIGHT = VIEWBOX_HEIGHT - FIELD_PADDING * 2

const GOAL_WIDTH = 44
const GOAL_HEIGHT = 132
const PENALTY_AREA_WIDTH = 132
const PENALTY_AREA_HEIGHT = 322
const GOAL_AREA_WIDTH = 44
const GOAL_AREA_HEIGHT = 146
const CENTER_CIRCLE_RADIUS = 73
const PENALTY_SPOT_DISTANCE = 88
const CORNER_ARC_RADIUS = 8

export function SoccerField() {
  const { toggleParcel, isSelected, isAvailable, soldParcels, reservedParcels } = useParcelContext()
  const svgRef = useRef<SVGSVGElement>(null)
  const [hoveredParcel, setHoveredParcel] = useState<string | null>(null)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  const gridCellWidth = FIELD_WIDTH / FIELD_CONFIG.GRID_COLS
  const gridCellHeight = FIELD_HEIGHT / FIELD_CONFIG.GRID_ROWS

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
      setIsDragging(true)
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
    }
  }, [pan])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      })
    }
  }, [isDragging, dragStart])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const resetView = useCallback(() => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }, [])

  const getParcelColor = useCallback((id: string) => {
    if (isSelected(id)) return '#F7E816'
    if (soldParcels.has(id)) return '#6b7280'
    if (reservedParcels.has(id)) return '#9ca3af'
    if (hoveredParcel === id) return 'rgba(247, 232, 22, 0.6)'
    return 'rgba(255, 255, 255, 0.08)'
  }, [isSelected, soldParcels, reservedParcels, hoveredParcel])

  const getParcelStroke = useCallback((id: string) => {
    if (isSelected(id)) return 'rgba(247, 232, 22, 0.8)'
    if (hoveredParcel === id) return 'rgba(247, 232, 22, 0.5)'
    return 'rgba(255, 255, 255, 0.15)'
  }, [isSelected, hoveredParcel])

  const getParcelCursor = useCallback((id: string) => {
    if (!isAvailable(id)) return 'not-allowed'
    return 'pointer'
  }, [isAvailable])

  const fieldParcels = useMemo(() => {
    const parcels = []
    for (let row = 0; row < FIELD_CONFIG.GRID_ROWS; row++) {
      for (let col = 0; col < FIELD_CONFIG.GRID_COLS; col++) {
        const id = `field-${row}-${col}`
        parcels.push({
          id,
          x: FIELD_PADDING + col * gridCellWidth,
          y: FIELD_PADDING + row * gridCellHeight,
          width: gridCellWidth,
          height: gridCellHeight,
        })
      }
    }
    return parcels
  }, [gridCellWidth, gridCellHeight])

  return (
    <div className="relative w-full">
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <button
          onClick={() => setZoom(prev => Math.min(prev * 1.3, 5))}
          className="bg-sc-navy text-white p-2 rounded-lg hover:bg-sc-navy-light transition-colors"
          title="Vergrößern"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
          </svg>
        </button>
        <button
          onClick={() => setZoom(prev => Math.max(prev * 0.7, 1))}
          className="bg-sc-navy text-white p-2 rounded-lg hover:bg-sc-navy-light transition-colors"
          title="Verkleinern"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
          </svg>
        </button>
        <button
          onClick={resetView}
          className="bg-sc-navy text-white p-2 rounded-lg hover:bg-sc-navy-light transition-colors"
          title="Zurücksetzen"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
      
      <div 
        className="overflow-hidden rounded-xl border-4 border-white/20 bg-[#1a472a] shadow-2xl"
        style={{ cursor: isDragging ? 'grabbing' : 'default' }}
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
          className="w-full h-auto"
          style={{
            transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
            transformOrigin: 'center',
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <defs>
            <pattern id="sold-pattern" patternUnits="userSpaceOnUse" width="8" height="8">
              <path d="M-2,2 l4,-4 M0,8 l8,-8 M6,10 l4,-4" stroke="#4b5563" strokeWidth="1"/>
            </pattern>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Field background */}
          <rect
            x={FIELD_PADDING}
            y={FIELD_PADDING}
            width={FIELD_WIDTH}
            height={FIELD_HEIGHT}
            fill="#1a472a"
          />

          {/* Field grid parcels */}
          {fieldParcels.map((parcel) => (
            <rect
              key={parcel.id}
              x={parcel.x}
              y={parcel.y}
              width={parcel.width}
              height={parcel.height}
              fill={getParcelColor(parcel.id)}
              stroke={getParcelStroke(parcel.id)}
              strokeWidth="0.5"
              style={{ cursor: getParcelCursor(parcel.id) }}
              className={cn(
                'transition-all duration-150',
                isSelected(parcel.id) && 'animate-pulse-yellow'
              )}
              onClick={() => toggleParcel(parcel.id)}
              onMouseEnter={() => setHoveredParcel(parcel.id)}
              onMouseLeave={() => setHoveredParcel(null)}
            />
          ))}

          {/* Sold overlay pattern */}
          {fieldParcels
            .filter((p) => soldParcels.has(p.id))
            .map((parcel) => (
              <rect
                key={`sold-${parcel.id}`}
                x={parcel.x}
                y={parcel.y}
                width={parcel.width}
                height={parcel.height}
                fill="url(#sold-pattern)"
                pointerEvents="none"
              />
            ))}

          {/* Field outline */}
          <rect
            x={FIELD_PADDING}
            y={FIELD_PADDING}
            width={FIELD_WIDTH}
            height={FIELD_HEIGHT}
            fill="none"
            stroke="white"
            strokeWidth="2"
          />

          {/* Center line */}
          <line
            x1={VIEWBOX_WIDTH / 2}
            y1={FIELD_PADDING}
            x2={VIEWBOX_WIDTH / 2}
            y2={VIEWBOX_HEIGHT - FIELD_PADDING}
            stroke="white"
            strokeWidth="2"
          />

          {/* Center circle */}
          <circle
            cx={VIEWBOX_WIDTH / 2}
            cy={VIEWBOX_HEIGHT / 2}
            r={CENTER_CIRCLE_RADIUS}
            fill="none"
            stroke="white"
            strokeWidth="2"
          />

          {/* Kick-off point */}
          <circle
            cx={VIEWBOX_WIDTH / 2}
            cy={VIEWBOX_HEIGHT / 2}
            r={12}
            fill={getParcelColor('kickoff')}
            stroke="white"
            strokeWidth="2"
            style={{ cursor: getParcelCursor('kickoff') }}
            className={cn(
              'transition-all duration-150',
              isSelected('kickoff') && 'animate-pulse-yellow'
            )}
            filter={isSelected('kickoff') || hoveredParcel === 'kickoff' ? 'url(#glow)' : undefined}
            onClick={() => toggleParcel('kickoff')}
            onMouseEnter={() => setHoveredParcel('kickoff')}
            onMouseLeave={() => setHoveredParcel(null)}
          />
          {soldParcels.has('kickoff') && (
            <circle
              cx={VIEWBOX_WIDTH / 2}
              cy={VIEWBOX_HEIGHT / 2}
              r={12}
              fill="url(#sold-pattern)"
              pointerEvents="none"
            />
          )}

          {/* Left penalty area */}
          <rect
            x={FIELD_PADDING}
            y={(VIEWBOX_HEIGHT - PENALTY_AREA_HEIGHT) / 2}
            width={PENALTY_AREA_WIDTH}
            height={PENALTY_AREA_HEIGHT}
            fill="none"
            stroke="white"
            strokeWidth="2"
          />

          {/* Left goal area */}
          <rect
            x={FIELD_PADDING}
            y={(VIEWBOX_HEIGHT - GOAL_AREA_HEIGHT) / 2}
            width={GOAL_AREA_WIDTH}
            height={GOAL_AREA_HEIGHT}
            fill="none"
            stroke="white"
            strokeWidth="2"
          />

          {/* Left penalty spot */}
          <circle
            cx={FIELD_PADDING + PENALTY_SPOT_DISTANCE}
            cy={VIEWBOX_HEIGHT / 2}
            r={10}
            fill={getParcelColor('penalty-left')}
            stroke="white"
            strokeWidth="2"
            style={{ cursor: getParcelCursor('penalty-left') }}
            className={cn(
              'transition-all duration-150',
              isSelected('penalty-left') && 'animate-pulse-yellow'
            )}
            filter={isSelected('penalty-left') || hoveredParcel === 'penalty-left' ? 'url(#glow)' : undefined}
            onClick={() => toggleParcel('penalty-left')}
            onMouseEnter={() => setHoveredParcel('penalty-left')}
            onMouseLeave={() => setHoveredParcel(null)}
          />

          {/* Left goal */}
          <rect
            x={FIELD_PADDING - GOAL_WIDTH}
            y={(VIEWBOX_HEIGHT - GOAL_HEIGHT) / 2}
            width={GOAL_WIDTH}
            height={GOAL_HEIGHT}
            fill="none"
            stroke="white"
            strokeWidth="3"
          />

          {/* Left goal parcels (5 sections) */}
          {[0, 1, 2, 3, 4].map((i) => {
            const id = `goal-left-${i}`
            const sectionHeight = GOAL_HEIGHT / 5
            return (
              <g key={id}>
                <rect
                  x={FIELD_PADDING - GOAL_WIDTH + 2}
                  y={(VIEWBOX_HEIGHT - GOAL_HEIGHT) / 2 + i * sectionHeight + 2}
                  width={GOAL_WIDTH - 4}
                  height={sectionHeight - 4}
                  fill={getParcelColor(id)}
                  rx={2}
                  style={{ cursor: getParcelCursor(id) }}
                  className={cn(
                    'transition-all duration-150',
                    isSelected(id) && 'animate-pulse-yellow'
                  )}
                  filter={isSelected(id) || hoveredParcel === id ? 'url(#glow)' : undefined}
                  onClick={() => toggleParcel(id)}
                  onMouseEnter={() => setHoveredParcel(id)}
                  onMouseLeave={() => setHoveredParcel(null)}
                />
                {soldParcels.has(id) && (
                  <rect
                    x={FIELD_PADDING - GOAL_WIDTH + 2}
                    y={(VIEWBOX_HEIGHT - GOAL_HEIGHT) / 2 + i * sectionHeight + 2}
                    width={GOAL_WIDTH - 4}
                    height={sectionHeight - 4}
                    fill="url(#sold-pattern)"
                    rx={2}
                    pointerEvents="none"
                  />
                )}
              </g>
            )
          })}

          {/* Right penalty area */}
          <rect
            x={VIEWBOX_WIDTH - FIELD_PADDING - PENALTY_AREA_WIDTH}
            y={(VIEWBOX_HEIGHT - PENALTY_AREA_HEIGHT) / 2}
            width={PENALTY_AREA_WIDTH}
            height={PENALTY_AREA_HEIGHT}
            fill="none"
            stroke="white"
            strokeWidth="2"
          />

          {/* Right goal area */}
          <rect
            x={VIEWBOX_WIDTH - FIELD_PADDING - GOAL_AREA_WIDTH}
            y={(VIEWBOX_HEIGHT - GOAL_AREA_HEIGHT) / 2}
            width={GOAL_AREA_WIDTH}
            height={GOAL_AREA_HEIGHT}
            fill="none"
            stroke="white"
            strokeWidth="2"
          />

          {/* Right penalty spot */}
          <circle
            cx={VIEWBOX_WIDTH - FIELD_PADDING - PENALTY_SPOT_DISTANCE}
            cy={VIEWBOX_HEIGHT / 2}
            r={10}
            fill={getParcelColor('penalty-right')}
            stroke="white"
            strokeWidth="2"
            style={{ cursor: getParcelCursor('penalty-right') }}
            className={cn(
              'transition-all duration-150',
              isSelected('penalty-right') && 'animate-pulse-yellow'
            )}
            filter={isSelected('penalty-right') || hoveredParcel === 'penalty-right' ? 'url(#glow)' : undefined}
            onClick={() => toggleParcel('penalty-right')}
            onMouseEnter={() => setHoveredParcel('penalty-right')}
            onMouseLeave={() => setHoveredParcel(null)}
          />

          {/* Right goal */}
          <rect
            x={VIEWBOX_WIDTH - FIELD_PADDING}
            y={(VIEWBOX_HEIGHT - GOAL_HEIGHT) / 2}
            width={GOAL_WIDTH}
            height={GOAL_HEIGHT}
            fill="none"
            stroke="white"
            strokeWidth="3"
          />

          {/* Right goal parcels (5 sections) */}
          {[0, 1, 2, 3, 4].map((i) => {
            const id = `goal-right-${i}`
            const sectionHeight = GOAL_HEIGHT / 5
            return (
              <g key={id}>
                <rect
                  x={VIEWBOX_WIDTH - FIELD_PADDING + 2}
                  y={(VIEWBOX_HEIGHT - GOAL_HEIGHT) / 2 + i * sectionHeight + 2}
                  width={GOAL_WIDTH - 4}
                  height={sectionHeight - 4}
                  fill={getParcelColor(id)}
                  rx={2}
                  style={{ cursor: getParcelCursor(id) }}
                  className={cn(
                    'transition-all duration-150',
                    isSelected(id) && 'animate-pulse-yellow'
                  )}
                  filter={isSelected(id) || hoveredParcel === id ? 'url(#glow)' : undefined}
                  onClick={() => toggleParcel(id)}
                  onMouseEnter={() => setHoveredParcel(id)}
                  onMouseLeave={() => setHoveredParcel(null)}
                />
                {soldParcels.has(id) && (
                  <rect
                    x={VIEWBOX_WIDTH - FIELD_PADDING + 2}
                    y={(VIEWBOX_HEIGHT - GOAL_HEIGHT) / 2 + i * sectionHeight + 2}
                    width={GOAL_WIDTH - 4}
                    height={sectionHeight - 4}
                    fill="url(#sold-pattern)"
                    rx={2}
                    pointerEvents="none"
                  />
                )}
              </g>
            )
          })}

          {/* Corner arcs */}
          <path
            d={`M ${FIELD_PADDING} ${FIELD_PADDING + CORNER_ARC_RADIUS} A ${CORNER_ARC_RADIUS} ${CORNER_ARC_RADIUS} 0 0 1 ${FIELD_PADDING + CORNER_ARC_RADIUS} ${FIELD_PADDING}`}
            fill="none"
            stroke="white"
            strokeWidth="2"
          />
          <path
            d={`M ${VIEWBOX_WIDTH - FIELD_PADDING - CORNER_ARC_RADIUS} ${FIELD_PADDING} A ${CORNER_ARC_RADIUS} ${CORNER_ARC_RADIUS} 0 0 1 ${VIEWBOX_WIDTH - FIELD_PADDING} ${FIELD_PADDING + CORNER_ARC_RADIUS}`}
            fill="none"
            stroke="white"
            strokeWidth="2"
          />
          <path
            d={`M ${FIELD_PADDING + CORNER_ARC_RADIUS} ${VIEWBOX_HEIGHT - FIELD_PADDING} A ${CORNER_ARC_RADIUS} ${CORNER_ARC_RADIUS} 0 0 1 ${FIELD_PADDING} ${VIEWBOX_HEIGHT - FIELD_PADDING - CORNER_ARC_RADIUS}`}
            fill="none"
            stroke="white"
            strokeWidth="2"
          />
          <path
            d={`M ${VIEWBOX_WIDTH - FIELD_PADDING} ${VIEWBOX_HEIGHT - FIELD_PADDING - CORNER_ARC_RADIUS} A ${CORNER_ARC_RADIUS} ${CORNER_ARC_RADIUS} 0 0 1 ${VIEWBOX_WIDTH - FIELD_PADDING - CORNER_ARC_RADIUS} ${VIEWBOX_HEIGHT - FIELD_PADDING}`}
            fill="none"
            stroke="white"
            strokeWidth="2"
          />
        </svg>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 justify-center text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-[#F7E816]" />
          <span>Ausgewählt</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gray-500" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(75,85,99,0.5) 2px, rgba(75,85,99,0.5) 4px)' }} />
          <span>Verkauft</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gray-400" />
          <span>Reserviert</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded border border-white/30 bg-white/10" />
          <span>Verfügbar</span>
        </div>
      </div>

      {/* Hover tooltip */}
      {hoveredParcel && (
        <div className="absolute bottom-4 left-4 bg-sc-navy/90 text-white px-3 py-2 rounded-lg text-sm backdrop-blur-sm">
          {hoveredParcel.startsWith('goal-') && `Tor-Parzelle: 300 €`}
          {hoveredParcel.startsWith('penalty-') && `Elfmeterpunkt: 300 €`}
          {hoveredParcel === 'kickoff' && `Anstoßpunkt: 500 €`}
          {hoveredParcel.startsWith('field-') && `Feld-Parzelle: 50 €`}
          {!isAvailable(hoveredParcel) && ' (nicht verfügbar)'}
        </div>
      )}
    </div>
  )
}
