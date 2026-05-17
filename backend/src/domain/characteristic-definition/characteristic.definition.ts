type CharacteristicType = 'numeric' | 'boolean' | 'text' | 'enum'

type CharacteristicDefinition = {
  internalKey: string
  type: CharacteristicType
  allowedRoles: string[]
}

const definitions: CharacteristicDefinition[] = [
  { internalKey: 'c1', type: 'numeric', allowedRoles: ['admin'] },
  { internalKey: 'c2', type: 'boolean', allowedRoles: ['admin', 'user'] },
  { internalKey: 'c3', type: 'text', allowedRoles: ['admin'] },
]

export function findDefinitionByKey(key: string): CharacteristicDefinition | null {
  return definitions.find(d => d.internalKey === key) ?? null
}

export function listDefinitionsForRole(role: string): CharacteristicDefinition[] {
  return definitions.filter(d => d.allowedRoles.includes(role))
}
