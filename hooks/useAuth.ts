import { useAuthContext } from "@/layout/AuthProvider";

export const useAuth = () => {
  const context = useAuthContext();

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};
