import React from "react";
import "./Styles.css";

function Lista() {
  // Dados do mês inteiro fixos (1 a 30)
  const dados = [
    { dia: 1, entradas: 2500, saidas: 1000, lucro: 1500, taxaEntrega: 200 },
    { dia: 2, entradas: 3000, saidas: 1500, lucro: 1500, taxaEntrega: 250 },
    { dia: 3, entradas: 3200, saidas: 1800, lucro: 1400, taxaEntrega: 220 },
    { dia: 4, entradas: 2800, saidas: 1200, lucro: 1600, taxaEntrega: 180 },
    { dia: 5, entradas: 3500, saidas: 2000, lucro: 1500, taxaEntrega: 300 },
    { dia: 6, entradas: 3100, saidas: 1700, lucro: 1400, taxaEntrega: 250 },
    { dia: 7, entradas: 3300, saidas: 1600, lucro: 1700, taxaEntrega: 200 },
    { dia: 8, entradas: 2900, saidas: 1300, lucro: 1600, taxaEntrega: 210 },
    { dia: 9, entradas: 3000, saidas: 1400, lucro: 1600, taxaEntrega: 220 },
    { dia: 10, entradas: 3400, saidas: 1800, lucro: 1600, taxaEntrega: 240 },
    { dia: 11, entradas: 3100, saidas: 1500, lucro: 1600, taxaEntrega: 230 },
    { dia: 12, entradas: 3600, saidas: 1900, lucro: 1700, taxaEntrega: 250 },
    { dia: 13, entradas: 3300, saidas: 1600, lucro: 1700, taxaEntrega: 220 },
    { dia: 14, entradas: 3200, saidas: 1500, lucro: 1700, taxaEntrega: 210 },
    { dia: 15, entradas: 3500, saidas: 2000, lucro: 1500, taxaEntrega: 300 },
    { dia: 16, entradas: 3100, saidas: 1400, lucro: 1700, taxaEntrega: 220 },
    { dia: 17, entradas: 3300, saidas: 1600, lucro: 1700, taxaEntrega: 210 },
    { dia: 18, entradas: 3400, saidas: 1700, lucro: 1700, taxaEntrega: 230 },
    { dia: 19, entradas: 3000, saidas: 1300, lucro: 1700, taxaEntrega: 200 },
    { dia: 20, entradas: 3100, saidas: 1500, lucro: 1600, taxaEntrega: 210 },
    { dia: 21, entradas: 3200, saidas: 1600, lucro: 1600, taxaEntrega: 220 },
    { dia: 22, entradas: 3300, saidas: 1700, lucro: 1600, taxaEntrega: 230 },
    { dia: 23, entradas: 3400, saidas: 1800, lucro: 1600, taxaEntrega: 240 },
    { dia: 24, entradas: 3500, saidas: 1900, lucro: 1600, taxaEntrega: 250 },
    { dia: 25, entradas: 3600, saidas: 2000, lucro: 1600, taxaEntrega: 260 },
    { dia: 26, entradas: 3700, saidas: 2100, lucro: 1600, taxaEntrega: 270 },
    { dia: 27, entradas: 3800, saidas: 2200, lucro: 1600, taxaEntrega: 280 },
    { dia: 28, entradas: 3900, saidas: 2300, lucro: 1600, taxaEntrega: 290 },
    { dia: 29, entradas: 4000, saidas: 2400, lucro: 1600, taxaEntrega: 300 },
    { dia: 30, entradas: 4100, saidas: 2500, lucro: 1600, taxaEntrega: 310 },
  ];

  return (
    <table className="lista-financeiro">
      <thead>
        <tr>
          <th>Data</th>
          <th>Entradas (R$)</th>
          <th>Saídas (R$)</th>
          <th>Lucro (R$)</th>
          <th>Taxa de Entrega (R$)</th>
        </tr>
      </thead>
      <tbody>
        {dados.map((d, idx) => (
          <tr key={idx} className={idx % 2 === 0 ? "linha-azul" : "linha-branca"}>
            <td>{d.dia.toString().padStart(2, "0")}/09/2025</td>
            <td>{d.entradas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
            <td>{d.saidas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
            <td>{d.lucro.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
            <td>{d.taxaEntrega.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default Lista;
