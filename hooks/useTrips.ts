import { useTripsCtx } from "@/layout/TripsProvider";

export const useTrips = () => {
  const context = useTripsCtx();

  if (!context) {
    throw new Error("useTrips must be used inside TripsProvider");
  }

  return context;
};
