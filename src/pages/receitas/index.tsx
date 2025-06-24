import { AxiosResponse } from "axios";
import { Plus, Pencil, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import useSWR, { mutate } from "swr";
import EmptyList from "../../components/common/empty";
import Skeleton from "../../components/common/skeleton";
import { Status } from "../../components/common/status";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/table";
import api from "../../utils/api";
import { ReceitaType } from "../../utils/types";
import { useNavigate } from "react-router-dom";

export default function Receitas() {
  const navigate = useNavigate();
  const itemsPerPage = 10;
  const [loader] = useState(false);
  const location = useLocation();
  const [, setDeleteConfirmationId] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMateriasPrimas, setSelectedMateriasPrimas] = useState<any[]>([]);

  const { data: receitas, isLoading } = useSWR<AxiosResponse<ReceitaType[]>>(`/receita?page=${currentPage}&items=${itemsPerPage}`, api.get);
  
  useEffect(() => {
    api.get("produto/count").then((response) => setTotalItems(response.data.count));
    mutate (`/receita?page=${currentPage}&items=${itemsPerPage}`)
  }, [location.pathname])

  function abrirModal(materiasPrimas: any[]) {
    setSelectedMateriasPrimas(materiasPrimas);
    setModalOpen(true);
  }

  return (
    <>
      <div className="relative overflow-x-auto sm:rounded-lg flex flex-col gap-7">
        <Link to="/receitas/form" className="bg-pink-400 text-white font-bold px-4 py-2 rounded-lg cursor-pointer w-max flex gap-2 items-center">
          <Plus className="text-white size={20}" />
          <span>Nova Receita</span>
        </Link>

        {!isLoading ? (
          receitas && receitas.data.length ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead>Matéria Prima</TableHead>
                    <TableHead>Ativo</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {receitas?.data.map((receita: ReceitaType) => (
                    <TableRow key={receita.id} className="bg-pink-100 border-transparent odd:bg-pink-50 group overflow-hidden relative ring-2 ring-inset rounded-lg ring-transparent hover:ring-pink-500 transition-none">
                      <TableCell className="group-hover:text-pink-500 group-hover:underline">
                        {/* <Link className="group-hover:cursor-pointer" to={`/receitas/form/${receita.id}`}>{receita.produto.nome}</Link> */}
                        {receita.produto.nome}
                      </TableCell>

                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          {receita.receitaMateriaPrima.slice(0, 1).map((materiaPrima: any) => (
                            <span key={materiaPrima.materiaPrima.id} className="bg-pink-200 text-pink-800 px-2 py-1 rounded-lg text-xs">
                              {materiaPrima.materiaPrima.nome}
                            </span>
                          ))}

                          {receita.receitaMateriaPrima.length > 1 && (
                            <button onClick={() => abrirModal(receita.receitaMateriaPrima)} className="cursor-pointer text-sm text-pink-600 hover:underline flex items-center">
                              <Plus size={12} className="mr-1" /> Ver mais
                            </button>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <Status status={receita.ativo} />
                      </TableCell>

                      <TableCell>
                      <div
                         onClick={() => navigate(`/receitas/form/${receita.id}`)}
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

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <div className="flex justify-between items-center pb-2">
              <h2 className="text-lg font-bold">Matérias-Primas</h2>
              <button onClick={() => setModalOpen(false)} className="text-gray-600 hover:text-gray-900">
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              {selectedMateriasPrimas.map((materiaPrima) => (
                <span key={materiaPrima.id} className="bg-pink-200 text-pink-800 px-2 py-1 rounded-lg text-xs">
                  {materiaPrima.materiaPrima.nome}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
