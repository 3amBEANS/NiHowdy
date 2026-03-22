import { Navigate, useLocation } from "react-router-dom"
import { useAuth0 } from "@auth0/auth0-react"
import { Button } from "@/components/ui/Button"

export default function AuthPage() {
  const { isAuthenticated, isLoading, loginWithRedirect, error } = useAuth0()
  const location = useLocation()
  const from = (location.state as { from?: { pathname?: string } })?.from?.pathname || "/"

  if (isLoading) return <div className="p-8">Loading...</div>
  if (isAuthenticated) return <Navigate to={from} replace />

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col justify-center gap-4 p-6">
      <h1 className="text-2xl font-semibold">Welcome</h1>
      <p className="text-sm text-muted-foreground">Log in or create an account to continue.</p>

      {error && <p className="text-sm text-destructive">{error.message}</p>}

      <Button onClick={() => loginWithRedirect()}>Log in</Button>
      <Button
        variant="outline"
        onClick={() =>
          loginWithRedirect({ authorizationParams: { screen_hint: "signup" } })
        }
      >
        Sign up
      </Button>
    </div>
  )
}