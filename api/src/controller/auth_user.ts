import { Request, Response } from "express";
import { registerUser, loginUser } from "../services/auth";
import { loginSchema, registerSchema } from "../validation/auth_joi";

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
