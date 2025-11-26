import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import './App.css'
import { AuthProvider } from './context/AuthProvider'
import Register from './pages/Register'
import Login from './pages/Login'
import HomePage from './pages/HomePageUpdated'
import SearchPage from './pages/Search'
import ProfilePage from './pages/Profile'
import Status from './pages/Status'

// Layout
import LeftSidebar from './components/layout/LeftSideBar'
import RightSidebar from './components/layout/RightSideBar'

// Redux + Axios
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "./stores/userSlice";
import { useEffect } from "react";
import axios from "axios";

function AppWrapper() {
  const location = useLocation();
  const dispatch = useDispatch();

  const token = useSelector((state: any) => state.user.token)
    || localStorage.getItem("token");

// AUTO FETCH USER
useEffect(() => {
  const fetchUser = async () => {
    if (!token) return;

    try {
      const res = await axios.get("http://localhost:3002/api/user/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,   // ⬅ WAJIB DITAMBAH
      });

      dispatch(setUser({ user: res.data.user, token }));
      
      localStorage.setItem("currentUser", JSON.stringify(res.data));

    } catch (err) {
      console.error("Failed to auto fetch user:", err);
    }
  };

  fetchUser();
}, [token]);

  // Cek apakah halaman login/register
  const authPages = ["/login", "/register"]
  const isAuthPage = authPages.includes(location.pathname)

  
  return (
    <>
      {isAuthPage ? (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      ) : (
        <div className="flex min-h-screen bg-blue-300 text-blue-950">
          <LeftSidebar />

          <main className="flex-1 ml-75 mr-100">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/profile/:userId" element={<ProfilePage />} />
              <Route path="/thread/:threadId" element={<Status />} />
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
