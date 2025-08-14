import { create } from "zustand";

export const useAppTable = create(() => {
    return {
        //
        loading: false,
        apps: [],
    };
});
