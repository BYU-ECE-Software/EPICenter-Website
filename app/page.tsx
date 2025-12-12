export default function Home() {
  return (
    <main className="min-h-[calc(100vh-8rem)] bg-gradient-to-br from-byu-royal/5 via-white to-byu-navy/5 flex items-center justify-center px-4 py-12">
      <div className="w-full text-center">
        {/* Little badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-byu-navy text-white text-xs tracking-wide uppercase mb-4">
          <span className="h-2 w-2 rounded-full bg-amber-300 animate-pulse" />
          Under construction
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-byu-navy tracking-tight">
          Welcome to the <span className="text-byu-royal">EPICenter</span> ⚡
        </h1>

        <p className="mt-4 text-sm sm:text-base text-gray-700 max-w-2xl mx-auto">
          This will be the home for ECE shop orders, inventory, and other
          engineering goodies. For now, it&apos;s basically a very fancy
          &quot;Coming Soon&quot; page while we plug in all the wires.
        </p>

        {/* Silly status line */}
        <div className="mt-6 text-xs sm:text-sm text-gray-600">
          <p>Current status: ⚙️ calibrating flux capacitors…</p>
          <p className="mt-1 italic">
            If you&apos;re seeing this, the engineers are still tinkering.
          </p>
        </div>
      </div>
    </main>
  );
}
