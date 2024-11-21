// src/components/profile/profile-content.tsx
"use client";

import { useAuth } from "@/lib/auth/auth-context";
import { Top8List } from "@/components/top8/top8-list";
import { UserPosts } from "@/components/posts/user-posts";
import { ProfileHeader } from "@/components/profile/profile-header";
import { ThemePicker } from "@/components/theme/theme-picker";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function ProfileContent() {
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
		<div className="grid grid-cols-1 gap-8 md:grid-cols-3">
			<div className="space-y-6">
				<ProfileHeader profile={profile} />
				<ThemePicker />
			</div>
			<div className="md:col-span-2 space-y-6">
				<Top8List />
				<UserPosts did={profile.did} />
			</div>
		</div>
	);
}
