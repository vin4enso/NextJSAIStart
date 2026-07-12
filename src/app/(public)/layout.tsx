import Link from "next/link";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="mx-auto flex h-16 max-w-5xl items-center px-4">
          <Link href="/" className="text-xl font-bold tracking-tight">
            Next.js Starter
          </Link>
        </div>
      </header>
      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-4 py-8">{children}</div>
      </main>
      <footer className="border-t">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-center px-4">
          <p className="text-muted-foreground text-sm">
            &copy; {new Date().getFullYear()} Next.js Starter. All rights
            reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
