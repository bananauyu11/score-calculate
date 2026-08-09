import Link from "next/link";

export default function AppNav({ current }: { current: "keiba" | "assets" }) {
  const linkClass = (key: "keiba" | "assets") =>
    `rounded-lg px-3 py-1.5 text-sm font-medium transition ${
      current === key
        ? "bg-white shadow-sm dark:bg-neutral-800"
        : "text-neutral-500"
    }`;

  return (
    <nav className="flex w-fit gap-1 rounded-xl bg-neutral-100 p-1 dark:bg-neutral-900">
      <Link href="/" className={linkClass("keiba")}>
        競馬収支
      </Link>
      <Link href="/assets" className={linkClass("assets")}>
        資産管理
      </Link>
    </nav>
  );
}
