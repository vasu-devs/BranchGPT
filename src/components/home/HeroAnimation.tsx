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
        <div className="relative w-full max-w-2xl mx-auto h-[300px] flex items-center justify-center pointer-events-none">
            {/* Background Glow */}
            <div className="absolute inset-0 bg-primary/5 dark:bg-primary/10 blur-3xl rounded-full" />

            <svg
                width="100%"
                height="100%"
                viewBox="0 0 600 300"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="overflow-visible"
            >
                {/* 1. Linear Start - The initial thought */}
                <motion.path
                    d="M 50,150 L 250,150"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    className="text-muted-foreground/40"
                    variants={pathVariants}
                    initial="hidden"
                    animate={step >= 1 ? "visible" : "hidden"}
                />

                <motion.circle
                    cx="50"
                    cy="150"
                    r="6"
                    fill="currentColor"
                    className="text-foreground"
                    variants={nodeVariants}
                    initial="hidden"
                    animate={step >= 1 ? "visible" : "hidden"}
                />

                <motion.circle
                    cx="250"
                    cy="150"
                    r="8"
                    fill="currentColor"
                    className="text-primary"
                    variants={nodeVariants}
                    initial="hidden"
                    animate={step >= 1 ? "visible" : "hidden"}
                />

                {/* --- Text Label: "A single thought..." --- */}
                <AnimatePresence>
                    {step === 1 && (
                        <motion.text
                            x="150"
                            y="135"
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

                {/* 2. The Branching - Divergent possibilities */}

                {/* Top Branch */}
                <motion.path
                    d="M 250,150 C 350,150 350,70 450,70"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    className="text-primary/70"
                    variants={pathVariants}
                    initial="hidden"
                    animate={step >= 2 ? "visible" : "hidden"}
                />
                <motion.circle
                    cx="450"
                    cy="70"
                    r="6"
                    fill="currentColor"
                    className="text-primary"
                    variants={nodeVariants}
                    initial="hidden"
                    animate={step >= 2 ? "visible" : "hidden"}
                />

                {/* Middle (continued) Branch */}
                <motion.path
                    d="M 250,150 L 500,150"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeDasharray="4 4"
                    className="text-muted-foreground/30"
                    variants={pathVariants}
                    initial="hidden"
                    animate={step >= 2 ? "visible" : "hidden"}
                />
                <motion.circle
                    cx="500"
                    cy="150"
                    r="5"
                    fill="currentColor"
                    className="text-muted-foreground/50"
                    variants={nodeVariants}
                    initial="hidden"
                    animate={step >= 2 ? "visible" : "hidden"}
                />

                {/* Bottom Branch */}
                <motion.path
                    d="M 250,150 C 350,150 350,230 450,230"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    className="text-amber-500/70"
                    variants={pathVariants}
                    initial="hidden"
                    animate={step >= 2 ? "visible" : "hidden"}
                />
                <motion.circle
                    cx="450"
                    cy="230"
                    r="6"
                    fill="currentColor"
                    className="text-amber-500"
                    variants={nodeVariants}
                    initial="hidden"
                    animate={step >= 2 ? "visible" : "hidden"}
                />

                {/* --- Text Label: "Branched Reality" --- */}
                <AnimatePresence>
                    {step >= 2 && (
                        <motion.text
                            x="450"
                            y="45"
                            textAnchor="middle"
                            className="fill-foreground font-sans text-xs font-bold uppercase tracking-widest"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            Alternate Path
                        </motion.text>
                    )}
                </AnimatePresence>

                {/* 3. Further Expansion on Top Branch */}
                <motion.path
                    d="M 450,70 L 550,40"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    className="text-primary/40"
                    variants={pathVariants}
                    initial="hidden"
                    animate={step >= 3 ? "visible" : "hidden"}
                />
                <motion.circle
                    cx="550"
                    cy="40"
                    r="4"
                    fill="currentColor"
                    className="text-primary/60"
                    variants={nodeVariants}
                    initial="hidden"
                    animate={step >= 3 ? "visible" : "hidden"}
                />

                <motion.path
                    d="M 450,70 L 550,100"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    className="text-primary/40"
                    variants={pathVariants}
                    initial="hidden"
                    animate={step >= 3 ? "visible" : "hidden"}
                />
                <motion.circle
                    cx="550"
                    cy="100"
                    r="4"
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
