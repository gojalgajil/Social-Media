import bcrypt from "bcryptjs";
import { prisma } from "../prisma/client";
import { signToken, UserPayload } from "../utils/jwt";

interface AuthResponse {
  user_id: number;
  username: string;
  full_name: string;
  email: string;
  token: string;
}

// REGISTER
export const registerUser = async (
  username: string,
  full_name: string,
  email: string,
  password: string,
  created_by: string = 'system'
): Promise<AuthResponse> => {
  // Validasi sederhana
  if (!email.match(/@/) || password.length < 6) {
    throw new Error("Invalid email or password");
  }

  // Cek apakah email sudah ada
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error("Email already registered");
  }

  // Hash password
  const hashed = await bcrypt.hash(password, 10);

  // Buat user baru
  const user = await prisma.user.create({
    data: {
      username,
      full_name,
      email,
      password: hashed,
      created_by,
      updated_by: created_by
    },
  });

  // Buat JWT token
  const payload: UserPayload = {
    id: user.id,
  };
  const token = signToken(payload);

  return {
    user_id: user.id,
    username: user.username,
    full_name: user.full_name,
    email: user.email,
    token
  };
};

// LOGIN
export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("User not found");

  if (!user.password) throw new Error("Password not set for this user");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Incorrect password");

  const payload: UserPayload = { id: user.id };
  const token = signToken(payload);

  return {
    user_id: user.id,
    username: user.username,
    full_name: user.full_name,
    email: user.email,
    token
  };
}
