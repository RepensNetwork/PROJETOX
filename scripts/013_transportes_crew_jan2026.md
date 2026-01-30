# Dados de transporte – crew Jan/2026

Use estes dados para criar ou editar demandas na tela de demandas (ou via SQL).  
Na tela **Motorista** (`/motorista`), os transportes aparecem agrupados por **horário de saída** (viagens do dia).

---

## Regra geral

- **Desembarques:** saída do terminal às **11:00** (depois destino aeroporto ou hotel).
- **Embarques:** buscar no horário de chegada do voo; depois, no dia da escala, levar do hotel ao terminal no horário combinado.

---

## Desembarques (saída 11:00)

### AZHARI MUH ZAINI
- **Saída terminal:** 11:00  
- **Destino:** Aeroporto de Navegantes  
- **Voo:** 14:00  
- **Tipo demanda:** Desembarque passageiros  
- **Perna única:** Terminal → Aeroporto Navegantes (busca 11:00, voo 14h)

### ELIANA
- **Saída terminal:** 11:00  
- **Destino 1º dia:** Hotel (a confirmar)  
- **Dia 01/02:** motorista busca no hotel com **5h de antecedência** do voo → Aeroporto Florianópolis  
- **Voo:** 13:00 (01/02) → logo **busca no hotel: 08:00**  
- **Tipo demanda:** Desembarque passageiros  
- **Pernas:**  
  1. Terminal → Hotel (busca 11:00, dia do desembarque)  
  2. Hotel → Aeroporto Florianópolis (busca 08:00 em 01/02, voo 13h)

---

## Embarques

### JULIANO
- **Voo:** LA 4518 – Florianópolis 30 Jan 2026 **18:45**  
- **30/01:** buscar no aeroporto (18:45) → Hotel (a confirmar)  
- **31/01:** Hotel → Terminal **Marejada** às **08:30**  
- **Tipo demanda:** Embarque passageiros  
- **Pernas:**  
  1. Aeroporto Florianópolis → Hotel (busca 30/01 18:45)  
  2. Hotel → Terminal Marejada (busca 31/01 08:30)

### ROHAN
- **Voo:** QR 7255 – Florianópolis 30 Jan 2026 **14:35**  
- **30/01:** buscar no aeroporto (14:35) → Hotel (a confirmar)  
- **31/01:** Hotel → Terminal **Marejada** às **08:30**  
- **Tipo demanda:** Embarque passageiros  
- **Pernas:**  
  1. Aeroporto Florianópolis → Hotel (busca 30/01 14:35)  
  2. Hotel → Terminal Marejada (busca 31/01 08:30)

### DUNHILL
- **Voo:** a confirmar  
- Criar demanda quando tiver dados do voo e repetir o padrão (aeroporto → hotel; hotel → terminal no dia da escala).

---

## Como cadastrar no sistema

1. **Escalas/Navio:** crie ou selecione a escala (ex.: Marejada) e o navio.  
2. **Demandas:** para cada pessoa acima, crie uma demanda do tipo **Embarque passageiros** ou **Desembarque passageiros**.  
3. **Horários e pernas:**  
   - Use **Horário de busca** e **Origem/Destino** na demanda, ou  
   - Depois de salvar, use **Transporte – pernas** (ou edite na tela do Motorista) para preencher cada perna com `pickup_at`, `pickup_local`, `dropoff_local`.  
4. **Voo/obs:** use o campo “Nº da viagem / observação” (ou grupo) para anotar voo e horário (ex.: “LA 4518 18:45”, “Voo 14h Navegantes”).

Na tela **Motorista**, ao filtrar por data (ex.: 30/01, 31/01, 01/02), as viagens aparecem agrupadas por horário (ex.: “Viagem às 08:30”, “Viagem às 11:00”), para o motorista organizar o dia.
