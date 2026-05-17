import { findDefinitionByKey, listDefinitionsForRole } from '../characteristic-definition/characteristic.definition'
import { getValuesForEntity } from '../characteristic-value/characteristic.value'

export function resolveCharacteristicsForEntity(
  entityId: number,
  role: string
): Record<string, string | number | boolean> {
  const allowedDefinitions = listDefinitionsForRole(role)
  const allowedKeys = allowedDefinitions.map(d => d.internalKey)
  return getValuesForEntity(entityId, allowedKeys)
}

export function canReadCharacteristic(internalKey: string, role: string): boolean {
  const definition = findDefinitionByKey(internalKey)
  if (!definition) return false
  return definition.allowedRoles.includes(role)
}
