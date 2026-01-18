"use client";

export default function Toast({
  message,
  variant = "error",
}: {
  message: string;
  variant?: "error" | "success";
}) {
  const styles =
    variant === "success"
      ? "border-emerald-300/40 bg-emerald-500/20 text-emerald-100"
      : "border-rose-300/40 bg-rose-500/20 text-rose-100";

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[60] flex justify-center px-4">
      <div
        className={`max-w-sm rounded-2xl border px-4 py-3 text-xs font-semibold uppercase tracking-wide shadow-lg backdrop-blur ${styles}`}
      >
        {message}
      </div>
    </div>
  );
}
