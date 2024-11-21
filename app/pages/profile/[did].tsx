import { useRouter } from "next/router";
import { UserProfile } from "@/components/profile/user-profile";

export default function ProfilePage() {
	const router = useRouter();
	const { did } = router.query;

	if (!did || typeof did !== "string") return null;
	return <UserProfile did={did} />;
}
