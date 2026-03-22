import { useAuth0 } from "@auth0/auth0-react"
import { Button } from "@/components/ui/Button"

export default function AuthButtons() {
  const {
    isLoading,
    isAuthenticated,
    error,
    user,
    loginWithRedirect,
    logout,
  } = useAuth0()

  if (isLoading) {
    return (
      <Button size="sm" variant="outline" disabled>
        Loading...
      </Button>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() =>
            loginWithRedirect({ authorizationParams: { screen_hint: "signup" } })
          }
        >
          Sign up
        </Button>
        <Button size="sm" onClick={() => loginWithRedirect()}>
          Log in
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <span className="hidden sm:inline text-sm text-muted-foreground">
        {user?.email}
      </span>
      <Button
        size="sm"
        variant="outline"
        onClick={() =>
          logout({ logoutParams: { returnTo: window.location.origin } })
        }
      >
        Log out
      </Button>
      {error && <span className="text-xs text-destructive">{error.message}</span>}
    </div>
  )
}