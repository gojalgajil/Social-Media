import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateThreadData {
  content: string;
  image: string;
  number_of_replies: number;
  created_by: string;
  updated_by: string;
}

export interface UpdateThreadData {
  content?: string;
  image?: string;
  number_of_replies?: number;
  updated_by: string;
  updated_at?: Date;
}

class ThreadModel {
  // Create a new thread
  async create(data: CreateThreadData) {
    return await prisma.threads.create({
      data: {
        content: data.content,
        image: data.image,
        number_of_replies: data.number_of_replies,
        created_by: data.created_by,
        updated_by: data.updated_by,
      },
    });
  }

  // Get all threads with user info
  async findAll() {
    const threads = await prisma.threads.findMany({
      orderBy: {
        created_at: 'desc',
      },
    });

    // Get user info for each thread
    const threadsWithUser = await Promise.all(
      threads.map(async (thread) => {
        const user = await prisma.user.findUnique({
          where: { id: parseInt(thread.created_by) },
          select: {
            id: true,
            username: true,
            full_name: true,
            photo_profile: true,
          },
        });

        // Ensure full_name is set to username if null
        if (user) {
          user.full_name = user.full_name || user.username || "User";
        }

        return {
          id: thread.id,
          content: thread.content,
          image: thread.image,
          number_of_replies: thread.number_of_replies,
          created_at: thread.created_at,
          user: user || null,
        };
      })
    );

    return threadsWithUser;
  }

  // Get thread by ID with user info
  async findById(id: number) {
    const thread = await prisma.threads.findUnique({
      where: { id },
    });

    if (!thread) return null;

    const user = await prisma.user.findUnique({
      where: { id: parseInt(thread.created_by) },
      select: {
        id: true,
        username: true,
        full_name: true,
        photo_profile: true,
      },
    });

    return {
      id: thread.id,
      content: thread.content,
      image: thread.image,
      number_of_replies: thread.number_of_replies,
      created_at: thread.created_at,
      full_name: user?.full_name,
      username: user?.username || "user",
      avatar: user?.photo_profile || null,
    };
  }

  // Get threads by user
  async findByUser(userId: string) {
    const threads = await prisma.threads.findMany({
      where: { created_by: userId },
      orderBy: {
        created_at: 'desc',
      },
    });

    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: {
        id: true,
        username: true,
        full_name: true,
        photo_profile: true,
      },
    });

    return threads.map((thread) => ({
      id: thread.id,
      content: thread.content,
      image: thread.image,
      number_of_replies: thread.number_of_replies,
      created_at: thread.created_at,
      user: user || null,
    }));
  }

  // Update thread
  async update(id: number, data: UpdateThreadData) {
    return await prisma.threads.update({
      where: { id },
      data: {
        ...data,
        updated_at: new Date(),
      },
    });
  }

  // Delete thread
  async delete(id: number) {
    return await prisma.threads.delete({
      where: { id },
    });
  }

  // Increment reply count
  async incrementReplies(id: number) {
    return await prisma.threads.update({
      where: { id },
      data: {
        number_of_replies: {
          increment: 1,
        },
      },
    });
  }

  // Search threads by content with user info
  async search(query: string) {
    const threads = await prisma.threads.findMany({
      where: {
        content: {
          contains: query,
          mode: 'insensitive',
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    const threadsWithUser = await Promise.all(
      threads.map(async (thread) => {
        const user = await prisma.user.findUnique({
          where: { id: parseInt(thread.created_by) },
          select: {
            id: true,
            username: true,
            full_name: true,
            photo_profile: true,
          },
        });

        return {
          id: thread.id,
          content: thread.content,
          image: thread.image,
          number_of_replies: thread.number_of_replies,
          created_at: thread.created_at,
          user: user || null,
        };
      })
    );

    return threadsWithUser;
  }
}

export default new ThreadModel();
