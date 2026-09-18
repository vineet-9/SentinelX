import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { getToken } from "@/services/authService";

type Props = {
  children: ReactNode;
};

export default function ProtectedRoute({ children }: Props) {
  const location = useLocation();
  const token = getToken();

  if (!token) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  return <>{children}</>;
}