import { useState } from 'react'
import { logout as logoutApi } from '../api/auth.api'

export default function useLogout() {
  const [isLoading, setIsLoading] = useState(false)

  async function logout() {
    setIsLoading(true)
    try {
      await logoutApi()
    } finally {
      setIsLoading(false)
    }
  }

  return { logout, isLoading }
}
