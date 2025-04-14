import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

export default function ProtectedRoute() {
  const estaAutenticado = useAuth();

  return estaAutenticado ? <Outlet /> : <Navigate to="/login" replace />
}