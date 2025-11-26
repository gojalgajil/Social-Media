import { useState, useEffect } from "react";
import { ArrowLeft, Heart, MessageCircle } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { fetchRepliesByThread, toggleReplyLike, addReply } from "@/stores/repliesSlice";
import { toggleThreadLike } from "@/stores/threadsSlice";
import FollowersFollowingModal from "../components/profile/FollowersFollowingModal";
import ProfileModal from "../components/profile/ProfileModal";
import EditProfile from "../components/profile/EditProfile";
import ThreadCard from "../components/thread/ThreadCard";
import ReplyCard from "../components/reply/ReplyCard";
import ImagePopup from "../components/ui/ImagePopup";
import ThreadDetailModal from "../components/ui/ThreadDetailModal";

interface UserProfile {
  id: number;
  username: string;
  full_name: string;
  photo_profile: string | null;
  header: string | null;
  bio: string | null;
}

interface UserStats {
  followers: number;
  following: number;
}

interface Thread {
  id: number;
  content: string;
  created_at: string;
  images?: string[];
  likesCount?: number;
  repliesCount?: number;
  isLiked?: boolean;
}



export default function ProfilePage() {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const dispatch = useDispatch();
  const currentUser = useSelector((state: any) => state.user.user);
  const token = useSelector((state: any) => state.user.token) || localStorage.getItem("token");
  const { replies } = useSelector((state: any) => state.replies);

  const [profileUser, setProfileUser] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats>({ followers: 0, following: 0 });
  const [loading, setLoading] = useState(true);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [followersFollowingModal, setFollowersFollowingModal] = useState<{
    isOpen: boolean;
    type: 'followers' | 'following' | null;
  }>({
    isOpen: false,
    type: null
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Profile subpage state
  const [activeTab, setActiveTab] = useState<'posts' | 'media'>('posts');
  const [userThreads, setUserThreads] = useState<Thread[]>([]);
  const [threadsLoading, setThreadsLoading] = useState(false);
  const [showThreadModal, setShowThreadModal] = useState(false);
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [replySubmitting, setReplySubmitting] = useState(false);
  const [likingThread, setLikingThread] = useState<number | null>(null);
  const [showImagePopup, setShowImagePopup] = useState(false);

  // Handle route logic
  useEffect(() => {
    console.log("Profile useEffect triggered:", { userId, currentUser });

    if (!userId && currentUser?.id) {
      // Viewing own profile via sidebar click
      console.log("Showing own profile");
      setIsCurrentUser(true);
      setProfileUser(currentUser);
      fetchStats(currentUser.id.toString());
      fetchUserThreads(currentUser.id.toString()); // Fetch user's posts
      setLoading(false);
    } else if (!userId && !currentUser) {
      // Waiting for currentUser to load
      setLoading(true);
    } else if (userId) {
      // Viewing another user's profile via search results
      console.log("Viewing other user profile:", userId);
      setIsCurrentUser(currentUser?.id?.toString() === userId);
      fetchUserProfile(userId);
      fetchStats(userId);
    }
  }, [userId, currentUser]);

  // Listen for real-time following count updates
  useEffect(() => {
    const handleFollowingCountChange = (event: any) => {
      const { action } = event.detail;
      if (action === 'increment') {
        setStats(prev => ({
          ...prev,
          following: prev.following + 1
        }));
        console.log("Following count incremented via real-time event (Profile page)");
      } else if (action === 'decrement') {
        setStats(prev => ({
          ...prev,
          following: Math.max(0, prev.following - 1)
        }));
        console.log("Following count decremented via real-time event (Profile page)");
      }
    };

    window.addEventListener('followingCountChanged', handleFollowingCountChange);

    return () => {
      window.removeEventListener('followingCountChanged', handleFollowingCountChange);
    };
  }, []);

  const fetchUserProfile = async (id: string) => {
    if (!token) return;

    try {
      setLoading(true);

      // For other users, we need to get their profile - but we don't have an API for that
      // For now, we'll just show that the user wasn't found
      console.log(`Attempting to view profile for user ${id}`);
      setProfileUser(null);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setProfileUser(null);
      setLoading(false);
    }
  };

  const fetchStats = async (id: string) => {
    if (!token) return;

    try {
      const [followersRes, followingRes] = await Promise.all([
        fetch(`http://localhost:3002/api/user/${id}/followers`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`http://localhost:3002/api/user/${id}/following`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const [followersData, followingData] = await Promise.all([
        followersRes.ok ? followersRes.json() : [],
        followingRes.ok ? followingRes.json() : []
      ]);

      setStats({
        followers: Array.isArray(followersData) ? followersData.length : 0,
        following: Array.isArray(followingData) ? followingData.length : 0
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      setStats({ followers: 0, following: 0 });
    }
  };

  const fetchUserThreads = async (id: string) => {
    if (!token) return;

    try {
      setThreadsLoading(true);

      // Check if we have an API endpoint for user threads - if not, we'll simulate it
      const response = await fetch(`http://localhost:3002/api/user/${id}/threads`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const threadsData = await response.json();
        const threads = threadsData || [];

        // If we're viewing our own profile, fetch like status for each thread
        if (isCurrentUser) {
          const threadsWithLikes = await Promise.all(
            threads.map(async (thread: Thread) => {
              try {
                // Check if current user liked this thread
                const likeStatusResponse = await fetch(`http://localhost:3002/api/threads/${thread.id}/like/status`, {
                  headers: { Authorization: `Bearer ${token}` }
                });

                if (likeStatusResponse.ok) {
                  const { isLiked, likesCount } = await likeStatusResponse.json();
                  return { ...thread, isLiked, likesCount };
                } else {
                  return { ...thread, isLiked: false, likesCount: thread.likesCount || 0 };
                }
              } catch (error) {
                console.error(`Error fetching like status for thread ${thread.id}:`, error);
                return { ...thread, isLiked: false, likesCount: thread.likesCount || 0 };
              }
            })
          );
          setUserThreads(threadsWithLikes);
        } else {
          // For other users' profiles, just use the default like status
          setUserThreads(threads.map((thread: Thread) => ({ ...thread, isLiked: false })));
        }
      } else {
        // If no API endpoint yet, show empty threads
        setUserThreads([]);
      }
    } catch (error) {
      console.error("Error fetching user threads:", error);
      setUserThreads([]);
    } finally {
      setThreadsLoading(false);
    }
  };

  const handleFollowersClick = () => {
    setFollowersFollowingModal({
      isOpen: true,
      type: 'followers'
    });
  };

  const handleFollowingClick = () => {
    setFollowersFollowingModal({
      isOpen: true,
      type: 'following'
    });
  };

  const handleCloseFollowersFollowingModal = () => {
    setFollowersFollowingModal({
      isOpen: false,
      type: null
    });
  };

  const handleEditProfile = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  // Global like update callback for cross-page synchronization
  useEffect(() => {
    const likeUpdateCallback = (data: { threadId: number; userId: number; liked: boolean; likesCount: number }) => {
      console.log("🔄 Profile page receiving like update:", data);

      // Update the specific thread in our threads array
      setUserThreads(prevThreads =>
        prevThreads.map(thread =>
          thread.id === data.threadId
            ? {
                ...thread,
                likesCount: data.likesCount,
                // Update isLiked only for the user who triggered the action
                ...(data.userId === currentUser?.id ? { isLiked: data.liked } : {})
              }
            : thread
        )
      );

      // Update selectedThread if it's the same thread (for modal sync)
      if (selectedThread && selectedThread.id === data.threadId) {
        setSelectedThread(prev => prev ? {
          ...prev,
          likesCount: data.likesCount,
          ...(data.userId === currentUser?.id ? { isLiked: data.liked } : {})
        } : null);
      }
    };

    // Set the global callback (other pages will trigger this)
    (window as any).likeUpdateCallback = likeUpdateCallback;
    console.log("🔄 Profile page like callback registered");

    // Clean up on unmount
    return () => {
      (window as any).likeUpdateCallback = undefined;
      console.log("🔄 Profile page like callback unregistered");
    };
  }, [currentUser?.id]);

  // When a like is toggled locally, broadcast the update to other pages
  const broadcastLikeUpdate = (threadId: number, userId: number, liked: boolean, likesCount: number) => {
    console.log("Profile page broadcasting like update:", { threadId, userId, liked, likesCount });

    // Call the global callback if it exists (for pages that have set it)
    if ((window as any).likeUpdateCallback) {
      (window as any).likeUpdateCallback({ threadId, userId, liked, likesCount });
    }
  };

  const handleToggleThreadLike = async (threadId: number, hasLiked: boolean) => {
    if (likingThread) return; // Prevent double clicks

    setLikingThread(threadId);

    console.log("Toggling like for thread:", threadId, "hasLiked:", hasLiked);

    // Find the thread in our threads array
    const threadIndex = userThreads.findIndex(t => t.id === threadId);
    if (threadIndex === -1) return;

    const thread = userThreads[threadIndex];
    const originalThread = { ...thread };
    const newIsLiked = !hasLiked;

    try {
      // Optimistic update for userThreads
      setUserThreads(prevThreads =>
        prevThreads.map(t =>
          t.id === threadId
            ? {
                ...t,
                likesCount: hasLiked ? (t.likesCount || 0) - 1 : (t.likesCount || 0) + 1,
                isLiked: newIsLiked
              }
            : t
        )
      );

      // Optimistic update for selectedThread (if modal is open)
      if (selectedThread && selectedThread.id === threadId) {
        setSelectedThread(prev => prev ? {
          ...prev,
          likesCount: hasLiked ? (prev.likesCount || 0) - 1 : (prev.likesCount || 0) + 1,
          isLiked: newIsLiked
        } : null);
      }

      // Call Redux action
      await dispatch(toggleThreadLike({ threadId, currentIsLiked: hasLiked }));

      // Success - broadcast the update to other pages
      broadcastLikeUpdate(threadId, currentUser?.id || 0, newIsLiked, originalThread.likesCount ? (hasLiked ? originalThread.likesCount - 1 : originalThread.likesCount + 1) : (hasLiked ? 0 : 1));
    } catch (error) {
      // Revert to original state
      setUserThreads(prevThreads =>
        prevThreads.map(t =>
          t.id === threadId ? originalThread : t
        )
      );
      if (selectedThread && selectedThread.id === threadId) {
        setSelectedThread(originalThread);
      }
      console.error('Error toggling thread like:', error);
    } finally {
      setLikingThread(null);
    }
  };



  const BASE_URL = 'http://localhost:3002/uploads/';

  return (
    <>
      {/* Image Popup Modal */}
      <ImagePopup
        isOpen={showImagePopup}
        onClose={() => setShowImagePopup(false)}
        imageUrl={selectedThread ? `${BASE_URL}${selectedThread.images?.[0]}` : ''}
      />

      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="border-blue-950 py-4 px-4 font-semibold text-lg flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <ArrowLeft size={20} />
          <h3 className="font-bold text-blue-950">Profile</h3>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="max-w-2xl mx-auto p-4">
            <div className="text-center py-12">
              Loading profile...
            </div>
          </div>
        )}

        {/* User not found */}
        {!loading && !profileUser && (
          <div className="max-w-2xl mx-auto p-4">
            <div className="text-center py-12">
              <ArrowLeft className="cursor-pointer mx-auto mb-4" size={48} onClick={() => navigate('/')} />
              <h3>User not found</h3>
            </div>
          </div>
        )}

        {/* Profile Content */}
        {!loading && profileUser && (
          <>
            {/* Header with gradient background or user banner */}
            <div
              className="relative mx-3 h-30 rounded-lg"
              style={{
                backgroundImage: profileUser?.header ? `url(${BASE_URL}${profileUser.header})` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              {!profileUser.header && (
                <div className="w-full h-full bg-gradient-to-r from-green-400 via-yellow-400 to-yellow-400 rounded-lg"></div>
              )}
              {/* Profile picture - positioned to overlap header */}
              <div className="absolute -bottom-8 left-3">
                <img
                  src={profileUser.photo_profile ? `${BASE_URL}${profileUser.photo_profile}` : "https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png"}
                  className="w-17 h-17 rounded-full object-cover border-3 border-blue-300"
                  alt="Profile"
                />
              </div>
            </div>

            {/* Edit Profile button (only for current user) */}
            {isCurrentUser && (
              <div className="mx-3 mb-2 flex justify-end">
                <button
                  className="px-3 mt-2 py-1 bg-blue-500 text-white text-xs rounded-lg hover:bg-blue-400 cursor-pointer transition"
                  onClick={handleEditProfile}
                >
                  Edit Profile
                </button>
              </div>
            )}

            {/* Profile info */}
            <div className="px-3 pb-3">
              <div className="flex items-center gap-1 mb-1">
                <h3 className="font-bold text-blue-950 text-sm">{profileUser.full_name}</h3>
              </div>

              <p className="text-white text-xs mb-2">@{profileUser.username}</p>

              <p className="text-blue-950 text-xs mb-2">
                {profileUser.bio || "This user hasn't written a bio yet."}
              </p>

              {/* Stats */}
              <div className="flex items-center gap-3 text-xs">
                <div onClick={handleFollowersClick} className="cursor-pointer hover:opacity-75">
                  <span className="text-blue-950 font-bold">{stats.followers}</span>
                  <span className="text-white ml-1">Followers</span>
                </div>
                <div onClick={handleFollowingClick} className="cursor-pointer hover:opacity-75">
                  <span className="text-blue-950 font-bold">{stats.following}</span>
                  <span className="text-white ml-1">Following</span>
                </div>
              </div>
            </div>

            {/* Profile Tabs */}
            <div className="mt-6 border-t border-gray-200">
              <div className="flex">
                <button
                  onClick={() => setActiveTab('posts')}
                  className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                    activeTab === 'posts'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  All Posts
                </button>
                <button
                  onClick={() => setActiveTab('media')}
                  className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                    activeTab === 'media'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Media
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-4">
              {activeTab === 'posts' && (
                <div>
                  <h3 className="text-lg font-semibold text-blue-950 mb-4">All Posts</h3>
                  {threadsLoading ? (
                    <div className="text-center py-8">
                      <div className="text-blue-950">Loading posts...</div>
                    </div>
                  ) : userThreads.length > 0 ? (
                    <div>
                      {userThreads.map(thread => {
                        // Transform thread data to match ThreadCard interface
                        const threadCardData = {
                          id: thread.id,
                          content: thread.content,
                          image: thread.images?.[0] || undefined, // Use first image if available
                          number_of_replies: thread.repliesCount || 0, // We'll add this to API
                          created_at: thread.created_at,
                          likesCount: thread.likesCount || 0, // We'll add this to API
                          isLiked: thread.isLiked || false,
                          full_name: profileUser.full_name,
                          username: profileUser.username,
                          avatar: profileUser.photo_profile || undefined
                        };

                        return (
                          <ThreadCard
                            key={thread.id}
                            thread={threadCardData}
                            toggleLike={handleToggleThreadLike}
                            from="profile"
                          />
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-gray-500">
                        {isCurrentUser ? "You haven't posted anything yet." : "This user hasn't posted anything yet."}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'media' && (
                <div>
                  <h3 className="text-lg font-semibold text-blue-950 mb-4">Media</h3>
                  {threadsLoading ? (
                    <div className="text-center py-8">
                      <div className="text-blue-950">Loading media...</div>
                    </div>
                  ) : (() => {
                    // Extract all images from user's threads
                    const allImages = userThreads
                      .filter(thread => thread.images && thread.images.length > 0)
                      .flatMap(thread => thread.images!.map(image => ({
                        image,
                        threadId: thread.id,
                        createdAt: thread.created_at
                      })));

                    return allImages.length > 0 ? (
                      <div className="grid grid-cols-3 gap-4">
                        {allImages.map((item, index) => (
                          <div key={`${item.threadId}-${index}`} className="aspect-square">
                            <img
                              src={`${BASE_URL}${item.image}`}
                              alt={`Media ${index + 1}`}
                              className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={async () => {
                                const thread = userThreads.find(t => t.id === item.threadId);
                                if (thread) {
                                  let finalThread = thread;
                                  // For other users, fetch like status for this thread
                                  if (!isCurrentUser) {
                                    try {
                                      const likeStatusResponse = await fetch(`http://localhost:3002/api/threads/${thread.id}/like/status`, {
                                        headers: { Authorization: `Bearer ${token}` }
                                      });
                                      if (likeStatusResponse.ok) {
                                        const { isLiked, likesCount } = await likeStatusResponse.json();
                                        finalThread = { ...thread, isLiked, likesCount };
                                      }
                                    } catch (error) {
                                      console.error(`Error fetching like status for thread ${thread.id}:`, error);
                                    }
                                  }
                                  setSelectedThread(finalThread);
                                  dispatch(fetchRepliesByThread(item.threadId.toString()));
                                  setShowThreadModal(true);
                                }
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="text-gray-500">
                          {isCurrentUser ? "You haven't shared any media yet." : "This user hasn't shared any media yet."}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Followers/Following Modal */}
            {followersFollowingModal.type && (
              <FollowersFollowingModal
                isOpen={followersFollowingModal.isOpen}
                onClose={handleCloseFollowersFollowingModal}
                type={followersFollowingModal.type}
                userId={profileUser.id?.toString() || ''}
              />
            )}

            {/* Edit Profile Modal */}
            <ProfileModal open={isModalOpen} onClose={handleCloseModal}>
              <EditProfile onClose={handleCloseModal} />
            </ProfileModal>

            {/* Thread Details Modal */}
            <ThreadDetailModal
              isOpen={showThreadModal}
              onClose={() => {
                setShowThreadModal(false);
                setSelectedThread(null);
              }}
              thread={selectedThread}
              profileUser={profileUser}
              token={token}
              currentUser={currentUser}
              onToggleImagePopup={() => setShowImagePopup(true)}
            />
          </>
        )}
      </div>
    </>
  );
}
