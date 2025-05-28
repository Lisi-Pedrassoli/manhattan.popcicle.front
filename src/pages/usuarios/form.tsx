import { AxiosResponse } from "axios";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import useSWR, { mutate } from "swr";
import api from "../../utils/api";
import { UsuarioType } from "../../utils/types";

export default function UsuarioForm() {
  const route = useNavigate();
  const [visibility, setVisibility] = useState(false);
  const [loader, setLoader] = useState(false);
  const { id } = useParams();
  const {handleSubmit, register, getValues, setValue, formState: { errors }} = useForm<UsuarioType>();
  const { data, isLoading } = useSWR<AxiosResponse<UsuarioType>>(id && `/usuario/${id}`,api.get);

  if (id) {
    
    setValue("ativo", data?.data.ativo!);
    setValue("id", id);
    setValue("nome", data?.data.nome!);
    setValue("email", data?.data.email!);
    setValue("cargo", data?.data.cargo!);
  }

  useEffect(() => {
    setTimeout(() => {
      setVisibility(true);
    }, 1);
  }, []);

  function goBack() {
    if (loader) return;
    setLoader(true);
    setVisibility(false);
    setTimeout(() => {
      route(-1);
    }, 200);
  }

  function criarUsuario() {
    setLoader(true);

    const data = {
      nome: getValues("nome"),
      email: getValues("email"),
      senha: getValues("senha"),
      confirmaSenha: getValues("confirmaSenha")
    }

    api.post("/auth/register", data)
    .then(() => {
      mutate("/usuario");
      setLoader(false);
      goBack();
    })
    .finally(() => {
      setLoader(false);
    });
  }

  function atualizarUsuario() {
    setLoader(true);

    const data = {
      nome: getValues("nome"),
      email: getValues("email"),
      senha: getValues("senha"),
      ativo: Boolean(getValues("ativo"))
    }

    api
    .put(`/usuario/${id}`, data)
    .then(() => {
      mutate("/usuarios");
      setLoader(false);
      goBack();
    })
    .finally(() => {
      setLoader(false);
    });
  }

  return (
    <>
      <div className="w-screen h-screen bg-black/50 overflow-y-auto inset-0 absolute z-40" onClick={() => goBack()} />

      <div className={`${ visibility ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"} z-50 flex w-full h-full justify-end transition-all duration-200 absolute inset-0 pointer-events-none`}>
        <div className="bg-pink-100 z-50 overflow-y-auto scrollbar-thin scrollbar-track-neutral-200 scrollbar-thumb-neutral-300 min-w-80 max-w-sm w-full rounded-l-xl pointer-events-auto">
          <div className="p-4">
            <div className="flex items-center gap-2">
              <button disabled={loader} onClick={() => goBack()} className="hover:bg-neutral-200 rounded-lg p-1" data-action="go-back">
                <ArrowLeft size={20} />
              </button>

              <h2 className="font-bold text-xl mb-1">Usuário</h2>
            </div>
          </div>

          <form onSubmit={handleSubmit(id ? () => atualizarUsuario() : () => criarUsuario())} className="px-5 space-y-3">
            {id && (
              <label className="flex flex-col">
                <span>Status:</span>
                <select {...register("ativo", { required: true })} className="input w-full">
                  <option value="true">Ativo</option>
                  <option value="false">Inativo</option>
                </select>
              </label>
            )}

            <label className="flex flex-col">
              <span>Nome: </span>
              <input disabled={loader} type="text" {...register("nome", { required: true })} placeholder="Ex: João" className="input" />
              {errors.nome && <p className="text-xs text-red-500 mt-1">O campo não deve ser nulo</p>}
            </label>

            <label className="flex flex-col">
              <span>E-mail: </span>
              <input disabled={loader} type="email" {...register("email", { required: true })} placeholder="email@email.com" className="input" />
              {errors.nome && <p className="text-xs text-red-500 mt-1">O campo não deve ser nulo</p>}
            </label>


            <label className="flex flex-col">
              <span>{id ? "Trocar " : ""} Senha: </span>
              <input disabled={loader} autoComplete="new-password" type="password" {...register("senha", { required: false })} placeholder="Informe a senha" className="input" />
              {errors.nome && <p className="text-xs text-red-500 mt-1">O campo não deve ser nulo</p>}
            </label>

            <label className="flex flex-col">
              <span>Confirmar Senha:</span>
              <input disabled={loader} autoComplete="new-password" type="password" {...register("confirmaSenha", { required: false })} placeholder="Confirme sua senha" className="input" />
              {errors.nome && <p className="text-xs text-red-500 mt-1">O campo não deve ser nulo</p>}
            </label>

            <button className="bg-pink-500 px-4 py-2 text-white rounded-lg float-right" disabled={isLoading || loader}>
              {loader ? <Loader2 className="animate-spin" /> : "Salvar"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
