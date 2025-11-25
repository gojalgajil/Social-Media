import { useState } from 'react';
import { useSelector } from 'react-redux';
import ProfileModal from '../profile/ProfileModal';
import EditProfile from '../profile/EditProfile';

export function ProfileCard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const currentUser = useSelector((state: any) => state.user.currentUser);

  const user = currentUser?.user; // singkat dan aman

  const handleEditProfile = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const headerSrc = user?.header
    ? `http://localhost:3002/uploads/${user.header}`
    : "https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png";

  const profileSrc = user?.photo_profile
    ? `http://localhost:3002/uploads/${user.photo_profile}`
    : "https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png";

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
            <div>
              <span className="text-blue-950 font-bold">291</span>
              <span className="text-white ml-1">Followers</span>
            </div>
            <div>
              <span className="text-blue-950 font-bold">23</span>
              <span className="text-white ml-1">Following</span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <ProfileModal open={isModalOpen} onClose={handleCloseModal}>
        <EditProfile onClose={handleCloseModal} />
      </ProfileModal>
    </>
  );
}
