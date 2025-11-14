import Link from "next/link";

export default function Nav() {
  return (
    <header className="bg-white border-b">
      <nav className="max-w-3xl mx-auto p-4 flex gap-4">
        <Link className="font-bold" href="/">
          Home
        </Link>
        <Link href="/users">Users</Link>
        <Link href="/orders">Orders</Link>
      </nav>
    </header>
  );
}
