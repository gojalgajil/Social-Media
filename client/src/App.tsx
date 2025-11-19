import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import './App.css'
import { AuthProvider } from './context/AuthProvider'
import Register from './pages/Register'
import Login from './pages/Login'
import HomePage from './pages/HomePage'

// Layout utama untuk halaman setelah login
import LeftSidebar from './components/layout/LeftSideBar'
import RightSidebar from './components/layout/RightSideBar'


function AppWrapper() {
  const location = useLocation();

  // Cek apakah halaman login/register
  const authPages = ["/login", "/register"]
  const isAuthPage = authPages.includes(location.pathname)

  return (
    <>
      {isAuthPage ? (
        // Kalau login atau register -> tampilkan halaman saja
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      ) : (
        // Selain itu -> pakai layout lengkap
        <div className="flex min-h-screen bg-blue-300 text-blue-950">
          <LeftSidebar />

          <main className="flex-1 ml-64 mr-80">
            <Routes>
              <Route path="/" element={<HomePage />} />
            </Routes>
          </main>

          <RightSidebar />
        </div>
      )}
    </>
  )
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppWrapper />
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App