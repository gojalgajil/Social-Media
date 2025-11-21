import { Request, Response } from 'express';
import { prisma } from '../prisma/client';
import ThreadReplyModel from '../models/ReplyThread';
import ThreadModel from '../models/Thread';
import { createReplyThreadSchema, updateReplyThreadSchema } from '../validation/auth_joi';
import { imageQueue } from '../queues/imageQueue';

class ReplyController {
  // Create a new reply
  async createReply(req: Request, res: Response) {
    try {
      const { threadId } = req.params;

      if (!req.body || typeof req.body !== 'object') {
        return res.status(400).json({
          success: false,
          message: 'Invalid request body',
        });
      }

      const { error } = createReplyThreadSchema.validate(req.body);
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

      // Verify thread exists
      const thread = await ThreadModel.findById(parseInt(threadId));
      if (!thread) {
        return res.status(404).json({
          success: false,
          message: 'Thread not found',
        });
      }

      // Create the reply
      const newReply = await ThreadReplyModel.create({
        content,
        image: image || '',
        photo_profile: authUser.photo_profile || '',
        user_id: authUser.id,
        thread_id: parseInt(threadId),
        created_by: authUser.id.toString(),
        updated_by: authUser.id.toString(),
      });

      // Increment thread reply count
      await ThreadModel.incrementReplies(parseInt(threadId));

      // Fetch the created reply
      const createdReplyRaw = await prisma.replies.findUnique({
        where: { id: newReply.id },
      });

      // Fetch user info
      const userInfo = await prisma.user.findUnique({
        where: { id: createdReplyRaw!.user_id },
        select: {
          id: true,
          username: true,
          full_name: true,
          photo_profile: true,
        },
      });

      // Combine the data
      const createdReply = {
        id: createdReplyRaw!.id,
        content: createdReplyRaw!.content,
        image: createdReplyRaw!.image,
        photo_profile: createdReplyRaw!.photo_profile,
        created_at: createdReplyRaw!.created_at,
        user: userInfo,
      };

      res.status(201).json({
        success: true,
        message: 'Reply created successfully',
        data: createdReply,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error creating reply',
        error: (error as Error).message,
      });
    }
  }

  // Get all replies for a thread
  async getRepliesByThread(req: Request, res: Response) {
    try {
      const { threadId } = req.params;
      const authUser = (req as any).user;

      const rawReplies = await ThreadReplyModel.findByThreadId(parseInt(threadId));

      const replies = await Promise.all(
        rawReplies.map(async (r: any) => {
          const likes = await prisma.likes.count({
            where: { reply_id: r.id },
          });

          const isLiked = await prisma.likes.findFirst({
            where: {
              reply_id: r.id,
              user_id: authUser?.id,
            },
          });

          return {
            ...r,
            likesCount: likes,
            isLiked: Boolean(isLiked),
          };
        })
      );

      res.status(200).json({
        success: true,
        data: replies,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching replies',
        error: (error as Error).message,
      });
    }
  }

  // Update a reply
  async updateReply(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!req.body || typeof req.body !== 'object') {
        return res.status(400).json({
          success: false,
          message: 'Invalid request body',
        });
      }

      const { error } = updateReplyThreadSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details[0].message,
        });
      }

      const { content, image } = req.body;
      const authUser = (req as any).user;

      // Fetch the reply to check ownership
      const reply = await ThreadReplyModel.findAll();
      const replyData = reply.find(r => r.id === parseInt(id));

      if (!replyData) {
        return res.status(404).json({
          success: false,
          message: 'Reply not found',
        });
      }

      // Check if the reply was created by the current user
      if (!replyData.user || replyData.user.id !== authUser.id) {
        return res.status(403).json({
          success: false,
          message: 'You can only update your own replies',
        });
      }

      const updateData: any = {
        updated_by: authUser.id.toString(),
      };

      if (content !== undefined) updateData.content = content;
      if (image !== undefined) updateData.image = image;

      const updatedReply = await ThreadReplyModel.update(parseInt(id), updateData);

      res.status(200).json({
        success: true,
        message: 'Reply updated successfully',
        data: updatedReply,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating reply',
        error: (error as Error).message,
      });
    }
  }

  // Delete a reply
  async deleteReply(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const authUser = (req as any).user;

      // Fetch the raw reply from database to get thread_id and check ownership
      const reply = await prisma.replies.findUnique({
        where: { id: parseInt(id) },
      });

      if (!reply) {
        return res.status(404).json({
          success: false,
          message: 'Reply not found',
        });
      }

      // Check if the reply was created by the current user
      if (reply.user_id !== authUser.id) {
        return res.status(403).json({
          success: false,
          message: 'You can only delete your own replies',
        });
      }

      // Get thread_id before deleting
      const threadId = reply.thread_id;

      await ThreadReplyModel.delete(parseInt(id));

      // Decrement thread reply count
      if (threadId > 0) {
        await prisma.threads.update({
          where: { id: threadId },
          data: {
            number_of_replies: {
              decrement: 1,
            },
          },
        });
      }

      res.status(200).json({
        success: true,
        message: 'Reply deleted successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error deleting reply',
        error: (error as Error).message,
      });
    }
  }

  // Toggle like / unlike for reply
  async toggleLike(req: Request, res: Response) {
    try {
      const replyId = parseInt(req.params.id);
      const authUser = (req as any).user;

      if (!authUser) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const userId = authUser.id;

      // cek apakah user sudah like reply
      const existingLike = await prisma.likes.findFirst({
        where: {
          reply_id: replyId,
          user_id: userId,
        },
      });

      // Kalau SUDAH LIKE → UNLIKE
      if (existingLike) {
        await prisma.likes.delete({
          where: { id: existingLike.id },
        });

        return res.status(200).json({
          success: true,
          liked: false,
          message: "Unliked",
        });
      }

      // Kalau BELUM LIKE → CREATE LIKE
      await prisma.likes.create({
        data: {
          reply_id: replyId,
          user_id: userId,
          created_by: String(userId),
          updated_by: String(userId),
        },
      });

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

export default new ReplyController();
