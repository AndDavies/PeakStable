"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
// (Optional) ShadCN UI components
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

// Example icons (Lucide or otherwise)
import { BarChart2, UserCheck, Brain } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-secondary text-primary font-sans">
      
      {/* Hero Section */}
      <motion.header
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="w-full pt-28 relative"
      >
        <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
          <Image
            src="/images/peak_hero_2.jpg"
            alt="Abstract background"
            fill
            className="object-cover opacity-50"
            priority
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center space-y-10 md:space-y-0">
          {/* Left: Headline + CTA */}
          <div className="flex-1 space-y-6">
            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight bg-gradient-to-r from-accentGreen to-primary bg-clip-text text-transparent">
              Find Your Peak, <br />
              Inside and Out
            </h1>
            <p className="text-lg text-primary/80 max-w-3xl leading-relaxed">
              Peak Metrix blends data-driven training with mindful practices for a truly
              holistic approach to fitness. Whether you’re lifting heavy, taking ice baths, 
              or practicing breathwork, we help you track every aspect of your progress.
            </p>
            <div className="flex space-x-4 mt-6">
              <Link href="/signup">
                <Button className="bg-accentGreen hover:bg-accentGreen/90">
                  Start Your Journey
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" className="border-accentGreen text-accentGreen hover:bg-accentGreen hover:text-secondary">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>

          {/* Right: Hero Image */}
          <div className="flex-1 md:ml-12 relative">
            <Image
              src="/images/peak_hero_1.jpg"
              alt="Athlete training with barbell"
              width={600}
              height={450}
              className="rounded-xl shadow-lg"
            />
          </div>
        </div>
      </motion.header>

      {/* Features Section */}
      <motion.section
        id="features"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="w-full py-20 bg-secondary"
      >
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6 text-primary">Features</h2>
          <p className="text-primary/80 mb-12 max-w-2xl mx-auto leading-relaxed">
            Heavy lifting, ice baths, mindfulness, and more—organized in one holistic platform.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-secondary hover:shadow-md transition border border-primary/20">
              <CardHeader className="flex flex-col items-center">
                <BarChart2 size={48} className="text-accentGreen mb-2" />
                <CardTitle className="text-xl text-primary">Data-Driven Insights</CardTitle>
                <CardDescription className="text-primary/70">
                  Log your workouts, breathwork, and sauna sessions. Visualize improvements 
                  in both physical performance and mental well-being.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-secondary hover:shadow-md transition border border-primary/20">
              <CardHeader className="flex flex-col items-center">
                <UserCheck size={48} className="text-accentGreen mb-2" />
                <CardTitle className="text-xl text-primary">Community Challenges</CardTitle>
                <CardDescription className="text-primary/70">
                  Join group events, set team goals, and push each other to new heights—no matter your fitness level.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-secondary hover:shadow-md transition border border-primary/20">
              <CardHeader className="flex flex-col items-center">
                <Brain size={48} className="text-accentGreen mb-2" />
                <CardTitle className="text-xl text-primary">Mind-Body Balance</CardTitle>
                <CardDescription className="text-primary/70">
                  Blend intense workouts with meditation, ice baths, and breathwork for comprehensive recovery.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
