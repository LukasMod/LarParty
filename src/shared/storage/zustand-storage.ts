import { StateStorage } from 'zustand/middleware'

import { storage } from '@/shared/storage/mmkv'

export const zustandStorage: StateStorage = {
  setItem: (name, value) => {
    storage.set(name, value)
  },
  getItem: (name) => {
    const value = storage.getString(name)

    return value ?? null
  },
  removeItem: (name) => {
    storage.remove(name)
  },
}
