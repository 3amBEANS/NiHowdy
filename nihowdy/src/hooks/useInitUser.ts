// src/hooks/useInitUser.ts
import { useAuth0 } from '@auth0/auth0-react'
import { useEffect } from 'react'
import { useSupabase } from './useSupabase'

export function useInitUser() {
  const { user, isAuthenticated, isLoading } = useAuth0()
  const { getClient } = useSupabase()

  useEffect(() => {
    // Guard against loading state AND narrow the type so TS knows user is defined
    if (isLoading || !isAuthenticated || !user?.sub || !user?.email) return

    async function syncUser() {
      try {
        const db = await getClient()
        await db.from('users').upsert(
          {
            auth0_user_id: user!.sub!,
            email: user!.email!,
            display_name: user!.name ?? null,
          },
          { onConflict: 'auth0_user_id' }
        )
      } catch (err) {
        console.error('Failed to sync user:', err)
      }
    }

    syncUser()
  }, [isLoading, isAuthenticated, user, getClient])
}