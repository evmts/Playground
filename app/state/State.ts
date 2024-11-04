import { create } from 'zustand'

const ITEMS = [
  { name: "MOUNTAIN FORTRESS", price: 25_000, protections: { STORM: 60, FLOOD: 100, QUAKE: 25, VOLCANO: 10 } },
  { name: "TECTONIC SHIELD", price: 20_000, protections: { STORM: 15, FLOOD: 15, QUAKE: 90, VOLCANO: 85 } },
  { name: "UNDERGROUND BUNKER", price: 19_000, protections: { STORM: 90, FLOOD: 45, QUAKE: 5, VOLCANO: 45 } },
  { name: "COASTAL DEFENSE SYSTEM", price: 18_000, protections: { STORM: 85, FLOOD: 95, QUAKE: 0, VOLCANO: 0 } },
  { name: "HURRICANE DOME", price: 17_000, protections: { STORM: 100, FLOOD: 35, QUAKE: 10, VOLCANO: 5 } },
  { name: "STORM SHELTER", price: 16_000, protections: { STORM: 90, FLOOD: 30, QUAKE: 5, VOLCANO: 0 } },
  { name: "REINFORCED SAFE ROOM", price: 15_000, protections: { STORM: 40, FLOOD: 30, QUAKE: 30, VOLCANO: 15 } },
  { name: "FLOOD BARRIER SYSTEM", price: 14_500, protections: { STORM: 10, FLOOD: 95, QUAKE: 5, VOLCANO: 0 } },
  { name: "EARTHQUAKE PROOF FOUNDATION", price: 14_000, protections: { STORM: 5, FLOOD: 0, QUAKE: 100, VOLCANO: 0 } },
  { name: "INFLATABLE RAFT", price: 13_500, protections: { STORM: 15, FLOOD: 50, QUAKE: 10, VOLCANO: 0 } },
  { name: "PORTABLE SHELTER", price: 13_000, protections: { STORM: 45, FLOOD: 15, QUAKE: 0, VOLCANO: 5 } },
  { name: "SEISMIC DAMPENERS", price: 12_500, protections: { STORM: 10, FLOOD: 5, QUAKE: 70, VOLCANO: 0 } },
  { name: "HAZMAT SUIT", price: 12_000, protections: { STORM: 20, FLOOD: 20, QUAKE: 0, VOLCANO: 65 } },
  { name: "VOLCANO BUNKER", price: 12_000, protections: { STORM: 25, FLOOD: 5, QUAKE: 5, VOLCANO: 100 } },
  { name: "LIFE JACKET", price: 11_500, protections: { STORM: 10, FLOOD: 60, QUAKE: 0, VOLCANO: 0 } },
  { name: "SANDBAGS", price: 11_500, protections: { STORM: 0, FLOOD: 30, QUAKE: 0, VOLCANO: 0 } },
  { name: "WATER STORAGE TANK", price: 11_000, protections: { STORM: 10, FLOOD: 40, QUAKE: 5, VOLCANO: 0 } },
  { name: "BLOCKCHAIN ASSETS", price: 11_000, protections: { STORM: 20, FLOOD: 25, QUAKE: 15, VOLCANO: 5 } },
  { name: "REINFORCED WINDOWS", price: 10_500, protections: { STORM: 45, FLOOD: 10, QUAKE: 5, VOLCANO: 0 } },
  { name: "SOLAR CHARGER", price: 10_500, protections: { STORM: 15, FLOOD: 20, QUAKE: 10, VOLCANO: 5 } },
  { name: "FIRST AID KIT", price: 10_000, protections: { STORM: 20, FLOOD: 25, QUAKE: 5, VOLCANO: 5 } },
  { name: "LIFEBOAT", price: 10_000, protections: { STORM: 15, FLOOD: 50, QUAKE: 0, VOLCANO: 0 } },
  { name: "EMERGENCY FOOD SUPPLY", price: 95_000, protections: { STORM: 35, FLOOD: 10, QUAKE: 5, VOLCANO: 0 } },
  { name: "RADIO", price: 9_500, protections: { STORM: 30, FLOOD: 20, QUAKE: 0, VOLCANO: 0 } },
  { name: "PORTABLE GENERATOR", price: 9_000, protections: { STORM: 35, FLOOD: 20, QUAKE: 0, VOLCANO: 0 } },
  { name: "EMERGENCY FLARES", price: 9_000, protections: { STORM: 20, FLOOD: 15, QUAKE: 10, VOLCANO: 10 } },
  { name: "EARTHQUAKE STRAPS", price: 8_500, protections: { STORM: 0, FLOOD: 0, QUAKE: 65, VOLCANO: 0 } },
  { name: "FLASHLIGHT", price: 8_500, protections: { STORM: 15, FLOOD: 5, QUAKE: 5, VOLCANO: 0 } },
  { name: "HEAT REFLECTIVE SHEET", price: 8_000, protections: { STORM: 10, FLOOD: 0, QUAKE: 0, VOLCANO: 20 } },
  { name: "EMERGENCY BLANKET", price: 8_000, protections: { STORM: 15, FLOOD: 0, QUAKE: 5, VOLCANO: 0 } },
  { name: "FIRE EXTINGUISHER", price: 7_500, protections: { STORM: 5, FLOOD: 5, QUAKE: 5, VOLCANO: 25 } },
  { name: "CARDBOARD BOX", price: 7_000, protections: { STORM: 10, FLOOD: 2, QUAKE: 2, VOLCANO: 0 } },
  { name: "STURDY SHOES", price: 6_500, protections: { STORM: 5, FLOOD: 5, QUAKE: 5, VOLCANO: 5 } },
  { name: "ROOF SHINGLES", price: 6_000, protections: { STORM: 20, FLOOD: 0, QUAKE: 0, VOLCANO: 0 }},
  { name: "EMERGENCY WHISTLE", price: 5_500, protections: { STORM: 5, FLOOD: 5, QUAKE: 5, VOLCANO: 0 } },
  { name: "DUCT TAPE", price: 5_000, protections: { STORM: 5, FLOOD: 2, QUAKE: 2, VOLCANO: 0 } },
  { name: "BEACH UMBRELLA", price: 5_000, protections: { STORM: 10, FLOOD: 0, QUAKE: 0, VOLCANO: 0 } },
  { name: "PLASTIC BAG", price: 5_000, protections: { STORM: 5, FLOOD: 2, QUAKE: 0, VOLCANO: 0 } },
] as const

