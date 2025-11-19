import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import logo from "../assets/CirlceHubLogo.png";

export default function Register() {
  const [username, setUsername] = useState('');
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setMessage('');

    try {
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          full_name: fullname,
          email,
          password,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage("Registration successful!");
        setUsername('');
        setFullname('');
        setEmail('');
        setPassword('');
      } else {
        setMessage(data.message || "Registration failed");
      }
    } catch (err) {
      setMessage("An error occurred during registration");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-blue-400 px-4">
      <form
        onSubmit={handleRegister}
        className="w-full max-w-md bg-blue-300 p-8 rounded-2xl shadow border border-zinc-800 space-y-6"
      >
        {/* Judul */}
        <div className="text-center">
          <img src={logo} alt="Circle Hub Logo" className="mx-auto mb-4 h-25" />
          <p className="text-xl text-blue-950">Create an Account</p>
        </div>

        {/* Username */}
        <div>
          <Label htmlFor="username" className="text-blue-950">Username</Label>
          <Input
            id="username"
            type="text"
            className="bg-blue-300 border-zinc-700 text-white"
            placeholder="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        {/* Full name */}
        <div>
          <Label htmlFor="fullname" className="text-blue-950">Full Name</Label>
          <Input
            id="fullname"
            type="text"
            className="bg-blue-300bg-zinc-900 border-zinc-700 text-white"
            placeholder="full name"
            value={fullname}
            onChange={(e) => setFullname(e.target.value)}
            required
          />
        </div>

        {/* Email */}
        <div>
          <Label htmlFor="email" className="text-blue-950">Email</Label>
          <Input
            id="email"
            type="email"
            className="bg-blue-300 border-zinc-700 text-white"
            placeholder="email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {/* Password */}
        <div>
          <Label htmlFor="password" className="text-blue-950">Password</Label>
          <Input
            id="password"
            type="password"
            className="bg-blue-300 border-zinc-700 text-white"
            placeholder="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {/* Button */}
        <Button
          type="submit"
          className="w-full bg-blue-950 hover:bg-blue-700 text-white font-semibold py-5 rounded-full text-lg"
        >
          Create account
        </Button>

        {/* Message */}
        {message && (
          <p className="text-center text-red-400 text-sm">{message}</p>
        )}

        {/* Link to Login */}
        <p className="text-center text-blue-950 text-sm">
          Already have an account?{" "}
          <Link className="text-black font-bold hover:underline" to="/login">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
