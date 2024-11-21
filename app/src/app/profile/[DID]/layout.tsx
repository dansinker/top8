export function generateStaticParams() {
    return [
        {
            DID: "placeholder",
        },
    ];
}

export default function ProfileLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
