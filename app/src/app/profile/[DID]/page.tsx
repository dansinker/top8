"use client";

import { BaseLayout } from "@/components/layout/base-layout";
import { UserProfile } from "@/components/profile/user-profile";
import { useParams } from "next/navigation";

export default function UserProfilePage() {
    const params = useParams();
    const did = params.DID as string;

    return (
        <BaseLayout>
            <UserProfile did={did} />
        </BaseLayout>
    );
}
