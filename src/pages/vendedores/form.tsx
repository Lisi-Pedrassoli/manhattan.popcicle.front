import { AxiosResponse } from "axios";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import useSWR, { mutate } from "swr";
import api from "../../utils/api";
import { VendedorType } from "../../utils/types";

export default function VendedorForm() {
  const route = useNavigate();
  const [visibility, setVisibility] = useState(false);
  const [loader, setLoader] = useState(false);
  const { id } = useParams();
  const {handleSubmit, register, getValues, setValue, setError, formState: { errors }} = useForm<VendedorType>();
  const { data, isLoading } = useSWR<AxiosResponse<VendedorType>>(id && `/vendedor/${id}`,api.get);

  if (id) {
    setValue("ativo", data?.data.ativo!);
    setValue("id", id);
    setValue("nome", data?.data.nome!);
    setValue("cpf", data?.data.cpf!);
    setValue("comissao", data?.data.comissao!);
    setValue("telefone", data?.data.telefone!);
  }

  useEffect(() => {
    setTimeout(() => {
      setVisibility(true);
    }, 1);
  
    if (id && data) {
      setValue("ativo", data.data.ativo);
      setValue("id", id);
      setValue("nome", data.data.nome);
      setValue("cpf", data.data.cpf);
      setValue("comissao", data.data.comissao * 100);
      setValue("telefone", data.data.telefone);
    }
  }, [data, id, setValue]);
  

  function goBack() {
    if (loader) return;
    setLoader(true);
    setVisibility(false);
    setTimeout(() => {
      route(-1);
    }, 200);
  }

  function criarVendedor() {
    
    setLoader(true);
    
    if (!validarCPF(getValues("cpf"))) {
      setError("cpf", { type: "manual", message: "CPF inválido" });
      setLoader(false);
      return;
    }

    const data = {
      telefone: getValues("telefone"),
      comissao: parseFloat(getValues("comissao").toString()) / 100,
      cpf: getValues("cpf"),
      nome: getValues("nome"),
    };

    api
    .post("/vendedor", data)
    .then(() => {
      mutate("/vendedor");
      setLoader(false);
      goBack()
    })
    .finally(() => {
      setLoader(false);
    });
  }

  function atualizarVendedor() {
    setLoader(true);
    const valores = getValues();
    const dadosConvertidos = {
      ...valores,
      comissao: parseFloat(valores.comissao.toString()) / 100,
    };
    api
    .put(`/vendedor/${id}`, dadosConvertidos)
    .then(() => {
      mutate("/vendedor");
      setLoader(false);
      goBack();
    })
    .finally(() => {
      setLoader(false);
    });
  }

  function validarCPF(cpf: string): boolean {
    cpf = cpf.replace(/[^\d]+/g, "");
  
    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
  
    let soma = 0;
    let resto;
  
    for (let i = 1; i <= 9; i++) {
      soma += parseInt(cpf[i - 1]) * (11 - i);
    }

    resto = (soma * 10) % 11;

    if (resto === 10 || resto === 11) {
      resto = 0;
    } 

    if (resto !== parseInt(cpf[9])) return false;
  
    soma = 0;
  
    for (let i = 1; i <= 10; i++) {
      soma += parseInt(cpf[i - 1]) * (12 - i);
    }
  
    resto = (soma * 10) % 11;

    if (resto === 10 || resto === 11) resto = 0;

    if (resto !== parseInt(cpf[10])) return false;
  
    return true;
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

              <h2 className="font-bold text-xl mb-1">Vendedor</h2>
            </div>
          </div>

          <form onSubmit={handleSubmit(id ? () => atualizarVendedor() : () => criarVendedor())} className="px-5 space-y-3">
            <label className="flex flex-col">
              <span>Status:</span>
              <select {...register("ativo", { required: true })} className="input w-full">
                <option value="true">Ativo</option>
                <option value="false">Inativo</option>
              </select>
            </label>

            <label className="flex flex-col">
              <span>Nome: </span>
              <input disabled={loader} type="text" {...register("nome", { required: true })} placeholder="Ex: João" className="input" />
              {errors.nome && <p className="text-xs text-red-500 mt-1">O campo não deve ser nulo</p>}
            </label>

            <label className="flex flex-col">
              <span>CPF: </span>
              <input disabled={loader} type="text" {...register("cpf", { required: true })} placeholder="xxx.xxx.xxx.xx" className="input" maxLength={11}  />
              {errors.cpf && <p className="text-xs text-red-500 mt-1">{errors.cpf.message}</p>}
            </label>

            <label className="flex flex-col">
              <span>Telefone: </span>
              <input disabled={loader} type="text" {...register("telefone")} placeholder="(xx) x xxxx-xxxx" className="input" maxLength={11} />
              {errors.telefone && <p className="text-xs text-red-500 mt-1">O campo não deve ser nulo</p>}
            </label>

            <label className="flex flex-col">
              <span>Comissao: </span>
              <input disabled={loader} type="text" {...register("comissao")} placeholder="" className="input" />
              {errors.comissao && <p className="text-xs text-red-500 mt-1">O campo não deve ser nulo</p>}
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
