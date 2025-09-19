import { Navbar } from './Navbar'

const Layout = ({ children, user, onLogout }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar user={user} onLogout={onLogout} />
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}

export { Layout }