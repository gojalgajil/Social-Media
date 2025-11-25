import { Request, Response } from "express";
import { registerUser, loginUser } from "../services/auth";
import { loginSchema, registerSchema, updateUserSchema } from "../validation/auth_joi";
import { prisma } from '../prisma/client';

export async function handleRegister(req: Request, res: Response) {
  try {
    const { username, full_name, email, password } = req.body;

    // ⬅ hanya filename saja
    const photo_profile = req.file ? req.file.filename : undefined;

    const result = await registerUser(
      username,
      full_name,
      email,
      password,
      photo_profile
    );

    res.json({ message: "Register success", ...result });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
}

export async function handleLogin(req: Request, res: Response){
    try {
        const {error} = loginSchema.validate(req.body);
        if (error) {
            res.status(400).json({message: error.message});
            return;
        }

        const {email, password} = req.body;
        const result = await loginUser(email, password);
        res.json({ message : "Login success", ...result});
    } catch (err: any){
        res.status(400).json({message: err.message});
    }
}

export async function handleLogout(req: Request, res: Response) {

    res.json({ message : "Logout success"});
}

export async function handleUpdateUser(req: Request, res: Response) {
  try {
    const { error } = updateUserSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const authUser = (req as any).user;
    const { full_name, username, bio } = req.body;
    const photo_profile = req.files?.photo_profile ? req.files.photo_profile[0].filename : undefined;
    const header = req.files?.header ? req.files.header[0].filename : undefined;

    // Check username uniqueness if provided and changed
    if (username && username !== authUser.username) {
      const existing = await prisma.user.findFirst({ where: { username } });
      if (existing) {
        return res.status(400).json({ message: "Username already taken" });
      }
    }

    const updateData: any = { updated_by: authUser.username };
    if (full_name !== undefined) updateData.full_name = full_name.trim();
    if (username !== undefined) updateData.username = username.trim();
    if (bio !== undefined) updateData.bio = bio.trim();
    if (photo_profile !== undefined) updateData.photo_profile = photo_profile;
    if (header !== undefined) updateData.header = header;

    const updatedUser = await prisma.user.update({
      where: { id: authUser.id },
      data: updateData
    });

    // Return sanitized user data
    const userResponse = {
      id: updatedUser.id,
      username: updatedUser.username,
      full_name: updatedUser.full_name,
      email: updatedUser.email,
      photo_profile: updatedUser.photo_profile,
      bio: updatedUser.bio,
      header: updatedUser.header
    };

    res.json({ message: "Profile updated successfully", user: userResponse });
  } catch (err: any) {
    console.error('Update user error:', err);
    res.status(500).json({ message: err.message || "Internal server error" });
  }
}
