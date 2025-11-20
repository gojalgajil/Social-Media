import express from 'express';
import multer from 'multer';
import path from 'path';
import { authenticate } from '../middlewares/auth';
import threadController from '../controller/threads';
import threads from '../controller/threads';
import fs from "fs";

const router = express.Router();
// Folder uploads sejajar src/
const uploadPath = path.join(__dirname, "..", "..", "uploads");

// Buat folder kalau belum ada
if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });

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
router.post("/", authenticate, upload.any(), threadController.createThread);

// Update thread (protected)
router.put('/:id', authenticate, threadController.updateThread);

// Delete thread (protected)
router.patch('/:id/increment-replies', authenticate, threadController.incrementReplies);

// Delete thread (protected)
router.delete('/:id', authenticate, threadController.deleteThread);

export default router;
