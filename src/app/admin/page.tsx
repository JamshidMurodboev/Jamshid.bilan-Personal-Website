const SUMMARY = [
  { label: 'Grantlar', value: 0 },
  { label: 'Universitetlar', value: 0 },
  { label: 'Yangiliklar', value: 0 },
  { label: 'Blog postlar', value: 0 },
  { label: 'Talaba natijalari', value: 0 },
  { label: "O'qilmagan murojaatlar", value: 0 },
];

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {SUMMARY.map((item) => (
          <div key={item.label} className="bg-white rounded-xl p-5 shadow-sm">
            <div className="text-3xl font-bold text-teal-700">{item.value}</div>
            <div className="text-sm text-gray-500 mt-1">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
