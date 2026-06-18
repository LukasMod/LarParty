import uuid from 'react-native-uuid'

export function createId(prefix: string) {
  return `${prefix}-${uuid.v4()}`
}
