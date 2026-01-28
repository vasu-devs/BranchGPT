    export default function Loading() {
    return (
        <div className="flex h-[100dvh] bg-background flex-col md:flex-row overflow-hidden relative">
            {/* Desktop Sidebar Skeleton */}
            <div className="hidden md:flex h-full shrink-0 w-[300px] glass flex-col z-20">
                <div className="h-16 border-b border-white/10" />
                <div className="p-6 space-y-6">
                    <div className="h-12 w-full glass-card animate-pulse shadow-sm" />
                    <div className="space-y-4 pt-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="h-10 w-full bg-slate-200/20 dark:bg-slate-800/20 rounded-xl animate-pulse" />
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Chat Area Skeleton */}
            <main className="flex-1 flex flex-col min-w-0 bg-transparent overflow-hidden relative z-10">
                {/* Mobile Header Skeleton */}
                <div className="md:hidden h-14 border-b border-white/5 shrink-0 glass" />

                <div className="flex-1 p-8 space-y-10 overflow-hidden">
                    {/* Message Skeletons */}
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className={`flex gap-5 max-w-4xl mx-auto ${i % 2 === 0 ? 'flex-row-reverse' : ''}`}>
                            <div className="w-10 h-10 rounded-2xl glass-card shrink-0 animate-pulse shadow-md" />
                            <div className={`space-y-3 flex-1 max-w-[80%] flex flex-col ${i % 2 === 0 ? 'items-end' : ''}`}>
                                <div className="h-4 w-3/4 glass-card animate-pulse rounded-full opacity-60" />
                                <div className="h-4 w-1/2 glass-card animate-pulse rounded-full opacity-40" />
                                {i % 3 === 0 && <div className="h-4 w-2/3 glass-card animate-pulse rounded-full opacity-20" />}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Input Area Skeleton */}
                <div className="p-8 bg-gradient-to-t from-background via-background/80 to-transparent">
                    <div className="max-w-4xl mx-auto h-16 glass-card animate-pulse shadow-2xl rounded-2xl opacity-50" />
                </div>
            </main>

            {/* Desktop GitTree Skeleton */}
            <div className="hidden md:flex h-full shrink-0 w-[300px] glass flex-col z-20">
                <div className="h-16 border-b border-white/10" />
                <div className="p-6 space-y-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex items-center gap-4">
                            <div className="w-3 h-3 rounded-full bg-slate-300/30 dark:bg-slate-700/30 animate-pulse" />
                            <div className="h-5 w-32 glass-card animate-pulse rounded-lg opacity-40" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
