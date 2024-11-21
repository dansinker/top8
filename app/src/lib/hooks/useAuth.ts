import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from '@/lib/services/auth'

interface AuthState {
    isAuthenticated: boolean;
    profile: Profile | null;
    accessJwt: string | null;
    loading: boolean;
}

export function useAuth() {
    const [state, setState] = useState<AuthState>({
        isAuthenticated: false,
        profile: null,
        accessJwt: null,
        loading: true,
    });
    const router = useRouter();

    useEffect(() => {
        authService.loadSession().then((session) => {
            setState({
                isAuthenticated: !!session,
                profile: session?.profile || null,
                accessJwt: session?.accessJwt || null,
                loading: false,
            });
        });
    }, []);

    const login = async (identifier: string, password: string) => {
        const session = await authService.createSession(identifier, password);
        setState({
            isAuthenticated: true,
            profile: session.profile,
            accessJwt: session.accessJwt,
            loading: false,
        });
        router.push("/profile");
    };

    const logout = () => {
        authService.clearSession();
        setState({
            isAuthenticated: false,
            profile: null,
            accessJwt: null,
            loading: false,
        });
        router.push("/");
    };

    return {
        ...state,
        login,
        logout,
    };
}
