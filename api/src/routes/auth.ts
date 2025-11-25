import express from 'express';
import multer from 'multer';
import path from "path";

import { handleRegister, handleLogin } from '../controller/auth_user';

const router = express.Router();

// upload ke folder api/uploads (assuming runs from api dir)
const uploadPath = path.join(process.cwd(), "uploads");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname); // biar punya .jpg/.png
    cb(null, unique + ext);
  },
});

const upload = multer({ storage });

router.post('/register', upload.single("photo_profile"), handleRegister);
router.post('/login', handleLogin);

export default router;