import express from 'express';
import multer from 'multer';
import { handleRegister, handleLogin } from '../controller/auth_user';

const router = express.Router();
const upload = multer({ dest: '../uploads/' });

router.post('/register', (req, res, next) => {
  // Handle file upload if present
  upload.single('photo_profile')(req, res, (err: any) => {
    if (err) {
      return res.status(400).json({ message: 'File upload error' });
    }
    next();
  });
}, handleRegister);
router.post('/login', handleLogin);

export default router;
