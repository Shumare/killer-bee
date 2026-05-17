type CharacteristicValue = {
  entityId: number
  internalKey: string
  value: string | number | boolean
}

const values: CharacteristicValue[] = []

export function getCharacteristicValue(entityId: number, internalKey: string): CharacteristicValue | null {
  return values.find(v => v.entityId === entityId && v.internalKey === internalKey) ?? null
}

export function setCharacteristicValue(entityId: number, internalKey: string, value: string | number | boolean): void {
  const existing = values.find(v => v.entityId === entityId && v.internalKey === internalKey)
  if (existing) {
    existing.value = value
  } else {
    values.push({ entityId, internalKey, value })
  }
}

export function getValuesForEntity(entityId: number, allowedKeys: string[]): Record<string, string | number | boolean> {
  return values
    .filter(v => v.entityId === entityId && allowedKeys.includes(v.internalKey))
    .reduce((acc, v) => ({ ...acc, [v.internalKey]: v.value }), {})
}
