export function conversorUnidadeMedida(unidade: string){
  switch(unidade){
    case "QUILOGRAMA_KG":
      return "Quilograma"
    case "GRAMA_G":
      return "Grama"
    case "TONELADA_T":
      return "Tonelada"
    case "LITRO_L":
      return "Litro"
    case "MILILITRO_ML":
      return "Mililitro"
    case "UNIDADE_UN":
      return "Unidade"
    case "METRO_M":
      return "Metro"
    case "CENTIMETRO_CM":
      return "Centímetro"
    case "PACOTE_PCT":
      return "Pacote"
    default:
      return "Não identificado"
  }
}