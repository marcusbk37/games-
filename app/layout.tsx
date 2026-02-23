import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "Logic Games",
  description: "A playground for small logic and puzzle games."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-50">
        <div className="content-wrap mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-4 pt-8">
          <header className="flex flex-col gap-2 border-b border-slate-800 pb-4">
            <h1 className="text-2xl font-semibold tracking-tight">Logic Games</h1>
            <p className="text-sm text-slate-300">
              A small collection of logic and puzzle games. Built to be extended.
            </p>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="border-t border-slate-800 pt-4 text-xs text-slate-500">
            Built for experimentation — add your own games under <code>games/</code>.
          </footer>
        </div>
      </body>
    </html>
  );
}

