import api from "../../utils/api";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Plus, Pencil } from "lucide-react";
import { TipoProdutoType } from "../../utils/types";
import Skeleton from "../../components/common/skeleton";
import EmptyList from "../../components/common/empty";
import useSWR, { mutate } from "swr";
import { AxiosResponse } from "axios";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/table";
import { Status } from "../../components/common/status";
import { useEffect, useState } from "react";
import { toBrl } from "../../utils/utils";
import { useNavigate } from "react-router-dom";

export default function TiposProdutos() {
  const navigate = useNavigate();
  const itemsPerPage = 10;
  const [loade, setLoader] = useState(false)
  const location = useLocation();//isso também
  const [, setDeleteConfirmationId] = useState("")
  const [currentPage, setCurrentPage] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const { data: tipoProduto, isLoading } = useSWR<AxiosResponse<TipoProdutoType[]>>(`/tipo-produto?page=${currentPage}&items=${itemsPerPage}`, api.get);//pega aqui para por la 

  useEffect(() => {
    api.get("tipo-produto/count").then((response) => setTotalItems(response.data.count));
    mutate(`/tipo-produto?page=${currentPage}&items=${itemsPerPage}`)//ele colocou isso aqui
  }, [location.pathname]);

  function desativarTipoProduto(id: string){
    setLoader(true)
    api
      .delete(`/tipo-produto/${id}`)
      .then(() => {
        mutate(`/tipo-produto?page=${currentPage}&items=${itemsPerPage}`);//esse atualiza sozinho
        setDeleteConfirmationId("")
        setLoader(false);
      })
      .finally(() => {
        setLoader(false);
      });
  }

  return (
    <>
      <div className="relative overflow-x-auto sm:rounded-lg flex flex-col gap-7">
        <Link
          to="/tipos-produtos/form"
          className="bg-pink-400 text-white font-bold px-4 py-2 rounded-lg cursor-pointer w-max flex gap-2 items-center"
        >
          <Plus className="text-white size={20}" />
          <span>Novo Tipo De Produto</span>
        </Link>

        {!isLoading ? (
          tipoProduto && tipoProduto.data?.length > 0 ? (
            <>
              <Table className="md:table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tipoProduto.data?.map((_tipoProduto: TipoProdutoType) => (
                    <TableRow
                      key={_tipoProduto.id}
                      className="bg-pink-100 border-transparent odd:bg-pink-50 group overflow-hidden relative ring-2 ring-inset rounded-lg ring-transparent hover:ring-pink-500 transition-none"
                    >
                      <TableCell className="group-hover:text-pink-500 group-hover:underline">
                        {/* <Link aqui caso eu queria por um link no nome para direcionar para o formulatio de edição
                          className="group-hover:cursor-pointer"
                          to={`/tipos-produtos/form/${_tipoProduto.id}`} 
                        >
                          {_tipoProduto.tipo} 
                        </Link> */}
                        {_tipoProduto.tipo}
                      </TableCell>
                      <TableCell>{toBrl(_tipoProduto.valor)}</TableCell>
                      <TableCell>
                        <Status status={_tipoProduto.ativo!} />
                      </TableCell>
                      <TableCell>{/*  aqui para definir o botao de lapis vai abrir o formulario de edição */}
                        <div
                          onClick={() => navigate(`/tipos-produtos/form/${_tipoProduto.id}`)}
                          className="bg-neutral-100 text-neutral-600 w-max hover:bg-red-100 hover:text-red-600 rounded-lg p-1 opacity-40 hover:opacity-100"
                        >
                          <Pencil />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* paginação */}
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
