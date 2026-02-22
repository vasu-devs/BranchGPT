"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";

export function HeroAnimation() {
    const [step, setStep] = useState(0);

    // Sequence the animation steps
    useEffect(() => {
        const sequence = async () => {
            // Wait for initial load
            await new Promise((r) => setTimeout(r, 600));
            setStep(1); // Linear start

            await new Promise((r) => setTimeout(r, 1200));
            setStep(2); // Branching happens

            await new Promise((r) => setTimeout(r, 1500));
            setStep(3); // Further expansion
        };
        sequence();
    }, []);

    const pathVariants: Variants = {
        hidden: { pathLength: 0, opacity: 0 },
        visible: {
            pathLength: 1,
            opacity: 1,
            transition: { duration: 1.5, ease: "easeInOut" }
        }
    };

    const nodeVariants: Variants = {
        hidden: { scale: 0, opacity: 0 },
        visible: {
            scale: 1,
            opacity: 1,
            transition: { type: "spring", stiffness: 300, damping: 20 }
        }
    };

    return (
        <div className="relative w-full max-w-2xl mx-auto h-[350px] flex items-end justify-center pointer-events-none pb-12">
            {/* Background Glow */}
            <div className="absolute bottom-0 w-64 h-32 bg-primary/10 dark:bg-primary/20 blur-[50px] rounded-full" />

            <svg
                width="100%"
                height="100%"
                viewBox="0 0 600 400"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="overflow-visible"
            >
                {/* 1. The Seed / Base */}
                <motion.circle
                    cx="300"
                    cy="350"
                    r="5"
                    fill="currentColor"
                    className="text-foreground/80 dark:text-foreground/60"
                    variants={nodeVariants}
                    initial="hidden"
                    animate={step >= 1 ? "visible" : "hidden"}
                />

                {/* --- Text Label: "A single seed..." --- */}
                <AnimatePresence>
                    {step === 1 && (
                        <motion.text
                            x="300"
                            y="380"
                            textAnchor="middle"
                            className="fill-muted-foreground font-sans text-xs font-medium uppercase tracking-widest"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            Linear Thinking
                        </motion.text>
                    )}
                </AnimatePresence>

                {/* 1. Trunk growing upwards */}
                <motion.path
                    d="M 300,350 C 300,280 290,240 300,200"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                    className="text-foreground/70 dark:text-foreground/50"
                    variants={pathVariants}
                    initial="hidden"
                    animate={step >= 1 ? "visible" : "hidden"}
                />

                <motion.circle
                    cx="300"
                    cy="200"
                    r="4"
                    fill="currentColor"
                    className="text-primary"
                    variants={nodeVariants}
                    initial="hidden"
                    animate={step >= 1 ? "visible" : "hidden"}
                />


                {/* 2. The Branching - Divergent possibilities */}

                {/* Left Branch */}
                <motion.path
                    d="M 300,200 C 280,150 200,120 150,130"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    className="text-amber-600/70 dark:text-amber-500/70"
                    variants={pathVariants}
                    initial="hidden"
                    animate={step >= 2 ? "visible" : "hidden"}
                />
                {/* Leaf Left */}
                <motion.path
                    d="M 150,130 C 145,120 135,125 150,130"
                    fill="currentColor"
                    className="text-amber-600 dark:text-amber-500"
                    variants={nodeVariants}
                    initial="hidden"
                    animate={step >= 2 ? "visible" : "hidden"}
                />

                {/* Middle Branch (Main) */}
                <motion.path
                    d="M 300,200 C 310,140 300,100 300,70"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    className="text-primary/80"
                    variants={pathVariants}
                    initial="hidden"
                    animate={step >= 2 ? "visible" : "hidden"}
                />
                <motion.circle
                    cx="300"
                    cy="70"
                    r="4"
                    fill="currentColor"
                    className="text-primary"
                    variants={nodeVariants}
                    initial="hidden"
                    animate={step >= 2 ? "visible" : "hidden"}
                />

                {/* Right Branch */}
                <motion.path
                    d="M 300,200 C 320,160 400,140 450,110"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    className="text-primary/60"
                    variants={pathVariants}
                    initial="hidden"
                    animate={step >= 2 ? "visible" : "hidden"}
                />

                {/* --- Text Label: "Branched Reality" --- */}
                <AnimatePresence>
                    {step >= 2 && (
                        <motion.text
                            x="450"
                            y="90"
                            textAnchor="middle"
                            className="fill-foreground font-sans text-xs font-bold uppercase tracking-widest"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            Alternate Path
                        </motion.text>
                    )}
                </AnimatePresence>

                {/* 3. Further Expansion on Right Branch */}
                <motion.path
                    d="M 450,110 C 470,90 500,80 520,70"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    className="text-primary/40"
                    variants={pathVariants}
                    initial="hidden"
                    animate={step >= 3 ? "visible" : "hidden"}
                />
                {/* Leaf Right Top */}
                <motion.path
                    d="M 520,70 C 525,60 535,65 520,70"
                    fill="currentColor"
                    className="text-primary/60"
                    variants={nodeVariants}
                    initial="hidden"
                    animate={step >= 3 ? "visible" : "hidden"}
                />

                <motion.path
                    d="M 450,110 C 480,130 500,140 520,160"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    className="text-primary/40"
                    variants={pathVariants}
                    initial="hidden"
                    animate={step >= 3 ? "visible" : "hidden"}
                />
                {/* Leaf Right Bottom */}
                <motion.path
                    d="M 520,160 C 525,165 535,160 520,160"
                    fill="currentColor"
                    className="text-primary/60"
                    variants={nodeVariants}
                    initial="hidden"
                    animate={step >= 3 ? "visible" : "hidden"}
                />
            </svg>
        </div>
    );
}
