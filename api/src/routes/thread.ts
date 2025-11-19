import express from 'express';
import multer from 'multer';
import { authenticate } from '../middlewares/auth';
import threadController from '../controller/threads';
import threads from '../controller/threads';

const router = express.Router();

import path from 'path';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, '../uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname) || '.jpg'; // fallback to jpg if no ext
    cb(null, uniqueName + ext);
  },
});

const upload = multer({ storage });

// Get all threads
router.get('/', authenticate, threadController.getAllThreads);

// Search threads
router.get('/search', authenticate, threadController.searchThreads);

// Get threads by user
router.get('/user/:userId', authenticate, threadController.getThreadsByUser);

// Get thread by ID
router.get('/:id', authenticate, threadController.getThreadById);

router.post("/:id/like", authenticate, threads.toggleLike);

// Create a new thread (protected)
router.post('/', authenticate, (req, res, next) => {
  upload.single('image')(req, res, (err: any) => {
    if (err) {
      return res.status(400).json({ success: false, message: 'File upload error' });
    }
    next();
  });
}, threadController.createThread);

// Update thread (protected)
router.put('/:id', authenticate, threadController.updateThread);

// Delete thread (protected)
router.patch('/:id/increment-replies', authenticate, threadController.incrementReplies);

// Delete thread (protected)
router.delete('/:id', authenticate, threadController.deleteThread);

export default router;
