import Sidebar from "./sidebar"

function HomePage() {
  const menuItems = [
    { label: "Home", path: "/", icon: <span>🏠</span> },
    { label: "Tasks", path: "/tasks", icon: <span>📚</span> },
    { label: "Progress", path: "/progress", icon: <span>📈</span> },
  ]

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside style={{ width: 240, borderRight: "1px solid #e5e7eb", padding: 16 }}>
        <Sidebar menuItems={menuItems} />
      </aside>

      <main style={{ flex: 1, padding: 24 }}>
        <h1>Home</h1>
        <p>Welcome ##Account Name Here##</p>
      </main>
    </div>
  )
}

export default HomePage