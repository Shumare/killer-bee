import { useEffect, useState } from 'react'
import { getUser } from '../api/user.api'
import { mapUserResponseToUser } from '../mappers/user.mapper'
import type { User } from '../models/User'

export default function useUser(userId: string) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    async function fetchUser() {
      setIsLoading(true)
      setHasError(false)
      try {
        const response = await getUser(userId)
        setUser(mapUserResponseToUser(response))
      } catch (err) {
        console.error(`[useUser] Erreur chargement utilisateur ${userId}`, err)
        setHasError(true)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [userId])

  return { user, isLoading, hasError }
}
