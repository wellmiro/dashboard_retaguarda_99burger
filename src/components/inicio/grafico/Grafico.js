import React, { useState, useEffect } from "react";
import { getPedidos } from "../../../api/Pedidos";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  ChartDataLabels
);

function Grafico({ filtro = "hoje", horaAbertura = "08:00", horaFechamento = "03:50" }) {
  const [barData, setBarData] = useState({
    labels: ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"],
    datasets: [{
      label: "Faturamento (R$)",
      data: [0, 0, 0, 0, 0, 0, 0],
      backgroundColor: "rgba(0,123,255,0.8)",
      borderRadius: 6,
    }],
  });

  const [formasData, setFormasData] = useState({ labels: [], datasets: [] });
  const [formasValores, setFormasValores] = useState({});

  // Helper para converter string de data para objeto Date
  const parseDataBR = (dt) => {
    if (!dt) return null;
    if (dt.includes("/")) {
      const [data, hora] = dt.split(" ");
      const [dia, mes, ano] = data.split("/");
      return new Date(`${ano}-${mes}-${dia}T${hora || "00:00:00"}`);
    }
    return new Date(dt);
  };

  /**
   * Determina a "Data de Negócio" de um pedido com base no turno.
   * Se o turno fecha às 03:50 e o pedido é 01:00 da manhã, ele volta 1 dia
   * para contar no faturamento do dia em que a loja abriu.
   */
  const getDataDeNegocio = (dataPedido) => {
    const d = new Date(dataPedido);
    const hora = d.getHours();
    const min = d.getMinutes();
    const [hF] = horaFechamento.split(":").map(Number);
    const [mF] = horaFechamento.split(":").map(Number);

    const minutosPedido = hora * 60 + min;
    const minutosFechamento = hF * 60 + mF;

    // Se o pedido foi feito entre 00:00 e o horário de fechamento (ex: 03:50)
    // ele pertence ao dia anterior.
    if (minutosPedido <= minutosFechamento) {
      d.setDate(d.getDate() - 1);
    }
    return d.toDateString();
  };

  useEffect(() => {
    getPedidos()
      .then((res) => {
        const pedidos = Array.isArray(res.data) ? res.data : res.data?.pedidos || [];
        
        // --- 1. PROCESSAMENTO DO GRÁFICO DE BARRAS (7 DIAS) ---
        const faturamentoPorDiaNegocio = {};
        
        pedidos.forEach(p => {
          const dtOriginal = parseDataBR(p.dt_pedido || p.data_pedido);
          if (!dtOriginal) return;

          const diaNegocio = getDataDeNegocio(dtOriginal);
          const valor = parseFloat(String(p.vl_total || 0).replace(",", "."));
          
          faturamentoPorDiaNegocio[diaNegocio] = (faturamentoPorDiaNegocio[diaNegocio] || 0) + valor;
        });

        const valoresBar = [0, 0, 0, 0, 0, 0, 0];
        const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
        const labelsExibicao = [];

        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const chave = d.toDateString();
          
          // O índice no array final (0-6) mapeado para Seg-Dom
          // dt.getDay(): 0=Dom, 1=Seg... Ajustando para Seg=0
          const diaIndex = d.getDay();
          const pos = diaIndex === 0 ? 6 : diaIndex - 1;
          
          valoresBar[pos] = faturamentoPorDiaNegocio[chave] || 0;
          labelsExibicao[pos] = diasSemana[diaIndex];
        }

        setBarData({
          labels: ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"],
          datasets: [{
            label: "Faturamento (R$)",
            data: valoresBar,
            backgroundColor: "rgba(0,123,255,0.8)",
            borderRadius: 6,
          }],
        });

        // --- 2. PROCESSAMENTO DO GRÁFICO DE PIZZA (HOJE OU ONTEM) ---
        const targetDate = new Date();
        if (filtro === "ontem") targetDate.setDate(targetDate.getDate() - 1);
        const targetChave = targetDate.toDateString();

        const formasMap = new Map();
        pedidos.forEach((p) => {
          const dtOriginal = parseDataBR(p.dt_pedido || p.data_pedido);
          if (!dtOriginal) return;

          if (getDataDeNegocio(dtOriginal) === targetChave) {
            const forma = p.forma_pagamento || "Não Informado";
            const valor = parseFloat(String(p.vl_total || 0).replace(",", "."));
            formasMap.set(forma, (formasMap.get(forma) || 0) + valor);
          }
        });

        const labels = Array.from(formasMap.keys());
        const dataPizza = Array.from(formasMap.values());
        const colors = ["#007BFF", "#28a745", "#ffc107", "#dc3545", "#6f42c1", "#888"];

        setFormasData({
          labels,
          datasets: [{
            data: dataPizza,
            backgroundColor: colors.slice(0, labels.length),
            borderWidth: 2,
            borderColor: "#ffffff"
          }],
        });

        const valoresObj = {};
        labels.forEach((lbl, i) => (valoresObj[lbl] = dataPizza[i]));
        setFormasValores(valoresObj);
      })
      .catch((err) => console.error("Erro ao buscar pedidos:", err));
  }, [filtro, horaFechamento]); // Removido horaAbertura pois o fechamento define a virada

  const formatValue = (value) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: { top: 35 } },
    scales: { 
        x: { grid: { display: false } }, 
        y: { beginAtZero: true, grid: { color: "rgba(0,0,0,0.05)" } } 
    },
    plugins: {
      legend: { display: false },
      datalabels: {
        anchor: "end",
        align: "top",
        color: "#444",
        font: { weight: "bold", size: 10 },
        formatter: (v) => v > 0 ? formatValue(v) : "",
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { position: "top", labels: { boxWidth: 12, padding: 15, font: { size: 11 } } },
      datalabels: { display: false }
    },
    cutout: "65%"
  };

  return (
    <div className="grafico-row">
      <div className="grafico-container">
        <h4>📊 Faturamento últimos 7 dias (Turno até {horaFechamento})</h4>
        <div className="grafico-wrapper bar-chart">
          <Bar data={barData} options={barOptions} />
        </div>
      </div>

      <div className="grafico-container">
        <h4>💳 Formas de Pagamento ({filtro === "hoje" ? "Hoje" : "Ontem"})</h4>
        <div className="grafico-wrapper pie-chart">
          {formasData.labels.length > 0 ? (
            <>
              <Doughnut data={formasData} options={doughnutOptions} />
              <div className="legenda-pizza">
                {formasData.labels.map((lbl, i) => (
                  <div key={i} className="legenda-item">
                    <span className="legenda-label">{lbl}:</span>
                    <span className="legenda-valor">{formatValue(formasValores[lbl] || 0)}</span>
                  </div>
                ))}
                <div className="legenda-item total-pizza" style={{ borderTop: '1px solid #eee', marginTop: '5px', fontWeight: 'bold' }}>
                  <span className="legenda-label">TOTAL:</span>
                  <span className="legenda-valor">
                    {formatValue(Object.values(formasValores).reduce((a, b) => a + b, 0))}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <p className="msg-vazia">Sem dados para o período</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Grafico;