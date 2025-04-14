import { Link, useLocation, useNavigate } from "react-router-dom";
import icon from "/popsicle-icon.png"
import { LogOut, Menu } from "lucide-react";
import { useState } from "react";

export default function Sidebar() {
  const [aberto, setAberto] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="bg-pink-100">
      <button type="button" className="fixed top-5 left-5 z-40 md:hidden flex" onClick={() => setAberto(!aberto)}>
        <Menu className={`${aberto ? "text-white" : "text-pink-500"} text-3xl`} />
      </button>

      <aside className={`h-screen fixed inset-0 bg-pink-500 rounded-tr-xl rounded-br-xl z-40 w-full max-w-72 p-5 flex flex-col transform transition-transform duration-300 ease-in-out ${aberto ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:flex`}>
        <div className="flex items-center gap-3 w-max cursor-pointer" onClick={() => navigate("/usuarios")}>
          <img src={icon} alt="" className="w-14" />
          <h2 className="text-white font-bold text-xl whitespace-nowrap">Manhattan Pop!</h2>
        </div>

        <nav className="flex flex-col pt-12 text-white font-bol text-xl flex-1 gap-1">
          <Link to="/usuarios" className={`hover:bg-pink-700 px-4 py-2 rounded-lg ${location.pathname.includes("/usuarios") ? "bg-pink-700" : ""}`}>Usuários</Link>
          <Link to="/tipos-produtos" className={`hover:bg-pink-700 px-4 py-2 rounded-lg ${location.pathname.includes("/tipos-produtos") ? "bg-pink-700" : ""}`}>Tipos de produto</Link>
          <Link to="/produtos" className={`hover:bg-pink-700 px-4 py-2 rounded-lg ${location.pathname.includes("/produtos") ? "bg-pink-700" : ""}`}>Produtos</Link>
          <Link to="/materias-primas" className={`hover:bg-pink-700 px-4 py-2 rounded-lg ${location.pathname.includes("/materias-primas") ? "bg-pink-700" : ""}`}>Matérias primas</Link>
          <Link to="/receitas" className={`hover:bg-pink-700 px-4 py-2 rounded-lg ${location.pathname.includes("/receitas") ? "bg-pink-700" : ""}`}>Receitas</Link>
          <Link to="/producoes" className={`hover:bg-pink-700 px-4 py-2 rounded-lg ${location.pathname.includes("/producoes") ? "bg-pink-700" : ""}`}>Produções</Link>
          <Link to="/vendedores" className={`hover:bg-pink-700 px-4 py-2 rounded-lg ${location.pathname.includes("/vendedores") ? "bg-pink-700" : ""}`}>Vendedores</Link>
          <Link to="/clientes" className={`hover:bg-pink-700 px-4 py-2 rounded-lg ${location.pathname.includes("/clientes") ? "bg-pink-700" : ""}`}>Clientes</Link>
          <Link to="/vendas" className={`hover:bg-pink-700 px-4 py-2 rounded-lg ${location.pathname.includes("/vendas") ? "bg-pink-700" : ""}`}>Vendas</Link>
        </nav>

        <button type="button" className="flex items-center justify-between w-full hover:bg-pink-700 px-4 py-2 rounded-lg" onClick={() => navigate("/login")}>
          <span className="text-white font-bold text-xl">Sair</span>
          <LogOut className="text-white text-lg" />
        </button>
      </aside>

      {aberto && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setAberto(false)} />
      )}
    </div>
  )
}