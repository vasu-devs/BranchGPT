export default function Loading() {
    return (
        <div className="flex h-[100dvh] bg-white dark:bg-black flex-col md:flex-row overflow-hidden">
            {/* Desktop Sidebar Skeleton */}
            <div className="hidden md:flex h-full shrink-0 w-[300px] border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-black/50 flex-col">
                <div className="h-16 border-b border-zinc-200 dark:border-zinc-800" />
                <div className="p-4 space-y-4">
                    <div className="h-10 w-full bg-zinc-200 dark:bg-zinc-800 rounded-md animate-pulse" />
                    <div className="space-y-2">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="h-8 w-full bg-zinc-100 dark:bg-zinc-900 rounded-md animate-pulse" />
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Chat Area Skeleton */}
            <main className="flex-1 flex flex-col min-w-0 bg-white dark:bg-background border-x border-zinc-200 dark:border-zinc-800 overflow-hidden relative">
                {/* Mobile Header Skeleton */}
                <div className="md:hidden h-14 border-b border-zinc-200 dark:border-zinc-800 shrink-0" />

                <div className="flex-1 p-6 space-y-8">
                    {/* Message Skeletons */}
                    {[1, 2, 3].map((i) => (
                        <div key={i} className={`flex gap-4 max-w-3xl mx-auto ${i % 2 === 0 ? 'flex-row-reverse' : ''}`}>
                            <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 shrink-0" />
                            <div className={`space-y-2 flex-1 max-w-[80%] ${i % 2 === 0 ? 'items-end' : ''}`}>
                                <div className="h-4 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                                <div className="h-4 w-1/2 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Input Area Skeleton */}
                <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
                    <div className="max-w-3xl mx-auto h-12 bg-zinc-100 dark:bg-zinc-900 rounded-xl animate-pulse" />
                </div>
            </main>

            {/* Desktop GitTree Skeleton */}
            <div className="hidden md:flex h-full shrink-0 w-[300px] border-l border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-black/50 flex-col">
                <div className="h-16 border-b border-zinc-200 dark:border-zinc-800" />
                <div className="p-4 space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                            <div className="h-4 w-20 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
