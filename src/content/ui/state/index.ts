import { create } from "zustand";
import { ModalState } from "./type";

export const useModalState = create<ModalState>(set => ({
    isLoading: false,
    hasError: false,
    setHasError: (hasError) => set({ hasError }),
    setIsLoading: (isLoading) => set({ isLoading }),
}));