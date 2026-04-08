import { toast } from "sonner";

export const showLoading = () => {
  return toast.loading("Ingresando...", {
    description: "Por favor espera",
  });
};

export const showError = (message: string) => {
  toast.error("Error", {
    description: message,
  });
};

export const showSuccess = (message: string) => {
  return toast.success(message, {
    duration: 1500,
  });
};