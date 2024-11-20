import { LoginForm } from "@/components/auth/login-form"
import { BaseLayout } from "@/components/layout/base-layout"

export default function HomePage() {
  return (
    <BaseLayout>
      <div className="mx-auto max-w-md">
        <h1 className="mb-8 text-2xl font-bold">Welcome to Top 8</h1>
        <LoginForm />
      </div>
    </BaseLayout>
  )
}
