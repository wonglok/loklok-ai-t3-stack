import { create } from 'zustand';

const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,

  // Hydrate on initialization
  hydrate: async () => {
    const token = await window.trpcSDK?.getAuthToken();
    if (!token) return;
    try {
      const res = await window.trpcSDK.client.app.auth.hydrate.mutate({ token });
      set({
        user: { _id: res.user._id, email: res.user.email },
        isAuthenticated: true,
      });
    } catch (_) {
      // If hydration fails, clear any stale token
      await window.trpcSDK?.setAuthToken(null);
      set({ user: null, isAuthenticated: false });
    }
  },

  login: async ({ email, password }) => {
    console.log('res', '')
    const res = await window.trpcSDK.client.app.auth.login.mutate({ email, password });
    console.log('123', res)

    await window.trpcSDK.setAuthToken(res.token);

    set({
      user: { _id: res.userID, email },
      isAuthenticated: true,
    });
  },

  register: async ({ email, password }) => {
    const res = await window.trpcSDK.client.app.auth.register.mutate({ email, password });
    await window.trpcSDK.setAuthToken(res.token);
    set({
      user: { _id: res.userID, email },
      isAuthenticated: true,
    });
  },

  logout: async () => {
    await window.trpcSDK.client.app.auth.logout.mutate({});
    await window.trpcSDK.setAuthToken(null);
    set({ user: null, isAuthenticated: false });
  },
}));

export default useAuthStore;