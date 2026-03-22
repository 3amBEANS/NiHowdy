import { Link, useLocation } from "react-router-dom"
import { BookOpen, Calendar, Video, User, LogOut } from "lucide-react"
import { useAuth0 } from "@auth0/auth0-react"
import { cn } from "../lib/utils"
import { Button } from "@/components/ui/Button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const navItems = [
  { href: "/", label: "Study Plan", icon: Calendar },
  { href: "/materials", label: "Materials", icon: Video },
]

export function Navigation() {
  const { pathname } = useLocation()
  const {
    isLoading,
    isAuthenticated,
    user,
    loginWithRedirect: login,
    logout: auth0Logout,
  } = useAuth0()

  const signup = () =>
    login({ authorizationParams: { screen_hint: "signup" } })

  const logout = () =>
    auth0Logout({ logoutParams: { returnTo: window.location.origin } })

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <BookOpen className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-semibold text-foreground">Linguify</span>
        </Link>

        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-2">
          {isLoading ? (
            <div className="h-9 w-9 animate-pulse rounded-full bg-accent" />
          ) : isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  aria-label="User menu"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent">
                    <User className="h-4 w-4 text-accent-foreground" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5 text-sm text-muted-foreground">
                  {user?.email ?? user?.name ?? "User"}
                </div>
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={signup}>
                Signup
              </Button>
              <Button size="sm" onClick={() => login()}>
                Login
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export default Navigation