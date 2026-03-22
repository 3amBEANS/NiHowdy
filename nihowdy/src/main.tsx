// main.tsx
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import { Auth0Provider } from "@auth0/auth0-react"
import App from "./App"
import "./index.css"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Auth0Provider
      domain="dev-agnv5gggrz3icmx0.us.auth0.com"
      clientId="0PM5T3YoxC5I2z8ECt5wiu1xVr9YPhUB"
      authorizationParams={{ redirect_uri: window.location.origin }}
    >
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Auth0Provider>
  </StrictMode>
)