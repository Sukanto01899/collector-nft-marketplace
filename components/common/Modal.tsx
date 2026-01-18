"use client";

import React, { type ReactNode, useEffect } from "react";

const Modal = ({
  children,
  variant = "center",
  onClose,
  closeOnBackdrop = false,
  containerClassName = "",
  contentClassName = "",
}: {
  children: ReactNode;
  variant?: "center" | "sheet";
  onClose?: () => void;
  closeOnBackdrop?: boolean;
  containerClassName?: string;
  contentClassName?: string;
}) => {
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex bg-black/70 backdrop-blur-sm p-4 ${containerClassName} ${
        variant === "sheet"
          ? "items-end justify-center"
          : "items-center justify-center"
      }`}
      onClick={closeOnBackdrop ? onClose : undefined}
    >
      <div
        className={contentClassName}
        onClick={closeOnBackdrop ? (event) => event.stopPropagation() : undefined}
      >
        {children}
      </div>
    </div>
  );
};

export default Modal;
