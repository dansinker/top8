"use client";

import { BaseLayout } from "@/components/layout/base-layout";
import { ProfileContent } from "@/components/profile/profile-content";
import { useAuth } from "@/lib/auth/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProfilePage() {
    const { isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isAuthenticated) {
            router.push("/");
        }
    }, [isAuthenticated, router]);

    return (
        <BaseLayout>
            <ProfileContent />
        </BaseLayout>
    );
}
