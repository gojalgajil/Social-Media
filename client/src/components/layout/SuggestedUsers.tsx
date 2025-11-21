export function SuggestedUsers() {
const data = [
{ img: "https://plus.unsplash.com/premium_vector-1719858611039-66c134efa74d?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",name: "Mohammed Jawahir", username: "@m_jawahir" },
{ img: "https://plus.unsplash.com/premium_vector-1719858610096-bba4498e5fc1?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",name: "Shakia Kimathi", username: "@shakiakim" },
{ img:"https://plus.unsplash.com/premium_vector-1719858612255-5e3ac29a8b27?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",name: "Naveen Singh", username: "@naveeenn" },
{ img: "https://plus.unsplash.com/premium_vector-1741665911412-20da2be1db8d?q=80&w=1098&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",name: "Jennifer Stewart", username: "@jenforste" },
{ img: "https://plus.unsplash.com/premium_vector-1719858612118-269cd46ea250?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",name: "Zula Chizmu", username: "@zulachi" },
];


return (
<div className="bg-blue-500 rounded-2xl p-4 mt-4 shadow">
<h3 className="font-bold text-blue-950 text-lg mb-3">Suggested for you</h3>
<div className="flex flex-col gap-3">
{data.map((user) => (
<div
key={user.username}
className="flex justify-between items-center hover:bg-blue-300 p-2 rounded-xl cursor-pointer"
>
<div className="flex items-center gap-2">
<img
src={user.img}
alt={user.name}
className="w-8 h-8 rounded-full"
/>
<div>
<p className="font-medium">{user.name}</p>
<p className="text-sm text-white">{user.username}</p>
</div>
</div>
<button className="bg-white text-blue-950 px-3 py-1 cursor-pointer rounded-full text-sm font-semibold">
Follow
</button>
</div>
))}
</div>
</div>
);
}
