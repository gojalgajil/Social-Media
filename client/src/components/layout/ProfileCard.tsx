import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import ProfileModal from '../profile/ProfileModal';
import EditProfile from '../profile/EditProfile';
import FollowersFollowingModal from '../profile/FollowersFollowingModal';


export function ProfileCard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [followersFollowingModal, setFollowersFollowingModal] = useState<{
    isOpen: boolean;
    type: 'followers' | 'following' | null;
  }>({
    isOpen: false,
    type: null
  });
  const [stats, setStats] = useState({ followers: 0, following: 0 });
  const [loading, setLoading] = useState(true);
  const [shouldRefreshStats, setShouldRefreshStats] = useState(false);
  const user = useSelector((state: any) => state.user.user);
  const token = useSelector((state: any) => state.user.token) || localStorage.getItem("token");
  const navigate = useNavigate();

  const handleEditProfile = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  useEffect(() => {
    const fetchStats = async () => {
      if (!token || !user?.id) {
        console.log("Missing token or user.id, skipping stats fetch");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log("Fetching stats for user:", user.id);
        const responses = await Promise.all([
          fetch(`http://localhost:3002/api/user/${user.id}/followers`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(`http://localhost:3002/api/user/${user.id}/following`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        console.log("API responses status:", responses[0].status, responses[1].status);

        const [followersData, followingData] = await Promise.all([
          responses[0].ok ? responses[0].json() : Promise.resolve([]),
          responses[1].ok ? responses[1].json() : Promise.resolve([])
        ]);

        console.log("Stats data:", {
          followers: followersData.length,
          following: followingData.length
        });

        setStats({
          followers: Array.isArray(followersData) ? followersData.length : 0,
          following: Array.isArray(followingData) ? followingData.length : 0
        });
      } catch (error) {
        console.error("Error fetching stats on mount:", error);
        setStats({ followers: 0, following: 0 });
      } finally {
        console.log("Setting loading to false after initial fetch");
        setLoading(false);
      }
    };

    fetchStats();
  }, [token, user?.id]);

  // Listen for real-time following count updates
  useEffect(() => {
    const handleFollowingCountChange = (event: any) => {
      const { action } = event.detail;
      if (action === 'increment') {
        setStats(prev => ({
          ...prev,
          following: prev.following + 1
        }));
        console.log("Following count incremented via real-time event");
      } else if (action === 'decrement') {
        setStats(prev => ({
          ...prev,
          following: Math.max(0, prev.following - 1)
        }));
        console.log("Following count decremented via real-time event");
      }
    };

    window.addEventListener('currentUserFollowingChange', handleFollowingCountChange);

    return () => {
      window.removeEventListener('currentUserFollowingChange', handleFollowingCountChange);
    };
  }, []);

  // Refresh stats when following changes
  // Simple local update when following changes
  useEffect(() => {
    if (shouldRefreshStats) {
      setStats(prev => ({
        ...prev,
        following: Math.max(0, prev.following - 1) // Decrement following count
      }));
      setShouldRefreshStats(false);
    }
  }, [shouldRefreshStats]);

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
    // Note: Not refreshing stats on close since unfollowing already happened via API
    // Stats will be correct on next component load
  };

  const headerSrc = user?.header
    ? `http://localhost:3002/uploads/${user.header}`
    : "https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png";

  const profileSrc = user?.photo_profile
    ? `http://localhost:3002/uploads/${user.photo_profile}`
    : "https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png";

  
  const debug = useSelector((state: any) => state.user);
console.log("DEBUG USER:", debug);
    // console.log("ProfileCard render:", user);
    // console.log("ProfilecardRender", user);
    

  return (
    <>
      <div className="bg-blue-500 rounded-lg overflow-hidden shadow-lg">
        <div className="px-3 pt-3 pb-2">
          <h2 className="text-blue-950 font-semibold text-sm">My Profile</h2>
        </div>

        {/* Header */}
        <div className="relative mx-3 h-20 rounded-lg">
          <img
            src={headerSrc}
            className="w-full h-full object-cover rounded-lg"
            alt="Header"
          />

          {/* Profile photo */}
          <div className="absolute -bottom-8 left-3">
            <img
              src={profileSrc}
              className="w-17 h-17 rounded-full object-cover border-3 border-blue-500"
              alt="Profile"
            />
          </div>
        </div>

        {/* Edit Button */}
        <div className="mx-3 flex justify-end">
          <button
            className="px-3 mt-2 py-1 bg-blue-800 text-white cursor-pointer text-xs rounded-lg hover:bg-blue-700 transition"
            onClick={handleEditProfile}
          >
            Edit Profile
          </button>
        </div>

        {/* User Info */}
        <div className="px-3 pb-3">
          <h3 className="font-bold text-blue-950 text-sm">
            {user?.full_name || "Name"}
          </h3>

          <p className="text-white text-xs mb-2">@{user?.username || "username"}</p>

          <p className="text-blue-950 text-xs mb-2">
            {user?.bio || "Bio goes here"}
          </p>

          <div className="flex items-center gap-3 text-xs">
            <div onClick={handleFollowersClick} className="cursor-pointer hover:opacity-75">
              <span className="text-blue-950 font-bold">{loading ? '...' : stats.followers}</span>
              <span className="text-white ml-1">Followers</span>
            </div>
            <div onClick={handleFollowingClick} className="cursor-pointer hover:opacity-75">
              <span className="text-blue-950 font-bold">{loading ? '...' : stats.following}</span>
              <span className="text-white ml-1">Following</span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <ProfileModal open={isModalOpen} onClose={handleCloseModal}>
        <EditProfile onClose={handleCloseModal} />
      </ProfileModal>

      {/* Followers/Following Modal */}
      {followersFollowingModal.type && (
        <FollowersFollowingModal
          isOpen={followersFollowingModal.isOpen}
          onClose={handleCloseFollowersFollowingModal}
          type={followersFollowingModal.type}
          userId={user?.id?.toString() || ''}
        />
      )}
    </>
  );
}
