import { cn } from "@/lib/utils";

export function PlusIcon({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn("h-4 w-4", className)}
        >
            <path d="M5 12h14" />
            <path d="M12 5v14" />
        </svg>
    );
}
