'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { FIELD_CONFIG, getParcelById } from './kv'

interface ParcelContextType {
  selectedParcels: Set<string>
  soldParcels: Set<string>
  reservedParcels: Set<string>
  toggleParcel: (id: string) => void
  selectParcel: (id: string) => void
  deselectParcel: (id: string) => void
  clearSelection: () => void
  isSelected: (id: string) => boolean
  isAvailable: (id: string) => boolean
  getTotal: () => number
  getSelectedCount: () => number
  setSoldParcels: (parcels: string[]) => void
  setReservedParcels: (parcels: string[]) => void
}

const ParcelContext = createContext<ParcelContextType | null>(null)

export function ParcelProvider({ children }: { children: ReactNode }) {
  const [selectedParcels, setSelectedParcels] = useState<Set<string>>(new Set())
  const [soldParcels, setSoldParcelsState] = useState<Set<string>>(new Set())
  const [reservedParcels, setReservedParcelsState] = useState<Set<string>>(new Set())

  const isAvailable = useCallback((id: string) => {
    return !soldParcels.has(id) && !reservedParcels.has(id)
  }, [soldParcels, reservedParcels])

  const toggleParcel = useCallback((id: string) => {
    if (!isAvailable(id)) return
    
    setSelectedParcels(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [isAvailable])

  const selectParcel = useCallback((id: string) => {
    if (!isAvailable(id)) return
    setSelectedParcels(prev => new Set(prev).add(id))
  }, [isAvailable])

  const deselectParcel = useCallback((id: string) => {
    setSelectedParcels(prev => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedParcels(new Set())
  }, [])

  const isSelected = useCallback((id: string) => {
    return selectedParcels.has(id)
  }, [selectedParcels])

  const getTotal = useCallback(() => {
    let total = 0
    for (const id of selectedParcels) {
      const parcel = getParcelById(id)
      if (parcel) {
        total += parcel.price
      }
    }
    return total
  }, [selectedParcels])

  const getSelectedCount = useCallback(() => {
    return selectedParcels.size
  }, [selectedParcels])

  const setSoldParcels = useCallback((parcels: string[]) => {
    setSoldParcelsState(new Set(parcels))
  }, [])

  const setReservedParcels = useCallback((parcels: string[]) => {
    setReservedParcelsState(new Set(parcels))
  }, [])

  return (
    <ParcelContext.Provider
      value={{
        selectedParcels,
        soldParcels,
        reservedParcels,
        toggleParcel,
        selectParcel,
        deselectParcel,
        clearSelection,
        isSelected,
        isAvailable,
        getTotal,
        getSelectedCount,
        setSoldParcels,
        setReservedParcels,
      }}
    >
      {children}
    </ParcelContext.Provider>
  )
}

export function useParcelContext() {
  const context = useContext(ParcelContext)
  if (!context) {
    throw new Error('useParcelContext must be used within a ParcelProvider')
  }
  return context
}

