// main.tsx
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import {Auth0Provider} from "@auth0/auth0-react"
import App from "./App"
import "./index.css"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Auth0Provider
      domain="dev-5d72ymseihy5vc1o.us.auth0.com"
      clientId="NazzAxLakglLksC63NZ5D8Kv22VJmXZa"
      authorizationParams={{ redirect_uri: window.location.origin }}
    >
    <BrowserRouter>
      <App />
    </BrowserRouter>
    </Auth0Provider>
  </StrictMode>
)