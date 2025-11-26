import express from "express";
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticate } from "../middlewares/auth";
import { prisma } from '../prisma/client';


const router = express.Router();

router.get('/me', authenticate, async (req, res) => {
  const { user } = req as any;

  try {
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        username: true,
        full_name: true,
        email: true,
        photo_profile: true,
        bio: true,
        header: true,
        created_at: true,
        created_by: true,
        updated_at: true,
        updated_by: true
      }
    });

    if (!userData) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({
      message: "User profile",
      user: userData
    });

  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/:id/followers', authenticate, async (req, res) => {
  const { id } = req.params;

  try {
    // Find users who follow this user
    const followRecords = await prisma.following.findMany({
      where: { following_id: id }
    });

    if (followRecords.length === 0) {
      return res.json([]);
    }

    // Get follower IDs and convert to numbers
    const followerIds = followRecords.map(record => parseInt(record.follower_id));

    // Get follower details
    const followers = await prisma.user.findMany({
      where: { id: { in: followerIds } },
      select: {
        id: true,
        username: true,
        full_name: true,
        photo_profile: true,
        bio: true
      }
    });

    return res.json(followers);
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/:id/following', authenticate, async (req, res) => {
  const { id } = req.params;

  try {
    // Find users who this user follows
    const followRecords = await prisma.following.findMany({
      where: { follower_id: id }
    });

    if (followRecords.length === 0) {
      return res.json([]);
    }

    // Get following IDs and convert to numbers
    const followingIds = followRecords.map(record => parseInt(record.following_id));

    // Get following details
    const following = await prisma.user.findMany({
      where: { id: { in: followingIds } },
      select: {
        id: true,
        username: true,
        full_name: true,
        photo_profile: true,
        bio: true
      }
    });

    return res.json(following);
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/suggested/:userId', authenticate, async (req, res) => {
  const { userId } = req.params;

  try {
    // Get users that the current user is following
    const followingRecords = await prisma.following.findMany({
      where: { follower_id: userId },
      select: { following_id: true }
    });

    const followingIds = followingRecords.map(record => record.following_id);

    // Get suggested users: not followed by current user and not the current user
    const suggestedUsers = await prisma.user.findMany({
      where: {
        AND: [
          { id: { not: parseInt(userId) } }, // Exclude current user
          { id: { notIn: followingIds.map(id => parseInt(id)) } } // Exclude users they follow
        ]
      },
      orderBy: {
        id: 'desc' // This will randomize the order since user IDs are sequential
        // For true randomness, you might want to implement a more complex solution
      },
      select: {
        id: true,
        username: true,
        full_name: true,
        photo_profile: true,
        bio: true
      },
      take: 5 // Limit to 5 suggestions
    });

    return res.json(suggestedUsers);
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Follow a user
router.post('/follow', authenticate, async (req, res) => {
  const { user } = req as any;
  const { targetUserId } = req.body;

  try {
    // Check if already following
    const existing = await prisma.following.findFirst({
      where: {
        follower_id: user.id.toString(),
        following_id: targetUserId.toString()
      }
    });

    if (existing) {
      return res.status(400).json({ message: 'Already following this user' });
    }

    // Create follow relationship
    await prisma.following.create({
      data: {
        follower_id: user.id.toString(),
        following_id: targetUserId.toString()
      }
    });

    return res.json({ message: 'User followed successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Unfollow a user
router.post('/unfollow', authenticate, async (req, res) => {
  const { user } = req as any;
  const { targetUserId } = req.body;

  try {
    await prisma.following.deleteMany({
      where: {
        follower_id: user.id.toString(),
        following_id: targetUserId.toString()
      }
    });

    return res.json({ message: 'User unfollowed successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Allow public viewing of any user's threads (social media style)
router.get('/:id/threads', authenticate, async (req, res) => {
  const { id } = req.params;

  try {
    // Get basic thread data with like counts
    const rawThreads = await prisma.threads.findMany({
      where: {
        created_by: id // Assuming created_by stores the user ID
      },
      select: {
        id: true,
        content: true,
        created_at: true,
        image: true, // Single image field if it exists
        number_of_replies: true // If this field exists in the schema
      },
      orderBy: {
        created_at: 'desc'
      },
      take: 50 // Limit to avoid huge responses
    });

    // Transform to match expected format with like counts
    const formattedThreads = await Promise.all(
      rawThreads.map(async (thread) => {
        const likesCount = await prisma.likes.count({
          where: { thread_id: thread.id },
        });
        return {
          id: thread.id,
          content: thread.content,
          created_at: thread.created_at,
          likesCount,
          repliesCount: thread.number_of_replies || 0,
          images: thread.image ? [thread.image] : [] // Single image in array
        };
      })
    );

    return res.json(formattedThreads);
  } catch (error) {
    console.error('Error fetching user threads:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/search', authenticate, async (req, res) => {
  const { q } = req.query;

  if (!q || typeof q !== 'string' || q.trim().length < 1) {
    return res.status(400).json({ message: 'Search query is required' });
  }

  try {
    const searchQuery = q.trim();

    const users = await prisma.user.findMany({
      where: {
        OR: [
          {
            username: {
              contains: searchQuery,
              mode: 'insensitive'
            }
          },
          {
            full_name: {
              contains: searchQuery,
              mode: 'insensitive'
            }
          }
        ]
      },
      select: {
        id: true,
        username: true,
        full_name: true,
        photo_profile: true,
        bio: true
      },
      take: 20 // Limit results
    });

    return res.json(users);
  } catch (error) {
    console.error('Search error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// View any user's public profile (must be LAST route - catchall)
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  // Prevent conflict with other routes by checking if ID is numeric
  if (isNaN(parseInt(id))) {
    return res.status(400).json({ message: 'Invalid user ID' });
  }

  try {
    const userData = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        username: true,
        full_name: true,
        photo_profile: true,
        bio: true,
        header: true,
        created_at: true
      }
    });

    if (!userData) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({
      message: "User profile",
      user: userData
    });

  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
