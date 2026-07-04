export default function ForbiddenPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-2">
      <h1 className="text-4xl font-bold">403</h1>
      <p className="text-muted-foreground">
        You do not have permission to access this page.
      </p>
    </div>
  );
}
