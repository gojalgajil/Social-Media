import express from 'express';
import multer from 'multer';
import path from 'path';
import { authenticate } from '../middlewares/auth';
import repliesController from '../controller/replies';
import fs from "fs";

const router = express.Router();
// Folder uploads sejajar src/
const uploadPath = path.join(__dirname, "..", "..", "uploads");

// Use existing multer setup (same as threads)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname) || '.jpg'; // fallback to jpg if no ext
    cb(null, uniqueName + ext);
  },
});

const upload = multer({ storage });

// Get all replies for a thread
router.get('/thread/:threadId', authenticate, repliesController.getRepliesByThread);

// Create a new reply (protected)
router.post("/:threadId", authenticate, upload.any(), repliesController.createReply);

// Update reply (protected)
router.put('/:id', authenticate, repliesController.updateReply);

// Delete reply (protected)
router.delete('/:id', authenticate, repliesController.deleteReply);

// Toggle like for reply (protected)
router.post('/:id/like', authenticate, repliesController.toggleLike);
router.put('/:id/like', authenticate, repliesController.toggleLike);
router.delete('/:id/like', authenticate, repliesController.toggleLike);
export default router;
