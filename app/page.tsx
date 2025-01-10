"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
// ShadCN UI components
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
// Lucide icons
import { BarChart2, UserCheck, Brain, Menu, X } from "lucide-react";
import { Accordion, AccordionItem } from "@/components/ui/Accordion";

export default function LandingPage() {
  // State to handle shrinking nav on scroll
  const [isScrolled, setIsScrolled] = useState(false);

  // State for mobile menu toggling
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 80) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Animations for the navbar
  const navVariants = {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
  };

  // Animations for the hero and other sections
  const sectionVariants = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      {/* Navbar */}
      <motion.nav
  variants={navVariants}
  initial="initial"
  animate="animate"
  transition={{ duration: 0.8, ease: "easeOut" }}
  // Dynamic classes for shrinking nav
  className={`sticky top-0 w-full z-50 backdrop-blur-sm border-b border-neutral-800 transition-all 
    ${isScrolled ? "bg-black/80 py-1" : "bg-black/90 py-2"}`}
>
  <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
    {/* Logo */}
    <Link href="/">
      <Image
        src="/images/Ascent_Logo_trans.png"
        alt="peakMetrix Logo"
        width={150}
        height={150}
        priority
        className="cursor-pointer"
      />
    </Link>

    {/* Desktop Navigation */}
    <div className="hidden md:flex items-center space-x-4">
      <Link href="/signup">
        <Button
          variant="outline"
          className="border-pink-500 text-pink-500 hover:bg-pink-500 hover:text-white py-2 px-4"
        >
          Get Started
        </Button>
      </Link>
      <Link href="/login">
        <Button className="bg-pink-500 hover:bg-pink-600 py-2 px-4">
          Sign In
        </Button>
      </Link>
    </div>

    {/* Mobile Menu Toggle */}
    <button
      className="md:hidden text-pink-500 hover:text-pink-300 transition-colors"
      onClick={() => setIsMobileNavOpen((prev) => !prev)}
      aria-label="Toggle mobile menu"
    >
      {isMobileNavOpen ? <X size={32} /> : <Menu size={32} />}
    </button>
  </div>

  {/* Mobile Nav Links */}
  {isMobileNavOpen && (
    <div className="md:hidden bg-black/90 border-t border-neutral-800 px-6 pb-4">
      <div className="flex flex-col space-y-3 mt-3">
        <Link href="/signup" onClick={() => setIsMobileNavOpen(false)}>
          <Button
            variant="outline"
            className="w-full border-pink-500 text-pink-500 hover:bg-pink-500 hover:text-white py-2"
          >
            Get Started
          </Button>
        </Link>
        <Link href="/login" onClick={() => setIsMobileNavOpen(false)}>
          <Button className="bg-pink-500 w-full hover:bg-pink-600 py-2">
            Sign In
          </Button>
        </Link>
      </div>
    </div>
  )}
