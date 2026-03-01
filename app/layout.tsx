import "./style.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SarkariSaathi | Laxmi AI",
  description: "AI Government Schemes Assistant",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      {/* Add suppressHydrationWarning here */}
      <body className="bg-grid" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}