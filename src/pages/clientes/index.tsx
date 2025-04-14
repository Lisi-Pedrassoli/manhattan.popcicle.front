import { CheckCircle, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, Outlet } from "react-router-dom";
import api from "../../utils/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/table";
import Skeleton from "../../components/common/skeleton";
import { Status } from "../../components/common/status";
import useSWR, { mutate } from "swr";
import { ClienteType } from "../../utils/types";
import { AxiosResponse } from "axios";
import { formatPhone } from "../../utils/utils";

export default function Clientes() {
  const itemsPerPage = 10;
  const [loader, setLoader] = useState(false);
  const [deleteConfirmationId, setDeleteConfirmationId] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  const { data: clientes, isLoading } = useSWR<AxiosResponse<ClienteType[]>>(`/cliente?page=${currentPage}&items=${itemsPerPage}`, api.get);

  useEffect(() => {
    api.get("cliente/count").then((response) => setTotalItems(response.data.count));
  }, []);

  function desativarCliente() {
    setLoader(true);
    api
      .delete(`/cliente/${deleteConfirmationId}`)
      .then(() => {
        mutate("/cliente");
        setDeleteConfirmationId("");
        setLoader(false);
      })
      .finally(() => {
        setLoader(false);
      });
  }

  return (
    <>
      <div className="relative overflow-x-auto sm:rounded-lg flex flex-col gap-7">
        <Link to="/clientes/form" className="bg-pink-500 text-white font-bold px-4 py-2 rounded-lg cursor-pointer w-max flex gap-2 items-center">
          <Plus className="text-white size={20}" />
          <span>Novo Cliente</span>
        </Link>

        {!isLoading ? (
          <>
            <Table className="md:table">
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead className="xl:pl-16">Ativo</TableHead>
                  <TableHead>
                    <div className="text-center min-w-full">Ação</div>
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {clientes?.data.map((cliente: ClienteType) => (
                  <TableRow
                    key={cliente.id}
                    className="bg-pink-100 border-transparent odd:bg-pink-50 group overflow-hidden relative ring-2 ring-inset rounded-lg ring-transparent hover:ring-pink-500 transition-none"
                  >
                    <TableCell className="group-hover:text-pink-500 group-hover:underline">
                      <Link
                        className="group-hover:cursor-pointer"
                        to={`/clientes/form/${cliente.id}`}
                      >
                        {cliente.nome}
                      </Link>
                    </TableCell>
                    <TableCell>{formatPhone(cliente.telefone!)}</TableCell>
                    <TableCell className="xl:pl-16">
                      <Status status={cliente.ativo!} />
                    </TableCell>
                    <TableCell className="flex justify-center">
                      {deleteConfirmationId == cliente.id ? (
                        <button
                          type="button"
                          disabled={loader}
                          onClick={() => desativarCliente()}
                          className="bg-neutral-100 text-neutral-600 hover:bg-red-100 hover:text-red-600 rounded-lg p-1"
                        >
                          <CheckCircle size={16} />
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={loader}
                          onClick={() => setDeleteConfirmationId(cliente.id!)}
                          className="bg-neutral-100 text-neutral-600 hover:bg-red-100 hover:text-red-600 rounded-lg p-1 opacity-40 hover:opacity-100"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
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
          <Skeleton />
        )}
      </div>
      <Outlet />
    </>
  );
}
