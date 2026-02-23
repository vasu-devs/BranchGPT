"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";

export function HeroAnimation() {
    const [step, setStep] = useState(0);

    const [spores, setSpores] = useState<Record<string, number>[]>([]);

    // Sequence the animation steps
    useEffect(() => {
        const timeout = setTimeout(() => {
            setSpores([...Array(8)].map(() => ({
                cx: 100 + Math.random() * 400,
                cy: 300 + Math.random() * 100,
                r: Math.random() * 2 + 1,
                yTarget: -200 - Math.random() * 100,
                xTarget: (Math.random() - 0.5) * 50,
                duration: 8 + Math.random() * 5,
                delay: Math.random() * 5,
            })));
        }, 0);

        const sequence = async () => {
            // 0 -> 1: The seed drops & roots spread
            await new Promise((r) => setTimeout(r, 800));
            setStep(1);

            // 1 -> 2: The thick main trunk grows upwards
            await new Promise((r) => setTimeout(r, 1200));
            setStep(2);

            // 2 -> 3: Secondary branches fan out
            await new Promise((r) => setTimeout(r, 1200));
            setStep(3);

            // 3 -> 4: Leaves bloom & glowing fruit (ideas) pop up
            await new Promise((r) => setTimeout(r, 1200));
            setStep(4);
        };
        sequence();
    }, []);

    const pathVariants: Variants = {
        hidden: { pathLength: 0, opacity: 0 },
        visible: {
            pathLength: 1,
            opacity: 1,
            transition: { duration: 2, ease: [0.4, 0, 0.2, 1] }
        }
    };

    const rootVariants: Variants = {
        hidden: { pathLength: 0, opacity: 0 },
        visible: {
            pathLength: 1,
            opacity: 0.6,
            transition: { duration: 1.5, ease: "easeOut" }
        }
    };

    const dropIn: Variants = {
        hidden: { y: -50, opacity: 0, scale: 0 },
        visible: {
            y: 0, opacity: 1, scale: 1,
            transition: { type: "spring", stiffness: 400, damping: 20 }
        }
    };

    const popup: Variants = {
        hidden: { scale: 0, opacity: 0, rotate: -20 },
        visible: {
            scale: 1,
            opacity: 1,
            rotate: 0,
            transition: { type: "spring", stiffness: 250, damping: 15 }
        }
    };

    const glowPulse = {
        visible: {
            boxShadow: ["0px 0px 0px 0px rgba(16, 185, 129, 0)", "0px 0px 20px 5px rgba(16, 185, 129, 0.4)", "0px 0px 0px 0px rgba(16, 185, 129, 0)"],
            transition: { repeat: Infinity, duration: 2 }
        }
    };

    return (
        <div className="relative w-full max-w-2xl mx-auto h-[380px] flex items-end justify-center pointer-events-none pb-12 mt-4">
            {/* Ambient Background Glow */}
            <div className="absolute bottom-10 w-96 h-40 bg-primary/5  blur-[80px] rounded-[100%]" />

            <svg
                width="100%"
                height="100%"
                viewBox="0 0 600 400"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="overflow-visible"
            >
                {/* --- AMBIENT SPORES --- */}
                <g className="opacity-40">
                    {spores.map((spore, i) => (
                        <motion.circle
                            key={i}
                            cx={spore.cx}
                            cy={spore.cy}
                            r={spore.r}
                            className="fill-amber-300 "
                            initial={{ y: 0, opacity: 0 }}
                            animate={{
                                y: spore.yTarget,
                                opacity: [0, 0.8, 0],
                                x: spore.xTarget
                            }}
                            transition={{
                                duration: spore.duration,
                                repeat: Infinity,
                                ease: "linear",
                                delay: spore.delay
                            }}
                        />
                    ))}
                </g>

                {/* --- SOIL / GROUND LINE --- */}
                <motion.path
                    d="M 150 350 C 250 345, 350 345, 450 350"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    className="text-border "
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                />

                {/* --- 1. SEED & ROOTS --- */}
                {/* Left Root */}
                <motion.path
                    d="M 300 350 C 280 370, 240 375, 220 380"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    className="text-amber-800/40 "
                    variants={rootVariants}
                    initial="hidden"
                    animate={step >= 1 ? "visible" : "hidden"}
                />
                {/* Right Root */}
                <motion.path
                    d="M 300 350 C 325 365, 360 380, 390 370"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    className="text-amber-800/40 "
                    variants={rootVariants}
                    initial="hidden"
                    animate={step >= 1 ? "visible" : "hidden"}
                />

                {/* The Seed */}
                <motion.circle
                    cx="300"
                    cy="350"
                    r="6"
                    fill="currentColor"
                    className="text-amber-600 "
                    variants={dropIn}
                    initial="hidden"
                    animate={step >= 1 ? "visible" : "hidden"}
                />

                <AnimatePresence>
                    {step === 1 && (
                        <motion.text
                            x="300"
                            y="330"
                            textAnchor="middle"
                            className="fill-amber-600/80  font-sans text-xs font-bold uppercase tracking-[0.2em]"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            A Single Thought
                        </motion.text>
                    )}
                </AnimatePresence>

                {/* --- 2. THE MAIN TRUNK --- */}
                {/* Base Trunk - Super thick */}
                <motion.path
                    d="M 300 350 C 315 280, 280 230, 300 160"
                    stroke="currentColor"
                    strokeWidth="14"
                    strokeLinecap="round"
                    className="text-stone-800 "
                    variants={pathVariants}
                    initial="hidden"
                    animate={step >= 2 ? "visible" : "hidden"}
                />
                {/* Inner Trunk Texture - Lighter overlay */}
                <motion.path
                    d="M 300 350 C 315 280, 280 230, 300 160"
                    stroke="currentColor"
                    strokeWidth="6"
                    strokeLinecap="round"
                    className="text-stone-600 "
                    variants={pathVariants}
                    initial="hidden"
                    animate={step >= 2 ? "visible" : "hidden"}
                />

                {/* First Split - Left Branch */}
                <motion.path
                    d="M 300 220 C 260 180, 200 160, 140 160"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeLinecap="round"
                    className="text-stone-700 "
                    variants={pathVariants}
                    initial="hidden"
                    animate={step >= 2 ? "visible" : "hidden"}
                />

                {/* First Split - Right Branch */}
                <motion.path
                    d="M 298 180 C 340 140, 400 130, 460 110"
                    stroke="currentColor"
                    strokeWidth="10"
                    strokeLinecap="round"
                    className="text-stone-800 "
                    variants={pathVariants}
                    initial="hidden"
                    animate={step >= 2 ? "visible" : "hidden"}
                />

                <AnimatePresence>
                    {step === 2 && (
                        <motion.text
                            x="460"
                            y="90"
                            textAnchor="middle"
                            className="fill-muted-foreground font-sans text-xs font-bold uppercase tracking-widest"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            Branching Logic
                        </motion.text>
                    )}
                </AnimatePresence>


                {/* --- 3. SECONDARY BRANCHES --- */}
                {/* Left Sub-branch */}
                <motion.path
                    d="M 180 165 C 160 130, 110 110, 80 120"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                    className="text-stone-600 "
                    variants={pathVariants}
                    initial="hidden"
                    animate={step >= 3 ? "visible" : "hidden"}
                />
                {/* Mid-Top Sub-branch */}
                <motion.path
                    d="M 300 160 C 305 110, 270 70, 250 40"
                    stroke="currentColor"
                    strokeWidth="6"
                    strokeLinecap="round"
                    className="text-stone-700 "
                    variants={pathVariants}
                    initial="hidden"
                    animate={step >= 3 ? "visible" : "hidden"}
                />
                {/* Mid-Right Sub-branch */}
                <motion.path
                    d="M 370 145 C 380 100, 420 80, 450 60"
                    stroke="currentColor"
                    strokeWidth="5"
                    strokeLinecap="round"
                    className="text-stone-600 "
                    variants={pathVariants}
                    initial="hidden"
                    animate={step >= 3 ? "visible" : "hidden"}
                />
                {/* Far Right Lower Branch */}
                <motion.path
                    d="M 420 125 C 460 160, 500 160, 530 140"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                    className="text-stone-600 "
                    variants={pathVariants}
                    initial="hidden"
                    animate={step >= 3 ? "visible" : "hidden"}
                />

                {/* --- MERGING BRANCH --- */}
                {/* A branch that curves out from the left and merges back into the center top branch */}
                <motion.path
                    d="M 140 160 C 150 110, 200 90, 250 40"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray="4 4"
                    className="text-amber-500/60 "
                    variants={pathVariants}
                    initial="hidden"
                    animate={step >= 3 ? "visible" : "hidden"}
                />

                {/* --- 4. LEAVES & FRUITS --- */}
                {/* Function to render beautiful curved leaf shapes */}
                {step >= 4 && (
                    <>
                        {/* Leaf Cluster Left Far */}
                        <motion.path d="M 80 120 Q 90 90, 60 85 Q 50 110, 80 120 Z" fill="currentColor" className="text-primary/70 " variants={popup} initial="hidden" animate="visible" />
                        <motion.path d="M 80 120 Q 50 130, 65 150 Q 90 140, 80 120 Z" fill="currentColor" className="text-primary/90 " variants={popup} initial="hidden" animate="visible" />

                        {/* Leaf Cluster Left Mid */}
                        <motion.path d="M 140 160 Q 130 130, 100 125 Q 100 155, 140 160 Z" fill="currentColor" className="text-secondary " variants={popup} initial="hidden" animate="visible" />
                        <motion.path d="M 140 160 Q 160 120, 145 100 Q 120 130, 140 160 Z" fill="currentColor" className="text-primary/80 " variants={popup} initial="hidden" animate="visible" />

                        {/* Leaf Cluster Top High */}
                        <motion.path d="M 250 40 Q 220 30, 210 50 Q 230 70, 250 40 Z" fill="currentColor" className="text-secondary " variants={popup} initial="hidden" animate="visible" />
                        <motion.path d="M 250 40 Q 270 10, 290 20 Q 280 50, 250 40 Z" fill="currentColor" className="text-primary/90 " variants={popup} initial="hidden" animate="visible" />
                        <motion.path d="M 250 40 Q 230 10, 210 15 Q 210 35, 250 40 Z" fill="currentColor" className="text-primary/60 " variants={popup} initial="hidden" animate="visible" />

                        {/* Leaf Cluster Mid Right High */}
                        <motion.path d="M 450 60 Q 430 30, 460 25 Q 480 40, 450 60 Z" fill="currentColor" className="text-primary/80 " variants={popup} initial="hidden" animate="visible" />
                        <motion.path d="M 450 60 Q 480 50, 490 70 Q 460 90, 450 60 Z" fill="currentColor" className="text-secondary " variants={popup} initial="hidden" animate="visible" />

                        {/* Leaf Cluster Right Low */}
                        <motion.path d="M 530 140 Q 560 120, 570 140 Q 550 170, 530 140 Z" fill="currentColor" className="text-primary/70 " variants={popup} initial="hidden" animate="visible" />
                        <motion.path d="M 530 140 Q 550 100, 530 90 Q 500 110, 530 140 Z" fill="currentColor" className="text-secondary " variants={popup} initial="hidden" animate="visible" />
                        <motion.path d="M 530 140 Q 510 160, 500 180 Q 530 170, 530 140 Z" fill="currentColor" className="text-primary/90 " variants={popup} initial="hidden" animate="visible" />

                        {/* Center Filler Leaves */}
                        <motion.path d="M 370 145 Q 390 120, 360 100 Q 330 130, 370 145 Z" fill="currentColor" className="text-primary/60 " variants={popup} initial="hidden" animate="visible" />

                        {/* Glowing "Thought Fruits" (Glowing Orbs) */}
                        <motion.circle cx="105" cy="140" r="6" fill="currentColor" className="text-amber-400  drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" variants={popup} initial="hidden" animate="visible" />
                        <motion.circle cx="240" cy="35" r="8" fill="currentColor" className="text-orange-400  drop-shadow-[0_0_12px_rgba(251,146,60,0.8)]" variants={popup} initial="hidden" animate="visible" />
                        <motion.circle cx="475" cy="65" r="5" fill="currentColor" className="text-amber-500  drop-shadow-[0_0_6px_rgba(245,158,11,0.8)]" variants={popup} initial="hidden" animate="visible" />
                        <motion.circle cx="535" cy="120" r="7" fill="currentColor" className="text-yellow-400  drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]" variants={popup} initial="hidden" animate="visible" />

                        {/* Merged Idea Fruit */}
                        <motion.circle cx="250" cy="40" r="10" fill="currentColor" className="text-purple-400  drop-shadow-[0_0_15px_rgba(192,132,252,0.8)]" variants={popup} initial="hidden" animate="visible" />
                    </>
                )}

                {/* --- Text Label: "A Blooming Network" --- */}
                <AnimatePresence>
                    {step >= 4 && (
                        <motion.text
                            x="450"
                            y="85"
                            textAnchor="middle"
                            className="fill-foreground font-sans text-sm font-black uppercase tracking-[0.1em]"
                            initial={{ opacity: 0, y: 10, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        >
                            Infinite Reality
                        </motion.text>
                    )}
                </AnimatePresence>

            </svg>
        </div>
    );
}
