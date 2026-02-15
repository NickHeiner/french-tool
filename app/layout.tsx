import type { Metadata } from "next";
import Link from "next/link";
import { Fraunces, Manrope } from "next/font/google";
import "@/app/globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "French Vocabulary",
  description: "Quizlet-backed French vocabulary practice app",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} ${fraunces.variable}`}>
        <div className="app-shell">
          <header className="topbar">
            <Link href="/" className="brand">
              French Vocab
            </Link>
            <nav className="topbar-nav">
              <Link href="/" className="button-link secondary">
                Words
              </Link>
              <Link href="/practice" className="button-link secondary">
                Practice
              </Link>
              <form action="/api/auth/logout" method="post">
                <button type="submit" className="secondary">
                  Log out
                </button>
              </form>
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
