import { create } from 'zustand';

export const useDarkStringStore = create((set) => ({
    darkString: '',
    setDarkString: (data) => set({ darkString: data }),
}));
