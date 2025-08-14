```javascript
import { create } from "zustand";
import { getTRPC } from "./getTRPC.js";

const GLOBAL_APP_ID = 123;

const useFrontendStore = create((set, get) => ({
    user: null,
    loading: false,
    error: null,
    jwt: null,

    appID: GLOBAL_APP_ID,
    setAppID: ({ appID }) => set({ appID }),

    login: async (username, password) => {
        set({ loading: true, error: null });
        try {
            const trpc = await getTRPC();
            const result = await trpc.login.mutate({
                username,
                password,
            });

            localStorage.setItem(`jwt_${get().appID}`, result.token);
            set({ user: result.user, jwt: result.token, loading: false });
            return result;
        } catch (e) {
            set({ error: e.message ?? "Login failed", loading: false });
            throw e;
        }
    },

    register: async (username, email, password) => {
        set({ loading: true, error: null });
        try {
            const trpc = await getTRPC();
            const result = await trpc.register.mutate({
                username,
                email,
                password,
            });

            localStorage.setItem(`jwt_${get().appID}`, result.token);
            set({ user: result.user, jwt: result.token, loading: false });
            return result;
        } catch (e) {
            set({ error: e.message ?? "Registration failed", loading: false });
            throw e;
        }
    },

    logout: () => {
        localStorage.removeItem(`jwt_${get().appID}`);
        set({ user: null, jwt: null });
    },

    // 
    // for each procedure in the techncial specification ([the appRouter procedures]) 
    // create the trpc client functions here
    
}));

export { useFrontendStore };
```