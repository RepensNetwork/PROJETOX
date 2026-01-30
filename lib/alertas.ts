const TRANSPORTE_TIPOS: string[] = [
  "embarque_passageiros",
  "desembarque_passageiros",
  "visita_medica",
  "transporte_terrestre",
  "pickup_dropoff",
  "motorista",
  "veiculo",
]

export function isTransporteTipo(tipo: string): boolean {
  return TRANSPORTE_TIPOS.includes(tipo)
}
