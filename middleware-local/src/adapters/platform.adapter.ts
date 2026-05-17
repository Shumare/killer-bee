import type { NormalizedResponse } from '../ui-contracts/message.contract'
import { normalizeSuccess, normalizeFailure } from '../normalizers/response.normalizer'

const PLATFORM_BASE_URL = process.env.PLATFORM_URL ?? 'http://localhost:3000'

export async function callPlatform<T>(
  path: string,
  options: RequestInit = {}
): Promise<NormalizedResponse<T | null>> {
  try {
    const response = await fetch(`${PLATFORM_BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      const errorBody = await response.text()
      return normalizeFailure(errorBody || `Erreur HTTP ${response.status}`)
    }

    const data = await response.json() as T
    return normalizeSuccess(data)
  } catch {
    return normalizeFailure('Erreur de communication avec la plateforme')
  }
}
