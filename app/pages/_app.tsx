// pages/_app.tsx
import type { AppProps } from "next/app";
import { AuthProvider } from "@/lib/auth/auth-context";
import { ThemeProvider } from "@/lib/theme/theme-context";
import { Inter } from "next/font/google";
import { Logo } from "@/components/ui/logo";
import "@/styles/globals.css";

const inter = Inter({ subsets: ["latin"] });

export default function App({ Component, pageProps }: AppProps) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <AuthProvider>
                    <ThemeProvider>
                        <div className="min-h-screen">
                            <header className="bg-primary px-4 py-6">
                                <div className="mx-auto max-w-4xl">
                                    <Logo className="h-12 w-auto text-white" />
                                </div>
                            </header>
                            <main className="mx-auto max-w-4xl px-4 py-8">
                                <Component {...pageProps} />
                            </main>
                        </div>
                    </ThemeProvider>
                </AuthProvider>
            </body>
        </html>
    );
}
