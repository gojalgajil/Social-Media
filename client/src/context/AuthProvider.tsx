import { AuthContext } from "./AuthContext"
import { useState } from "react"


export function AuthProvider({children}: {children: React.ReactNode}) {
    const [token, setToken] = useState<string | null>(() => localStorage
        .getItem("token"))

    
        const login = (token: string) => {
            localStorage.setItem("token", token)
            setToken(token)
        }

        const logout = () => {
            localStorage.removeItem("token")
            setToken(null)
        }
        return (
            <AuthContext.Provider value={{token, login, logout}}>
                {children}
            </AuthContext.Provider>
        )
}