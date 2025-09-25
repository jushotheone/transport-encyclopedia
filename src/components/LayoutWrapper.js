// components/LayoutWrapper.js
import Link from "next/link";

export default function LayoutWrapper({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-purple-600 text-white p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">🛸 Zion Transport Encyclopedia</h1>
          <nav className="space-x-4">
            <Link href="/" className="hover:underline">Home</Link>
            <Link href="/systems/air" className="hover:underline">Explore</Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 bg-gray-50">{children}</main>

      <footer className="bg-purple-900 text-white p-4 text-center text-sm">
        Built by Zion | Explore the world of transport!
      </footer>
    </div>
  );
}