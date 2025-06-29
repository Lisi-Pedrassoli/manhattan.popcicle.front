import { EyeIcon, EyeOffIcon, Loader2 } from "lucide-react";
import { useState } from "react";
import api from "../../utils/api";
import icon from "/icon.png";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loader, setLoader] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  async function login(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); // evita recarregar

    setLoader(true);  
    setError("");

    try {
      const response = await api.post("/auth/login", { email, senha: password });

      if (response?.data) {
        localStorage.setItem("token", response.data.token);

        const user = {
          cargo: response.data.usuario.cargo,
          email: response.data.usuario.email,
          name: response.data.usuario.name,
        };

        localStorage.setItem("user", JSON.stringify(user));

        window.location.href = "/usuarios";
      }
    } catch (e: any) {
  if (e.response?.data?.detail) {
    setError(e.response.data.detail);
  } else {
    setError("Usuário ou senha incorretos");
  }
  } finally {
    setLoader(false); 
  }

}

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center gap-10 bg-pink-100 p-5">
      <div className="flex items-center gap-3 justify-center">
        <img src={icon} alt="" className="w-14" />
        <h1 className="text-neutral-600 font-bold text-2xl whitespace-nowrap">Manhattan Pop!</h1>
      </div>

      <div className="bg-pink-500 flex flex-col w-full max-w-lg rounded-lg p-5">
        <h2 className="text-center text-white text-2xl font-bold">Login</h2>

        <form onSubmit={login} className="p-5 flex flex-col gap-3 text-sm md:text-lg">
          <input
            type="email"
            placeholder="Email"
            className="bg-pink-300 rounded-lg px-4 py-2 w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Senha"
              className="bg-pink-300 rounded-lg px-4 py-2 w-full"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="absolute right-2 top-2 md:top-3"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeIcon className="text-neutral-600 font-bold" size={18} />
              ) : (
                <EyeOffIcon className="text-neutral-600 font-bold" size={18} />
              )}
            </button>
          </label>

              {error && <p className="text-xs text-white mt-1">{error}</p>}

          <button
            type="submit"
            disabled={loader}
            className="w-full rounded-lg px-4 py-2 text-white font-bold bg-pink-600 hover:bg-pink-400 cursor-pointer mt-8 flex items-center justify-center"
          >
            {loader ? <Loader2 className="text-white font-bold animate-spin" /> : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
