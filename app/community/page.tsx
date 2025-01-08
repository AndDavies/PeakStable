// app/community/page.tsx
"use client";

export default function CommunityPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h2 className="mt-8 text-3xl font-bold text-primary">
        Together, We Rise
      </h2>
      <p className="mt-2 text-primary/80">
        Welcome to the Peak Metrix Community—where we celebrate every step
        toward healthier bodies and calmer minds. Join group challenges,
        share your personal victories, and help uplift others along the way.
      </p>

      <div className="mt-6 space-y-4">
        {/* Example challenges or user feed */}
        <div className="rounded-md bg-primary/5 p-4">
          <h3 className="font-semibold text-primary">7-Day Breathwork Streak</h3>
          <p className="text-primary/70">
            Challenge yourself to 7 consecutive days of mindful breathing. Track
            your progress and feel the difference in mental clarity and recovery.
          </p>
        </div>

        <div className="rounded-md bg-primary/5 p-4">
          <h3 className="font-semibold text-primary">Ice Bath Endurance</h3>
          <p className="text-primary/70">
            Conquer the cold together! Log your cold plunge durations and see
            who can reach new extremes—mindfully, of course.
          </p>
        </div>
      </div>
    </div>
  );
}
