import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function BranchIcon({ className }: { className?: string }) {
    return (
        <motion.svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn("h-4 w-4 text-primary", className)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
        >
            {/* Trunk and Main Leaf Node */}
            <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                d="M12 21 C 12 15, 12 10, 12 5"
            />
            {/* Split Branch Curve */}
            <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
                d="M12 14 C 18 12, 19 8, 19 5"
            />
            {/* Organic Leaves */}
            <motion.path
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.6, type: "spring", stiffness: 300, damping: 20 }}
                d="M12 5 C 10 3, 14 3, 12 5"
                fill="currentColor"
            />
            <motion.path
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.7, type: "spring", stiffness: 300, damping: 20 }}
                d="M19 5 C 17 3, 21 3, 19 5"
                fill="currentColor"
            />
        </motion.svg>
    );
}
