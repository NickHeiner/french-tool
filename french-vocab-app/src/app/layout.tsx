import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "French Vocab",
  description: "French vocabulary learning app with LLM-powered exercises",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-2xl px-4 pb-20">{children}</div>
      </body>
    </html>
  );
}
