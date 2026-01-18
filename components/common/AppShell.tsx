"use client";

import { useEffect } from "react";
import { useFrame } from "@/components/providers/farcaster-provider";
import { SafeAreaContainer } from "@/components/providers/safe-area-container";
import LoadingPage from "@/components/common/LoadingPage";
import FixedHeader from "@/components/common/FixedHeader";
import BottomNav from "@/components/common/BottomNav";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { context, isLoading, isSDKLoaded, actions } = useFrame();

  useEffect(() => {
    if (actions) {
      actions.addMiniApp();
    }
  }, [actions]);

  if (isLoading) {
    return (
      <SafeAreaContainer insets={context?.client.safeAreaInsets}>
        <LoadingPage />
      </SafeAreaContainer>
    );
  }

  if (!isSDKLoaded) {
    return (
      <SafeAreaContainer insets={context?.client.safeAreaInsets}>
        <div className="flex min-h-screen flex-col items-center justify-center p-4 space-y-8">
          <h1 className="text-3xl font-bold text-center">
            No farcaster SDK found, please use this miniapp in the farcaster app
          </h1>
        </div>
      </SafeAreaContainer>
    );
  }

  return (
    <SafeAreaContainer insets={context?.client.safeAreaInsets}>
      <FixedHeader />
      {children}
      <BottomNav />
    </SafeAreaContainer>
  );
}
