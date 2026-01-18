const LoadingPage = ({
  message = "Loading...",
  iconSrc = "/icon.png",
}: {
  message?: string;
  iconSrc?: string;
}) => {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="flex flex-col items-center gap-4 text-slate-100">
        <div className="relative h-20 w-20">
          <div className="absolute inset-0 rounded-3xl border border-emerald-300/30 bg-emerald-400/10 shadow-[0_12px_30px_rgba(16,185,129,0.25)]" />
          <div className="absolute inset-1 animate-pulse rounded-2xl border border-emerald-300/30" />
          <img
            src={iconSrc}
            alt="Collector logo"
            className="relative h-20 w-20 rounded-2xl object-cover"
            loading="lazy"
          />
        </div>
        <p className="text-xs uppercase tracking-[0.4em] text-emerald-200/70">
          {message}
        </p>
        <div className="h-1.5 w-44 overflow-hidden rounded-full border border-white/10 bg-white/5">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-gradient-to-r from-emerald-300/60 via-cyan-300/60 to-emerald-300/60" />
        </div>
      </div>
    </div>
  );
};

export default LoadingPage;