export const DISASTER_TYPES = [
  { name: "STORM", probability: 50 },
  { name: "FLOOD", probability: 25 },
  { name: "QUAKE", probability: 15 },
  { name: "VOLCANO", probability: 10 },
] as const

const MAX_ITEMS = 5

export interface RuggedState {
  selectedIsland: string | null
  selectedItems: string[]
  remainingBudget: number
  isCommitted: boolean
  disasterCountdown: number
  disasters: Array<{ name: string; severity: number; island: string }>
  showItemSelection: boolean
  sortBy: string
  sortOrder: 'asc' | 'desc'
  ruggedItems: string[]
  playersLeft: number
  islandStats: { [key: string]: number }
  averageProtection: { [key: string]: number }
  eliminatedPlayers: { [key: string]: number }
  showPayoutSchedule: boolean
  countdown: number
  setSelectedIsland: (island: string | null) => void
  setSelectedItems: (items: string[]) => void
  setRemainingBudget: (budget: number) => void
  setIsCommitted: (committed: boolean) => void
  setDisasterCountdown: (countdown: number) => void
  setDisasters: (disasters: Array<{ name: string; severity: number; island: string }>) => void
  setShowItemSelection: (show: boolean) => void
  setSortBy: (sortBy: string) => void
  setSortOrder: (order: 'asc' | 'desc') => void
  setRuggedItems: (items: string[]) => void
  setPlayersLeft: (players: number) => void
  setIslandStats: (stats: { [key: string]: number }) => void
  setAverageProtection: (protection: { [key: string]: number }) => void
  setEliminatedPlayers: (players: { [key: string]: number }) => void
  setShowPayoutSchedule: (show: boolean) => void
  setCountdown: (countdown: number) => void
  handleItemSelection: (itemName: string) => void
  handleSort: (category: string) => void
  handleCommit: () => void
}

