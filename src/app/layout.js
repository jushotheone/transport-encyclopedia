import "@fontsource-variable/fredoka";
import "@/app/globals.css";
import LayoutWrapper from "@/components/LayoutWrapper";

export const metadata = {
  title: {
    default: "Zion Transport System: The Explorer's Encyclopedia",
    template: "%s | Zion Transport System",
  },
  icons: { apple: "/icons/apple-touch-icon.png" },
  appleWebApp: { capable: true, title: "ZTS Explorer", statusBarStyle: "black-translucent" },
  description:
    "Join Zion on missions across air, road, rail, water, space, pipelines, cables and future tech. Discover how the world moves!",
};

export const viewport = {
  themeColor: "#102A43",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en-GB">
      <body>
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}
