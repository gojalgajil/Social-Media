// import { ArrowLeft } from "lucide-react";
// import { useSelector } from "react-redux";
// import { useNavigate } from "react-router-dom";

// export default function Profile() {
//   const navigate = useNavigate();
//   const currentUser = useSelector((state: any) => state.user.user);

//   return (
//     <div className="max-w-2xl mx-auto">
//       {/* untuk nama di atas */}
//       <div className=" border-blue-950 py-4 px-4 font-semibold text-lg flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
//         <ArrowLeft size={20} />
//         <h3 className="font-bold text-blue-950 ">{currentUser?.user.full_name || 'Name'}</h3>
//       </div>

//       {/* Header with gradient background or user banner */}
//       <div
//         className="relative mx-3 h-30 rounded-lg"
//         style={
//           currentUser?.user?.header ? {
//             backgroundImage: `url(${currentUser.user.header})`,
//             backgroundSize: 'cover',
//             backgroundPosition: 'center'
//           } : {
//             background: 'linear-gradient(to right, #86efac, #fef08a, #fef08a)'
//           }
//         }
//       >

//         {/* Profile picture - positioned to overlap header */}
//         <div className="absolute -bottom-8 left-3">
//           <img
//             src={
//           currentUser?.user?.photo_profile
//             ? currentUser.user.photo_profile
//             : "https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png"
//         }
//             className="w-17 h-17 rounded-full object-cover border-3 border-blue-300"
//             alt="Profile"
//           />
//         </div>
//       </div>

//       {/* Edit Profile button below header */}
//       <div className="mx-3 mb-2 flex justify-end">
//         <button className="px-3 cursor-pointer mt-2 py-1 bg-blue-500 text-white text-xs rounded-lg hover:bg-blue-400 transition">
//           Edit Profile
//         </button>
//       </div>

//       {/* Profile info */}
//       <div className="px-3 pb-3">
//         <div className="flex items-center gap-1 mb-1">
//           <h3 className="font-bold text-blue-950 text-sm">{currentUser?.user.full_name || 'Name'}</h3>
//         </div>

//         <p className="text-white text-xs mb-2">@{currentUser?.user.username || 'username'}</p>

//         <p className="text-blue-950 text-xs mb-2">
//           {currentUser?.user.bio || 'Bio goes here'}
//         </p>

//         {/* Stats */}
//         <div className="flex items-center gap-3 text-xs">
//           <div>
//             <span className="text-blue-950 font-bold">291</span>
//             <span className="text-white ml-1">Followers</span>
//           </div>
//           <div>
//             <span className="text-blue-950 font-bold">23</span>
//             <span className="text-white ml-1">Following</span>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
