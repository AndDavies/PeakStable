// components/footer.tsx
"use client";

export function Footer() {
  return (
    <footer className="w-full bg-primary p-4 mt-auto">
      <div className="max-w-7xl mx-auto text-secondary flex items-center justify-center">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} PeakMetrix. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
