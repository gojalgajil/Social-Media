export function ProfileCard() {
return (
<div className="bg-blue-500 rounded-2xl p-4 shadow">
<div className="flex items-center gap-3">
<img
src="https://plus.unsplash.com/premium_vector-1719858610375-3b4f4cfa75a4?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
className="w-12 h-12 rounded-full object-cover"
/>
<div>
<h3 className="font-semibold text-lg">User Name</h3>
<p className="text-sm text-white">User bio or description</p>
</div>
</div>
</div>
);
}