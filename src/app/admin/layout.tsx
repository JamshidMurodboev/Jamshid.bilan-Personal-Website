import Link from 'next/link';

const navItems = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/scholarships', label: 'Grantlar' },
  { href: '/admin/universities', label: 'Universitetlar' },
  { href: '/admin/results', label: 'Natijalar' },
  { href: '/admin/news', label: 'Yangiliklar' },
  { href: '/admin/blog', label: 'Blog' },
  { href: '/admin/inquiries', label: 'Murojaatlar' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-56 bg-white shadow-sm flex-shrink-0">
        <div className="p-4 border-b">
          <h2 className="font-bold text-gray-800">Admin Panel</h2>
        </div>
        <nav className="p-2">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}
              className="block px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100 hover:text-teal-700 transition">
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
