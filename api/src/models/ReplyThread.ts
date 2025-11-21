import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface CreateThreadReplyData {
  content: string;
  image: string;
  photo_profile: string;
  user_id: number;
  thread_id: number;
  created_by: string;
  updated_by: string;
}

export interface UpdateThreadReplyData {
  content?: string;
  image?: string;
  updated_by: string;
  updated_at?: Date;
}

class ThreadReplyModel {
  // Create a new reply
  async create(data: CreateThreadReplyData) {
    return await prisma.replies.create({
      data: {
        content: data.content,
        image: data.image,
        photo_profile: data.photo_profile,
        user_id: data.user_id,
        thread_id: data.thread_id,
        created_by: data.created_by,
        updated_by: data.updated_by,
      },
    });
  }

  // Get all replies for a specific thread with user info
  async findByThreadId(threadId: number) {
    const replies = await prisma.replies.findMany({
      where: {
        thread_id: threadId,
      },
      orderBy: {
        created_at: 'asc',
      },
    });

    // Get user info for each reply
    const repliesWithUser = await Promise.all(
      replies.map(async (reply) => {
        const user = await prisma.user.findUnique({
          where: { id: reply.user_id },
          select: {
            id: true,
            username: true,
            full_name: true,
            photo_profile: true,
          },
        });

        return {
          id: reply.id,
          content: reply.content,
          image: reply.image,
          photo_profile: reply.photo_profile,
          created_at: reply.created_at,
          user: user || null,
        };
      })
    );

    return repliesWithUser;
  }

  // Get all replies across all threads with user info (optional, if still needed)
  async findAll() {
    const replies = await prisma.replies.findMany({
      orderBy: {
        created_at: 'desc',
      },
    });

    // Get user info for each reply
    const repliesWithUser = await Promise.all(
      replies.map(async (reply) => {
        const user = await prisma.user.findUnique({
          where: { id: reply.user_id },
          select: {
            id: true,
            username: true,
            full_name: true,
            photo_profile: true,
          },
        });

        return {
          id: reply.id,
          content: reply.content,
          image: reply.image,
          photo_profile: reply.photo_profile,
          created_at: reply.created_at,
          user: user || null,
        };
      })
    );

    return repliesWithUser;
  }

  // Update a reply
  async update(id: number, data: UpdateThreadReplyData) {
    const updateData: any = {
      updated_by: data.updated_by,
      updated_at: new Date(),
    };

    if (data.content !== undefined) {
      updateData.content = data.content;
    }

    if (data.image !== undefined) {
      updateData.image = data.image;
    }

    return await prisma.replies.update({
      where: { id },
      data: updateData,
    });
  }

  // Delete a reply
  async delete(id: number) {
    return await prisma.replies.delete({
      where: { id },
    });
  }

}

export default new ThreadReplyModel();
