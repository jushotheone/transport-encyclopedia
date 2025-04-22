import './globals.css'

export const metadata = {
  title: "Zion's Transport Encyclopedia",
  description: 'Learn how the world moves — air, land, sea, and beyond!',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-100 text-gray-800 font-sans">
        {children}
      </body>
    </html>
  )
}