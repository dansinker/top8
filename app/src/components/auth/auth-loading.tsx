// src/components/auth/auth-loading.tsx
"use client";

export function AuthLoading() {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center p-8">
                <div className="animate-pulse text-lg">Loading...</div>
            </div>
        </div>
    );
}
