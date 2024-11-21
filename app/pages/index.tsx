import { LoginForm } from "@/components/auth/login-form";

export default function HomePage() {
    return (
        <div className="mx-auto max-w-md">
            <h1 className="mb-8 text-2xl font-bold">Welcome to Top 8</h1>
            <LoginForm />
        </div>
    );
}