export const useRuggedStore = create<RuggedState>((set, get) => ({
  selectedIsland: null,
  selectedItems: [],
  remainingBudget: 50000,
  isCommitted: false,
  disasterCountdown: 10,
  disasters: [],
  showItemSelection: false,
  sortBy: 'name',
  sortOrder: 'asc',
  ruggedItems: [],
  playersLeft: 1000,
  islandStats: { EAST: 0, WEST: 0 },
  averageProtection: {},
  eliminatedPlayers: {},
  showPayoutSchedule: false,
  countdown: 30,
  setSelectedIsland: (island) => set({ selectedIsland: island }),
  setSelectedItems: (items) => set({ selectedItems: items }),
  setRemainingBudget: (budget) => set({ remainingBudget: budget }),
  setIsCommitted: (committed) => set({ isCommitted: committed }),
  setDisasterCountdown: (countdown) => set({ disasterCountdown: countdown }),
  setDisasters: (disasters) => set({ disasters }),
  setShowItemSelection: (show) => set({ showItemSelection: show }),
  setSortBy: (sortBy) => set({ sortBy }),
  setSortOrder: (order) => set({ sortOrder: order }),
  setRuggedItems: (items) => set({ ruggedItems: items }),
  setPlayersLeft: (players) => set({ playersLeft: players }),
  setIslandStats: (stats) => set({ islandStats: stats }),
  setAverageProtection: (protection) => set({ averageProtection: protection }),
  setEliminatedPlayers: (players) => set({ eliminatedPlayers: players }),
  setShowPayoutSchedule: (show) => set({ showPayoutSchedule: show }),
  setCountdown: (countdown) => set({ countdown }),
  handleItemSelection: (itemName) => {
    const { selectedItems, remainingBudget } = get()
    const item = ITEMS.find(i => i.name === itemName)
    if (!item) return

    if (selectedItems.includes(itemName)) {
      set({
        remainingBudget: remainingBudget + item.price,
        selectedItems: selectedItems.filter(i => i !== itemName)
      })
    } else if (remainingBudget >= item.price && selectedItems.length < MAX_ITEMS) {
      set({
        remainingBudget: remainingBudget - item.price,
        selectedItems: [...selectedItems, itemName]
      })
    }
  },
  handleSort: (category) => {
    const { sortBy, sortOrder } = get()
    if (sortBy === category) {
      set({ sortOrder: sortOrder === "asc" ? "desc" : "asc" })
    } else {
      set({ sortBy: category, sortOrder: "asc" })
    }
  },
  handleCommit: () => {
    const { selectedIsland, selectedItems } = get()
    if (selectedIsland && selectedItems.length > 0) {
      const shuffled = [...ITEMS].sort(() => 0.5 - Math.random())
      const eastPlayers = Math.floor(1000 * 0.6)
      const westPlayers = 1000 - eastPlayers
      const avgProtection = DISASTER_TYPES.reduce((acc, disaster) => {
        acc[disaster.name] = Math.floor(Math.random() * 50) + 25
        return acc
      }, {} as { [key: string]: number })
      
      set({
        isCommitted: true,
        ruggedItems: shuffled.slice(0, 2).map(item => item.name),
        islandStats: { EAST: eastPlayers, WEST: westPlayers },
        averageProtection: avgProtection
      })
    }
  },
}))

export const calculateProtection = (state: RuggedState) => (disasterName: string) => {
  return state.selectedItems.reduce((total, itemName) => {
    if (state.ruggedItems.includes(itemName)) return total
    const item = ITEMS.find(i => i.name === itemName)
    return total + (item?.protections[disasterName as keyof typeof item.protections] || 0)
  }, 0)
}

export const getTotalProtection = (state: RuggedState) => {
  const protection = calculateProtection(state)
  return DISASTER_TYPES.reduce((acc, disaster) => {
    acc[disaster.name] = protection(disaster.name)
    return acc
  }, {} as Record<string, number>)
}

export const getSortedItems = (state: RuggedState) => {
  return [...ITEMS].sort((a, b) => {
    if (state.sortBy === "price") {
      return state.sortOrder === "asc" ? a.price - b.price : b.price - a.price
    } else if (state.sortBy in a.protections) {
      const protectionA = a.protections[state.sortBy as keyof typeof a.protections] || 0
      const protectionB = b.protections[state.sortBy as keyof typeof b.protections] || 0
      return state.sortOrder === "asc" ? protectionA - protectionB : protectionB - protectionA
    }
    return a.name.localeCompare(b.name)
  })
}
