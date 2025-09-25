// app/layout.js
import "@/app/globals.css";
import LayoutWrapper from "@/components/LayoutWrapper";

export const metadata = {
  title: "Zion Transport Encyclopedia",
  description: "Explore how the world moves!",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}