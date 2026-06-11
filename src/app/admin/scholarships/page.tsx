export default function AdminScholarshipsPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Grantlar</h1>
        <button className="bg-teal-700 text-white px-4 py-2 rounded-lg hover:bg-teal-800 transition text-sm">
          + Yangi grant
        </button>
      </div>
      <div className="bg-white rounded-xl shadow-sm p-6">
        <p className="text-gray-500 text-sm">Hozircha grantlar yo'q. Yangi grant qo'shing.</p>
      </div>
    </div>
  );
}
