// import React from 'react';

// import { useState, useEffect } from 'react';
// import { useSelector, useDispatch } from 'react-redux';
// import { setUser } from '../../stores/userSlice';

// const BASE_URL = 'http://localhost:3002/uploads/';

// export default function EditProfile({ onClose }: { onClose?: () => void }) {
//   const currentUser = useSelector((state: any) => state.user.user);
//   const dispatch = useDispatch();
//   const [fullName, setFullName] = useState('');
//   const [username, setUsername] = useState('');
//   const [bio, setBio] = useState('');
//   const [headerImage, setHeaderImage] = useState<string | null>(null);
//   const [profileImage, setProfileImage] = useState<string | null>(null);
//   const [headerFile, setHeaderFile] = useState<File | null>(null);
//   const [profileFile, setProfileFile] = useState<File | null>(null);

//   useEffect(() => {
//     if (currentUser) {
//       setFullName(currentUser.full_name || '');
//       setUsername(currentUser.username || '');
//       setBio(currentUser.bio || '');
//       // Use full URL from backend response directly
//       setHeaderImage(currentUser.header ? `${BASE_URL}${currentUser.header}` : null);
//       setProfileImage(currentUser.photo_profile ? `${BASE_URL}${currentUser.photo_profile}` : null);
//     }
//   }, [currentUser]);

//   const handleImageChange = (type: 'header' | 'profile', file: File) => {
//     const url = URL.createObjectURL(file);
//     if (type === 'header') {
//       setHeaderImage(url);
//       setHeaderFile(file);
//     } else {
//       setProfileImage(url);
//       setProfileFile(file);
//     }
//   };

//   const handleSave = async () => {
//     const formData = new FormData();
//     formData.append('full_name', fullName);
//     formData.append('username', username);
//     formData.append('bio', bio);

//     if (headerFile) {
//       formData.append('header', headerFile);
//     }
//     if (profileFile) {
//       formData.append('photo_profile', profileFile);
//     }

//     try {
//       const token = localStorage.getItem('token');
//       const response = await fetch(`http://localhost:3002/api/auth/user`, {
//         method: 'PUT',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//         },
//         body: formData,
//       });

//       const responseText = await response.text();
//       console.log('Response:', response.status, responseText);

//       if (!response.ok) {
//         throw new Error(responseText || 'Failed to update profile');
//       }

//       const result = JSON.parse(responseText);

//       // Normalize user object to replace user_id with id and remove user_id
//       const normalizedUser = {...result.user};
//       normalizedUser.id = normalizedUser.user_id;
//       delete normalizedUser.user_id;

//       console.log('Dispatching user to Redux:', normalizedUser); // debug log

//       // Update user in Redux store
//       dispatch(setUser({ user: normalizedUser }));

//       // Close modal after success
//       if (onClose) onClose();
//     } catch (error: any) {
//       console.error(error);
//       alert(error.message || 'Failed to update profile');
//     }
//   };

//   return (
//     <div className="p-4 max-w-lg mx-auto">
//       <h2 className="text-xl font-semibold mb-6 text-blue-950">Edit Profile</h2>

//       {/* Header with gradient background or user banner */}
//       <div className="relative h-20 rounded-lg mb-4 bg-blue-300">
//         <div
//           className="w-full h-full cursor-pointer relative overflow-hidden rounded-lg"
//             style={headerImage ? { backgroundImage: 'url(' + headerImage + ')', backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
//           onClick={() => document.getElementById('header-input')?.click()}
//         >
//           {headerImage ? null : <div className="absolute inset-0 flex items-center justify-center bg-gray-200 rounded-lg"><span className="text-gray-500">Header Image</span></div>}
//           <input
//             id="header-input"
//             type="file"
//             accept="image/*"
//             onChange={(e) => e.target.files?.[0] && handleImageChange('header', e.target.files[0])}
//             className="hidden"
//           />
//           <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/50 transition-opacity rounded-lg">
//             <span className="text-white text-2xl">➕</span>
//           </div>
//         </div>

//         {/* Profile picture - positioned to overlap header */}
//         <div className="absolute -bottom-4 left-3">
//           <div
//             className="w-12 h-12 rounded-full bg-gray-300 border-4 border-blue-500 cursor-pointer relative overflow-hidden"
//             style={profileImage ? { backgroundImage: 'url(' + profileImage + ')', backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
//             onClick={(e) => {e.stopPropagation(); document.getElementById('profile-input')?.click();}}
//           >
//             {profileImage ? null : <span className="text-gray-500 text-xs absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">Photo</span>}
//             <input
//               id="profile-input"
//               type="file"
//               accept="image/*"
//               onChange={(e) => e.target.files?.[0] && handleImageChange('profile', e.target.files[0])}
//               className="hidden"
//             />
//             <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/50 rounded-full transition-opacity">
//               <span className="text-white text-xl">➕</span>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Form Fields */}
//       <div className="space-y-4">
//         {/* Full Name */}
//         <div>
//           <label className="block text-blue-950 font-medium mb-1">Full Name</label>
//           <input
//             type="text"
//             value={fullName}
//             onChange={(e) => setFullName(e.target.value)}
//             className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//           />
//         </div>

//         {/* Username */}
//         <div>
//           <label className="block text-blue-950 font-medium mb-1">Username</label>
//           <input
//             type="text"
//             value={username}
//             onChange={(e) => setUsername(e.target.value)}
//             className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//             placeholder="@username"
//           />
//         </div>

//         {/* Bio */}
//         <div>
//           <label className="block text-blue-950 font-medium mb-1">Bio</label>
//           <textarea
//             value={bio}
//             onChange={(e) => setBio(e.target.value)}
//             className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
//             rows={3}
//            />
//         </div>
//       </div>

//       {/* Save Button */}
//       <div className="mt-6 flex justify-end">
//         <button
//           onClick={handleSave}
//           className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
//         >
//           Save Changes
//         </button>
//       </div>
//     </div>
//   );
// }