</motion.nav>

      {/* Hero Section */}
      <motion.header
        variants={sectionVariants}
        initial="initial"
        animate="animate"
        transition={{ duration: 1, ease: "easeOut" }}
        className="w-full relative pt-16 md:pt-28"
      >
        {/* Background Image */}
        <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
          <Image
            src="/images/hero_abstract_bg.png"
            alt="Abstract geometric background shape"
            fill
            className="object-cover opacity-60"
            priority
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center md:space-x-12">
          {/* Left: Headline + CTA */}
          <div className="flex-1 space-y-6 py-10">
            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight bg-gradient-to-r from-gray-200 via-gray-300 to-gray-400 bg-clip-text text-transparent">
              Train Smarter,
              <br />
              Perform Better.
            </h1>
            <p className="text-lg text-gray-300 max-w-3xl leading-relaxed">
              Peak Metrix blends data-driven training with mindful practices for a truly holistic approach
              to fitness. Whether you’re lifting heavy, taking ice baths, or practicing breathwork, we help
              you track every aspect of your progress.
            </p>
            <div className="flex space-x-4 mt-6">
              <Link href="/signup">
                <Button className="bg-pink-500 hover:bg-pink-600 py-3 px-6">
                Start Your Holistic Training Journey Today
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  variant="outline"
                  className="border-pink-500 text-pink-500 hover:bg-pink-500 hover:text-white py-3 px-6"
                >
                  Sign In
                </Button>
              </Link>
            </div>
          </div>

          {/* Right: Hero Image */}
          <div className="flex-1 mt-10 md:mt-0">
            <Image
              src="/images/peak_hero_2.jpg"
              alt="Athlete training with barbell"
              width={600}
              height={450}
              className="rounded-xl shadow-lg object-cover"
            />
          </div>
        </div>
      </motion.header>

      {/* Features Section */}
      <motion.section
        id="features"
        variants={sectionVariants}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="w-full py-20 bg-black"
      >
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Features</h2>
          <p className="text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
            Heavy lifting, ice baths, mindfulness, and more—organized in one holistic platform.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-neutral-900 hover:shadow-md transition border border-neutral-700">
              <CardHeader className="flex flex-col items-center p-6">
                <BarChart2 size={48} className="text-pink-500 mb-4" />
                <CardTitle className="text-xl text-white">Data-Driven Insights</CardTitle>
                <CardDescription className="text-gray-400 mt-2">
                  Log your workouts, breathwork, and sauna sessions. Visualize improvements in both physical
                  performance and mental well-being.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-neutral-900 hover:shadow-md transition border border-neutral-700">
              <CardHeader className="flex flex-col items-center p-6">
                <UserCheck size={48} className="text-pink-500 mb-4" />
                <CardTitle className="text-xl text-white">Community Challenges</CardTitle>
                <CardDescription className="text-gray-400 mt-2">
                  Join group events, set team goals, and push each other to new heights—no matter your
                  fitness level.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-neutral-900 hover:shadow-md transition border border-neutral-700">
              <CardHeader className="flex flex-col items-center p-6">
                <Brain size={48} className="text-pink-500 mb-4" />
                <CardTitle className="text-xl text-white">Mind-Body Balance</CardTitle>
                <CardDescription className="text-gray-400 mt-2">
                  Blend intense workouts with meditation, ice baths, and breathwork for comprehensive
                  recovery.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </motion.section>

      {/* FAQ Section */}
      <motion.section
        id="faq"
        variants={sectionVariants}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="w-full py-20 bg-neutral-900"
      >
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">
            Frequently Asked Questions
          </h2>
          <Accordion>
            <AccordionItem title="What makes Peak Metrix different from other fitness apps?">
              Peak Metrix uniquely combines CrossFit, HYROX, and HIIT training with mindfulness practices like
              breathwork, meditation, and recovery protocols. Our platform offers holistic, data-driven
              training plans that foster not only physical performance but mental resilience, creating a
              balanced approach to fitness.
            </AccordionItem>
            <AccordionItem title="Can beginners use Peak Metrix?">
              Absolutely! Whether you're new to fitness or a seasoned athlete, Peak Metrix adapts to your
              level. Our programs provide scalable options, guided plans, and community support to help you
              grow at your own pace.
            </AccordionItem>
            <AccordionItem title="How does Peak Metrix integrate mindfulness into training?">
              We emphasize balance and recovery by integrating practices like meditation, guided breathwork,
              and recovery tools such as ice baths and saunas. These are paired with physical training to
              enhance overall well-being and performance.
            </AccordionItem>
            <AccordionItem title="What kind of training plans does Peak Metrix offer?">
              We specialize in customizable training plans for CrossFit, HYROX, and HIIT, alongside pre-built
              programs. These plans seamlessly combine strength training, endurance work, and recovery
              practices to ensure you achieve your goals holistically.
            </AccordionItem>
            <AccordionItem title="What community features does Peak Metrix offer?">
              Peak Metrix connects you with like-minded individuals worldwide through group challenges,
              leaderboards, and social sharing. Share your wins, track your progress, and motivate others in a
              supportive and inclusive environment.
            </AccordionItem>
            <AccordionItem title="Is Peak Metrix suitable for gyms and coaches?">
              Yes! Peak Metrix provides tools for gym owners and coaches to manage class schedules, distribute
              training programs, and track member performance holistically, fostering stronger gym
              communities.
            </AccordionItem>
          </Accordion>
        </div>
      </motion.section>
    </div>
  );
}
