import "./globals.css";

export const metadata = {
  title: "Rakshak",
  description: "AI-Powered Cybersecurity",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-black text-green-400 font-mono">
        <header className="p-4 border-b border-green-700">
          <h1 className="text-2xl">Rakshak</h1>
        </header>
        <main className="p-4">
          {children}
        </main>
        <footer className="p-4 mt-8 border-t border-green-700 text-center text-sm">
          <p>&copy; 2026 Rakshak. All rights reserved.</p>
        </footer>
      </body>
    </html>
  );
}
