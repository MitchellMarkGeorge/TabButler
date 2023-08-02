export interface ModalState {
    isLoading: boolean;
    setIsLoading: (isLoading: boolean) => void;
    hasError: boolean;
    setHasError: (hasError: boolean) => void;

}