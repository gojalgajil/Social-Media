import express from 'express';
import multer from 'multer';
import { prisma } from '../prisma/client';
import { authenticate } from '../middlewares/auth';
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
router.get('/me', authenticate, async (req, res) => {
  const { user } = req as any as { user: { id: number } };
  try {
    const userData = await prisma.user.findUnique({
      where: { id: user.id }
    });
    if (!userData) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(userData);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
