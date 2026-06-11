export default function AdminNewsPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Yangiliklar</h1>
        <button className="bg-teal-700 text-white px-4 py-2 rounded-lg hover:bg-teal-800 transition text-sm">
          + Yangi post
        </button>
      </div>
      <div className="bg-white rounded-xl shadow-sm p-6">
        <p className="text-gray-500 text-sm">Hozircha yangiliklar yo'q.</p>
      </div>
    </div>
  );
}
