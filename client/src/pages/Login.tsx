import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { AuthContext } from "../context/AuthContext";
import logo from "../assets/CirlceHubLogo.png";
import { useDispatch } from "react-redux";
import { setUser } from "../stores/userSlice";

export default function Login() {
  const context = useContext(AuthContext);
  if (!context) return null;

  const { login } = context;
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const dispatch = useDispatch();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setMessage("");

    try {
      // === LOGIN API ===
      const response = await fetch("http://localhost:3002/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Login failed");
        return;
      }

      // Token -> AuthContext
      login(data.token);

      // === Redux: simpan user + token ===
      dispatch(
        setUser({
          user: {
            id: data.user_id,
            username: data.username,
            full_name: data.full_name,
            email: data.email,
            photo_profile: data.photo_profile,
          },
          token: data.token,
        })
      );

      // === LocalStorage ===
      localStorage.setItem(
        "currentUser",
        JSON.stringify({
          id: data.user_id,
          username: data.username,
          full_name: data.full_name,
          email: data.email,
          photo_profile: data.photo_profile,
        })
      );
      localStorage.setItem("token", data.token);

      navigate("/");
    } catch (error) {
      console.error(error);
      setMessage("An error occurred during login");
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-blue-400">
      <div className="w-full max-w-md text-center">
        <img src={logo} alt="Circle Hub Logo" className="mx-auto mb-4 h-25" />
        <p className="text-blue-950 text-xl mb-8">Login to Circle</p>

        <form onSubmit={handleLogin} className="bg-transparent p-6 rounded-lg space-y-5">
          <div className="text-left">
            <Label htmlFor="email" className="text-blue-950">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="text"
              className="bg-transparent border-blue-950 text-white placeholder-gray-500"
              placeholder="Email/Username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="text-left">
            <Label htmlFor="password" className="text-blue-950">
              Password <span className="text-red-500">*</span>
            </Label>
            <Input
              id="password"
              type="password"
              className="bg-transparent border-blue-950 text-white placeholder-gray-500"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div className="text-right mt-1">
              <a href="#" className="text-sm text-blue-950 hover:text-white">
                Forgot password?
              </a>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full py-5 rounded-full text-lg font-medium bg-blue-950 hover:bg-blue-700 text-white"
          >
            Login
          </Button>

          {message && (
            <p className="text-center text-red-400 text-sm mt-1">{message}</p>
          )}

          <p className="text-blue-950 text-sm mt-4">
            Don't have an account yet?{" "}
            <a href="/register" className="text-black font-bold hover:underline">
              Create account
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
