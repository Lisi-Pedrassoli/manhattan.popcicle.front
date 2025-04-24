import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import Layout from "./components/layout";
import ProtectedRoute from "./components/protectedRoute";
import Login from "./pages/login";
import MateriaPrima from "./pages/materiaPrima";
import MateriaPrimaForm from "./pages/materiaPrima/form";
import Producoes from "./pages/producoes";
import Produtos from "./pages/produtos";
import ProdutoForm from "./pages/produtos/form";
import Receitas from "./pages/receitas";
import ReceitaForm from "./pages/receitas/form";
import TiposProdutos from "./pages/tiposProdutos";
import TipoProdutoForm from "./pages/tiposProdutos/form";
import Usuarios from "./pages/usuarios";
import UsuarioForm from "./pages/usuarios/form";
import Vendas from "./pages/vendas";
import VendaForm from "./pages/vendas/form";
import Vendedores from "./pages/vendedores";
import VendedorForm from "./pages/vendedores/form";
import ProducaoForm from "./pages/producoes/form";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />

        <Route element={<Layout><Outlet /></Layout>}>
          <Route element={<ProtectedRoute />}>
            <Route path="/usuarios" element={<Usuarios />}>
              <Route path="/usuarios/form" element={<UsuarioForm />} />
              <Route path="/usuarios/form/:id" element={<UsuarioForm />} />
            </Route>

            <Route path="/tipos-produtos" element={<TiposProdutos />}>
              <Route path="/tipos-produtos/form" element={<TipoProdutoForm />} />
              <Route path="/tipos-produtos/form/:id" element={<TipoProdutoForm />}/>
            </Route>

            <Route path="/produtos" element={<Produtos />}>
              <Route path="/produtos/form" element={<ProdutoForm />} />
              <Route path="/produtos/form/:id" element={<ProdutoForm />}/>
            </Route>

            <Route path="/materias-primas" element={<MateriaPrima />}>
              <Route path="/materias-primas/form" element={<MateriaPrimaForm />} />
              <Route path="/materias-primas/form/:id" element={<MateriaPrimaForm />}/>
            </Route>

            <Route path="/receitas" element={<Receitas />}>
              <Route path="/receitas/form" element={<ReceitaForm />} />
              <Route path="/receitas/form/:id" element={<ReceitaForm />}/>
            </Route>

            <Route path="/producoes" element={<Producoes />}>
              <Route path="/producoes/form" element={<ProducaoForm />} />
              <Route path="/producoes/form/:id" element={<ProducaoForm />}/>
            </Route>

            <Route path="/vendedores" element={<Vendedores />}>
              <Route path="/vendedores/form" element={<VendedorForm />} />
              <Route path="/vendedores/form/:id" element={<VendedorForm />}/>
            </Route>

            <Route path="/vendas" element={<Vendas />}>
              <Route path="/vendas/form" element={<VendaForm />} />
              <Route path="/vendas/form/:id" element={<VendaForm />}/>
            </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
