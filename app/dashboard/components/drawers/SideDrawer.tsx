"use client"

import React, { useEffect } from "react"
import clsx from "clsx"

interface SideDrawerProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
}

/**
 * A reusable side drawer component that slides in from the right.
 * We can reuse this for class registration, or any other side-drawer flows.
 */
export default function SideDrawer({ open, onClose, children }: SideDrawerProps) {
  // Lock body scroll when the drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
  }, [open])

  return (
    <div
      className={clsx(
        "fixed inset-0 z-50 flex transition-all",
        open ? "pointer-events-auto" : "pointer-events-none"
      )}
    >
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50"
          onClick={onClose}
        />
      )}

      {/* Drawer Pane */}
      <div
        className={clsx(
          "fixed right-0 top-0 h-full w-full max-w-md bg-background shadow-xl transform transition-transform duration-300",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        {children}
      </div>
    </div>
  )
}