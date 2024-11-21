// src/app/profile/page.tsx - Your own profile page
"use client";

import { BaseLayout } from "@/components/layout/base-layout";
import { ProfileHeader } from "@/components/profile/profile-header";
import { UserPosts } from "@/components/posts/user-posts";
import { Top8List } from "@/components/top8/top8-list";
import { ThemePicker } from "@/components/theme/theme-picker";
import { useAuth } from "@/lib/auth/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProfilePage() {
    const { isAuthenticated, profile } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isAuthenticated) {
            router.push("/");
        }
    }, [isAuthenticated, router]);

    if (!profile) {
        return null;
    }

    return (
        <BaseLayout>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                <div className="space-y-6">
                    <ProfileHeader profile={profile} />
                    <ThemePicker />
                </div>
                <div className="md:col-span-2 space-y-6">
                    <Top8List /> {/* No did prop = viewing own profile */}
                    <UserPosts did={profile.did} />
                </div>
            </div>
        </BaseLayout>
    );
}
