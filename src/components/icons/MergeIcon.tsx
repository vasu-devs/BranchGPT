import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function MergeIcon({ className }: { className?: string }) {
    return (
        <motion.svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn("h-4 w-4 text-amber-600 ", className)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
        >
            {/* Left Root */}
            <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                d="M5 5 C 5 10, 10 14, 12 18"
            />
            {/* Right Root */}
            <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
                d="M19 5 C 19 10, 14 14, 12 18"
            />
            {/* Merged Base Leaf/Node */}
            <motion.path
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.6, type: "spring", stiffness: 300, damping: 20 }}
                d="M12 18 C 9 21, 15 21, 12 18"
                fill="currentColor"
            />
        </motion.svg>
    );
}
