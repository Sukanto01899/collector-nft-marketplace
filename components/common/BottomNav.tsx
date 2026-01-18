"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Store, PencilLine, User } from "lucide-react";

const items = [
  { id: "market", label: "Marketplace", icon: Store, href: "/marketplace" },
  { id: "create", label: "Create NFT", icon: PencilLine, href: "/create-nft" },
  { id: "profile", label: "Profile", icon: User, href: "/profile" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-slate-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-2 text-xs">
        {items.map((item) => {
          const isActive =
            pathname === item.href || (item.id === "market" && pathname === "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex flex-1 flex-col items-center gap-1 rounded-2xl py-2 text-[11px] font-semibold uppercase tracking-wide transition ${
                isActive
                  ? "text-emerald-200"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
