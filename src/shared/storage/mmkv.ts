import { createMMKV } from 'react-native-mmkv'

export const storage = createMMKV({
  id: `larparty-storage`,
  mode: 'multi-process',
})
