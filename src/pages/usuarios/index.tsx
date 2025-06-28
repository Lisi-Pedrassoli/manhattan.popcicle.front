import { AxiosResponse } from "axios";
import { Plus, Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import useSWR, { mutate } from "swr";
import EmptyList from "../../components/common/empty";
import Skeleton from "../../components/common/skeleton";
import { Status } from "../../components/common/status";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/table";
import api from "../../utils/api";
import { UsuarioType } from "../../utils/types";

export default function Usuarios() {
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(0);
  const location = useLocation();
  const [totalItems, setTotalItems] = useState(0);
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const navigate = useNavigate()

  const { data: usuarios, isLoading } = useSWR<AxiosResponse<UsuarioType[]>>(`/usuario?page=${currentPage}&items=${itemsPerPage}`, api.get);
  
  useEffect(() => {
    api.get("usuario/count").then((response) => setTotalItems(response.data.count));
    mutate(`/usuario?page=${currentPage}&items=${itemsPerPage}`, undefined, { revalidate: true });
  }, [location.pathname])


  return (
    <>
      <div className="pt-12 sm:pt-0 relative overflow-x-auto sm:rounded-lg flex flex-col gap-7">
        <Link to="/usuarios/form" className="bg-pink-400 text-white font-bold px-4 py-2 rounded-lg cursor-pointer w-max flex gap-2 items-center">
          <Plus className="text-white size={20}" />
          <span>Novo Usuário</span>
        </Link>

        {!isLoading ? (
          usuarios && usuarios.data.length ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Cargo</TableHead>
                    <TableHead>Ativo</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {usuarios?.data.map((usuario: UsuarioType) => (
                    <TableRow key={usuario.id} className="bg-pink-100 border-transparent odd:bg-pink-50 group overflow-hidden relative ring-2 ring-inset rounded-lg ring-transparent hover:ring-pink-500 transition-none">
                      <TableCell className="">
                        <p>{usuario.nome}</p>
                      </TableCell>
                      <TableCell>{usuario.email}</TableCell>
                      <TableCell>{usuario.cargo == "ADMIN" ? "Administrador" : ""}</TableCell>
                      <TableCell>
                        <Status status={String(usuario.ativo) === "true"} />
                      </TableCell>
                      <TableCell>
                      <div
                            //  href={`/usuarios/form/${usuario.id}`}
                            onClick={() =>
                              // setDeleteConfirmationId(usuario.id!)
                              navigate(`/usuarios/form/${usuario.id}`)
                            }
                            className="bg-neutral-100 text-neutral-600 w-max hover:bg-red-100 hover:text-red-600 rounded-lg p-1 opacity-40 hover:opacity-100"
                          >
                            
                            <Pencil />
                          </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex">
                <button disabled={currentPage === 0} onClick={() => setCurrentPage((prev) => prev - 1)} className="text-neutral-600 cursor-pointer px-4 py-2 bg-gray-200 rounded-lg mx-1 disabled:opacity-50 text-sm">
                  Anterior
                </button>
              
                <span className="px-4 py-2 text-sm text-neutral-600">{`Página ${currentPage + 1} de ${totalPages}`}</span>

                <button disabled={currentPage + 1 === totalPages} onClick={() => setCurrentPage((prev) => prev + 1)} className="text-neutral-600 cursor-pointer px-4 py-2 bg-gray-200 rounded-lg mx-1 disabled:opacity-50 text-sm">
                  Próxima
                </button>
              </div>
            </>
          ) : (
            <EmptyList />
          )
        ) : (
          <Skeleton />
        )}
      </div>

      <Outlet />
    </>
  );
}
