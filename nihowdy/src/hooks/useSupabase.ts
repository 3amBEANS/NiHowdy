import { useAuth0 } from '@auth0/auth0-react'
import { useMemo } from 'react'
import { createAuthenticatedClient } from '../lib/supabase'

export function useSupabase() {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0()

  return useMemo(() => ({
    async getClient() {
      if (!isAuthenticated) throw new Error('Not authenticated')
      const token = await getAccessTokenSilently({
        authorizationParams: { audience: import.meta.env.VITE_AUTH0_AUDIENCE }
      })
      return createAuthenticatedClient(token)
    }
  }), [isAuthenticated, getAccessTokenSilently])
}