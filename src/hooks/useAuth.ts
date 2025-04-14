export default function useAuth() {
  const autenticado = !!localStorage.getItem("token");

  return { autenticado };
}