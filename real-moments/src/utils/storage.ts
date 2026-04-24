import type { AppState } from '../types'

const KEY = 'real_moments_state'

export const isStorageAvailable = (): boolean => {
  try {
    const test = '__storage_test__'
    localStorage.setItem(test, test)
    localStorage.removeItem(test)
    return true
  } catch {
    return false
  }
}

export const loadState = (): Partial<AppState> | undefined => {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return undefined
    return JSON.parse(raw) as Partial<AppState>
  } catch {
    return undefined
  }
}

export const saveState = (state: AppState): void => {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...state, _v: 2 }))
  } catch {
    // storage full or unavailable
  }
}
