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
            className={cn("h-4 w-4", className)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
        >
            <motion.circle
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 20 }}
                cx="18" cy="18" r="3"
            />
            <motion.circle
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 20 }}
                cx="6" cy="6" r="3"
            />
            <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
                d="M6 9a9 9 0 0 0 9 9"
            />
        </motion.svg>
    );
}
