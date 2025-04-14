export function toBrl(value: number | string | null){
  return Number(value ?? 0).toLocaleString("pt-BR", {
    currency: "BRL",
    style: "currency"
  })
}

export function formatPhone(value: string) {
  let phone = value;
  phone = phone?.replace(/\D/g, "");
  phone = phone?.replace(/(\d{2})(\d)/, "($1) $2");
  phone = phone?.replace(/(\d)(\d{6})(\d)/, "$1 $2$3");
  phone = phone?.replace(/(\d)(\d{4})$/, "$1-$2");
  return phone;
}