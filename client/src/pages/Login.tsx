import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { AuthContext } from "../context/AuthContext";
import logo from "../assets/CirlceHubLogo.png";

export default function Login(){
    const context = useContext(AuthContext);
    if (!context) return null;
    const { login } = context;
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [message, setMessage] = useState('');

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        setMessage('');
        try {
            const response = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password,
                }),
            });
            const data = await response.json();
            if (response.ok) {
                // Assuming data includes token
                login(data.token);
                navigate('/');
            } else {
                setMessage(data.message || 'Login failed');
            }
        } catch (error) {
            setMessage('An error occurred during Login');
        }
    };

    return (
  <div className="min-h-screen w-screen flex items-center justify-center bg-blue-400">
    <div className="w-full max-w-md text-center">

      {/* Logo / Brand */}
      <img src={logo} alt="Circle Hub Logo" className="mx-auto mb-4 h-25" />
      <p className=" text-blue-950 text-xl mb-8">Login to Circle</p>

      <form
        onSubmit={handleLogin}
        className="bg-transparent p-6 rounded-lg space-y-5"
      >
        {/* Email */}
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

        {/* Password */}
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
            <a href="#" className="text-sm  text-blue-950 hover:text-white">
              Forgot password?
            </a>
          </div>
        </div>

        {/* Button */}
        <Button
          type="submit"
          className="w-full py-5 rounded-full text-lg font-medium bg-blue-950 hover:bg-blue-700 text-white"
        >
          Login
        </Button>

        {/* Error Message */}
        {message && (
          <p className="text-center text-red-400 text-sm mt-1">{message}</p>
        )}

        {/* Register link */}
        <p className="text-blue-950 text-sm mt-4">
          Don’t have an account yet?{" "}
          <a href="/register" className="text-black font-bold hover:underline">
            Create account
          </a>
        </p>
      </form>
    </div>
  </div>
);




}
