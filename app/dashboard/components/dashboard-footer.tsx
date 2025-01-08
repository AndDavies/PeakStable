export default function DashboardFooter() {
    return (
      <footer className="border-t border-border bg-card text-card-foreground py-4 text-center text-sm">
        <p className="opacity-70">
          &copy; {new Date().getFullYear()} PeakMetrix. All rights reserved.
        </p>
      </footer>
    )
  }
  