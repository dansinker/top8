// // src/app/profile/[DID]/page.tsx - Viewing someone else's profile
// "use client";

// import { BaseLayout } from "@/components/layout/base-layout";
// import { UserProfile } from "@/components/profile/user-profile";
// import { Top8List } from "@/components/top8/top8-list";
import { UserPosts } from "@/components/posts/user-posts";
// import { useParams } from "next/navigation";

// export const dynamic = "force-dynamic";

// export default function UserProfilePage() {
//     const params = useParams();
//     const did = params?.DID as string;
//     console.log("Viewing profile for DID:", did);

//     return (
//         <BaseLayout>
//             <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
//                 <div>
//                     <UserProfile did={did} />
//                 </div>
//                 <div className="md:col-span-2 space-y-6">
//                     <Top8List did={did} /> {/* Pass did to view their Top 8 */}
//                     <UserPosts did={did} />
//                 </div>
//             </div>
//         </BaseLayout>
//     );
// }

// profile/[DID]/page.tsx
// "use client";
// profile/[DID]/page.tsx
export default function ProfilePage({ params }: { params: { DID: string } }) {
    return (
        <div>
            {/* Your profile viewing component */}
            Profile for: {params.DID}
            <UserPosts did={params.DID} />
        </div>
    );
}

// This replaces getStaticPaths in the App Router
export async function generateStaticParams() {
    // Return an array of objects matching the dynamic segments
    return [
        { DID: "dylanr.com" },
        // Add any other DIDs you want to pre-generate
        { DID: "example.com" },
        { DID: "test.com" },
    ];
}
