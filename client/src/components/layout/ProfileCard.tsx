// import { useState } from 'react';
// import { useSelector } from 'react-redux';
// import { useNavigate } from 'react-router-dom';
// import ProfileModal from '../profile/ProfileModal';
// import EditProfile from '../profile/EditProfile';

// export function ProfileCard() {
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const navigate = useNavigate();
//   const currentUser = useSelector((state: any) => state.user.user);

//   const handleEditProfile = () => {
//     setIsModalOpen(true);
//   };

//   const handleCloseModal = () => {
//     setIsModalOpen(false);
//   };

//   console.log('header value:', currentUser?.header)

//   return (
//     <>
//       <div className="bg-blue-500 rounded-lg overflow-hidden shadow-lg">
//         <div className="px-3 pt-3 pb-2">
//           <h2 className="text-blue-950 font-semibold text-sm">My Profile</h2>
//         </div>

//         {/* Header with gradient background or user banner */}
//         <div
//           className="relative mx-3 h-20 rounded-lg"
//           style={
//             currentUser?.header ? {
//               backgroundImage: `url(http://localhost:3002/uploads/${currentUser.header})`,
//               backgroundSize: 'cover',
//               backgroundPosition: 'center'
//             } : {
//               background: 'linear-gradient(to right, #86efac, #fef08a, #fef08a)'
//             }
//           }
//         >
//           {/* Profile picture - positioned to overlap header */}
//           <div className="absolute -bottom-7 left-3">
//             <img
//               src={
//                 currentUser?.photo_profile
//                   ? `http://localhost:3002/uploads/${currentUser.photo_profile}`
//                   : "https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png"
//               }
//               className="w-17 h-17 rounded-full object-cover border-3 border-blue-500"
//               alt="Profile"
//             />
//           </div>
//         </div>

//         {/* Edit Profile button below header */}
//         <div className="mx-3 mb-2 flex justify-end">
//           <button
//             className="px-3 mt-2 py-1 bg-blue-800 text-white cursor-pointer text-xs rounded-lg hover:bg-blue-700 transition"
//             onClick={handleEditProfile}
//           >
//             Edit Profile
//           </button>
//         </div>

//         {/* Profile info */}
//         <div className="px-3 pb-3">
//           <div className="flex items-center gap-1 mb-1">
//             <h3 className="font-bold text-blue-950 text-sm">{currentUser?.full_name || 'Name'}</h3>
//           </div>

//           <p className="text-white text-xs mb-2">@{currentUser?.username || 'username'}</p>

//           <p className="text-blue-950 text-xs mb-2">
//             {currentUser?.bio || 'Bio goes here'}
//           </p>

//           {/* Stats */}
//           <div className="flex items-center gap-3 text-xs">
//             <div>
//               <span className="text-blue-950 font-bold">291</span>
//               <span className="text-white ml-1">Followers</span>
//             </div>
//             <div>
//               <span className="text-blue-950 font-bold">23</span>
//               <span className="text-white ml-1">Following</span>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Edit Profile Modal */}
//       <ProfileModal open={isModalOpen} onClose={handleCloseModal}>
//         <EditProfile onClose={handleCloseModal} />
//       </ProfileModal>
//     </>
//   );
// }
