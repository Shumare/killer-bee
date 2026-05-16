import { useState } from 'react'
import { login as loginApi } from '../api/auth.api'
import type { LoginRequestDTO } from '../dto/auth.dto'
import { mapLoginResponseToSession, mapLoginResponseToUser } from '../mappers/auth.mapper'

export default function useLogin() {
  const [isLoading, setIsLoading] = useState(false)
  const [hasError, setHasError] = useState(false)

  async function login(credentials: LoginRequestDTO) {
    setIsLoading(true)
    setHasError(false)

    try {
      const response = await loginApi(credentials)
      const user = mapLoginResponseToUser(response)
      const session = mapLoginResponseToSession(response)
      return { user, session }
    } catch {
      setHasError(true)
    } finally {
      setIsLoading(false)
    }
  }

  return { login, isLoading, hasError }
}
