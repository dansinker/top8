// src/app/profile/[DID]/page.tsx - Viewing someone else's profile
("use client");

import { BaseLayout } from "@/components/layout/base-layout";
import { UserProfile } from "@/components/profile/user-profile";
import { Top8List } from "@/components/top8/top8-list";
import { UserPosts } from "@/components/posts/user-posts";
import { useParams } from "next/navigation";

export default function UserProfilePage() {
    const params = useParams();
    const did = params?.DID as string;

    return (
        <BaseLayout>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                <div>
                    <UserProfile did={did} />
                </div>
                <div className="md:col-span-2 space-y-6">
                    <Top8List did={did} /> {/* Pass did to view their Top 8 */}
                    <UserPosts did={did} />
                </div>
            </div>
        </BaseLayout>
    );
}
