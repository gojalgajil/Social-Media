import { Request, Response } from 'express';
import { prisma } from '../prisma/client';
import ThreadModel from '../models/Thread';
import { createThreadSchema, updateThreadSchema } from '../validation/auth_joi';
import { broadcast } from '../services/socketService';
import { imageQueue } from '../queues/imageQueue';

class ThreadController {
  // Get all threads
async getAllThreads(req: Request, res: Response) {
    try {
      const authUser = (req as any).user;

const rawThreads = await ThreadModel.findAll();

const threads = await Promise.all(
  rawThreads.map(async (t: any) => {
    const likes = await prisma.likes.count({
      where: { thread_id: t.id },
    });

    const isLiked = await prisma.likes.findFirst({
      where: {
        thread_id: t.id,
        user_id: authUser?.id,
      },
    });

    return {
      ...t,
      likesCount: likes,
      isLiked: Boolean(isLiked),
      full_name: t.user?.full_name || "Anonymous",
      username: t.user?.username || "user",
      avatar: t.user?.photo_profile || null,
    };
  })
);
      
      res.status(200).json({
        success: true,
        data: threads,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching threads',
        error: (error as Error).message,
      });
    }
  }

  // Get thread by ID
  async getThreadById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const thread = await ThreadModel.findById(parseInt(id));

      if (!thread) {
        return res.status(404).json({
          success: false,
          message: 'Thread not found',
        });
      }

      res.status(200).json({
        success: true,
        data: thread,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching thread',
        error: (error as Error).message,
      });
    }
  }

  // Get threads by user
  async getThreadsByUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const threads = await ThreadModel.findByUser(userId);

      res.status(200).json({
        success: true,
        data: threads,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching user threads',
        error: (error as Error).message,
      });
    }
  }

  // Create a new thread
 async createThread(req: Request, res: Response) {
  try {
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Invalid request body',
      });
    }

    const { error } = createThreadSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const { content } = req.body;
    let image = "";

    if (Array.isArray(req.files)) {
      const uploadedImg = req.files.find((f: any) => f.fieldname === "image");
      if (uploadedImg) {
        image = uploadedImg.filename;
      }
    }
    const authUser = (req as any).user;

    // ⬇⬇⬇ BUAT THREAD SEPERTI BIASA ⬇⬇⬇
    const newThread = await ThreadModel.create({
      content,
      image: image || '',
      number_of_replies: 0,
      created_by: authUser.id.toString(),
      updated_by: authUser.id.toString(),
    });

    // ⬇⬇⬇ MASUKKAN KE MESSAGE QUEUE UNTUK PROSES GAMBAR ⬇⬇⬇
    if (image) {
      await imageQueue.add("processImage", {
        threadId: newThread.id,
        imagePath: image,
      });
    }

    // Fetch user info for the new thread
    const user = await prisma.user.findUnique({
      where: { id: parseInt(newThread.created_by) },
      select: {
        id: true,
        username: true,
        full_name: true,
        photo_profile: true,
      },
    });

    const enrichedThread = {
      id: newThread.id,
      content: newThread.content,
      image: newThread.image,
      number_of_replies: newThread.number_of_replies,
      created_at: newThread.created_at,
      user: user || null,
    };

    broadcast({ type: 'new_thread', thread: enrichedThread });

    res.status(201).json({
      success: true,
      message: 'Thread created successfully',
      data: enrichedThread,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating thread',
      error: (error as Error).message,
    });
  }
}

  // Update thread
  async updateThread(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!req.body || typeof req.body !== 'object') {
        return res.status(400).json({
          success: false,
          message: 'Invalid request body',
        });
      }

      const { error } = updateThreadSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details[0].message,
        });
      }

      const { content, image } = req.body;
      const authUser = (req as any).user;

      // Fetch the thread to check ownership
      const thread = await ThreadModel.findById(parseInt(id));
      if (!thread) {
        return res.status(404).json({
          success: false,
          message: 'Thread not found',
        });
      }

      // Check if the thread was created by the current user
      const threadData = (thread as any);
      if (threadData.user.id !== authUser.id) {
        return res.status(403).json({
          success: false,
          message: 'You can only update your own threads',
        });
      }

      const updatedThread = await ThreadModel.update(parseInt(id), {
        content,
        image,
        updated_by: authUser.id.toString(),
      });

      res.status(200).json({
        success: true,
        message: 'Thread updated successfully',
        data: updatedThread,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating thread',
        error: (error as Error).message,
      });
    }
  }

  // Delete thread
  async deleteThread(req: Request, res: Response) {
    try {
      const { id } = req.params;

      await ThreadModel.delete(parseInt(id));

      res.status(200).json({
        success: true,
        message: 'Thread deleted successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error deleting thread',
        error: (error as Error).message,
      });
    }
  }

  // Increment reply count
  async incrementReplies(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const updatedThread = await ThreadModel.incrementReplies(parseInt(id));

      res.status(200).json({
        success: true,
        message: 'Reply count incremented',
        data: updatedThread,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error incrementing replies',
        error: (error as Error).message,
      });
    }
  }

  // Search threads
  async searchThreads(req: Request, res: Response) {
    try {
      const { q } = req.query;

      if (!q) {
        return res.status(400).json({
          success: false,
          message: 'Search query is required',
        });
      }

      const threads = await ThreadModel.search(q as string);

      res.status(200).json({
        success: true,
        data: threads,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error searching threads',
        error: (error as Error).message,
      });
    }
  }
  // Toggle like / unlike
async toggleLike(req: Request, res: Response) {
  try {
    const threadId = parseInt(req.params.id);
    const authUser = (req as any).user;

    if (!authUser) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const userId = authUser.id;

    // cek apakah user sudah like
    const existingLike = await prisma.likes.findFirst({
      where: {
        thread_id: threadId,
        user_id: userId,
      },
    });

    // Kalau SUDAH LIKE → UNLIKE
    if (existingLike) {
      await prisma.likes.delete({
        where: { id: existingLike.id },
      });

      broadcast({ type: 'like_update', threadId, liked: false });

      return res.status(200).json({
        success: true,
        liked: false,
        message: "Unliked",
      });
    }

    // Kalau BELUM LIKE → CREATE LIKE
    await prisma.likes.create({
      data: {
        thread_id: threadId,
        user_id: userId,
        created_by: String(userId),
        updated_by: String(userId),
      },
    });

    broadcast({ type: 'like_update', threadId, liked: true });

    return res.status(200).json({
      success: true,
      liked: true,
      message: "Liked",
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error toggling like",
      error: (error as Error).message,
    });
  }
}

}


export default new ThreadController();
