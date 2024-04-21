import type { Metadata } from "next";
import { Lato } from "next/font/google";
import "./globals.css";

const latoFont = Lato({
  subsets: ["latin"],
  weight: ["100", "300", "400", "700", "900"],
  fallback: ["Roboto", "sans-serif"],
  variable: '--font-Lato',
});

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={latoFont.className}>
        <div>
          {children}
        </div>
      </body>
    </html>
  );
}
