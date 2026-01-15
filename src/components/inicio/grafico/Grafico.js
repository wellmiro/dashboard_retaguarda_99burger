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
import "./Styles.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  ChartDataLabels
);

function Grafico({ filtro = "hoje", horaAbertura = "17:00", horaFechamento = "03:50" }) {
  const [barData, setBarData] = useState({
    labels: ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"],
    datasets: [
      {
        label: "Faturamento (R$)",
        data: [0, 0, 0, 0, 0, 0, 0],
        backgroundColor: "rgba(0,123,255,0.8)",
        borderRadius: 6,
      },
    ],
  });

  const [formasData, setFormasData] = useState({ labels: [], datasets: [] });
  const [formasValores, setFormasValores] = useState({});

  const parseDataBR = (dt) => {
    if (!dt) return null;
    if (dt.includes("/")) {
      const [data, hora] = dt.split(" ");
      const [dia, mes, ano] = data.split("/");
      return new Date(`${ano}-${mes}-${dia}T${hora || "00:00:00"}`);
    }
    return new Date(dt);
  };

  const isDentroTurno = (dataPedido) => {
    const abertura = horaAbertura.split(":").map(Number);
    const fechamento = horaFechamento.split(":").map(Number);

    const inicio = new Date(dataPedido);
    const fim = new Date(dataPedido);

    inicio.setHours(abertura[0], abertura[1], 0, 0);
    fim.setHours(fechamento[0], fechamento[1], 59, 999);
    if (fim <= inicio) fim.setDate(fim.getDate() + 1);

    return dataPedido >= inicio && dataPedido <= fim;
  };

  useEffect(() => {
    getPedidos()
      .then((res) => {
        const pedidos = Array.isArray(res.data) ? res.data : res.data?.pedidos || [];

        // GRÁFICO DE BARRAS - últimos 7 dias
        const valoresBar = [0, 0, 0, 0, 0, 0, 0];
        const labelsBar = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

        for (let i = 6; i >= 0; i--) {
          const dia = new Date();
          dia.setDate(dia.getDate() - i);

          pedidos.forEach((p) => {
            const dt = parseDataBR(p.dt_pedido || p.data_pedido);
            if (!dt) return;
            if (dt.getHours() < parseInt(horaAbertura.split(":")[0])) dt.setDate(dt.getDate() - 1);
            if (!isDentroTurno(dt)) return;
            if (dt.toDateString() === dia.toDateString()) {
              const index = dt.getDay() === 0 ? 6 : dt.getDay() - 1;
              valoresBar[index] += parseFloat(p.vl_total || 0);
            }
          });
        }

        setBarData((prev) => ({
          ...prev,
          datasets: [{ ...prev.datasets[0], data: valoresBar }],
        }));

        // GRÁFICO DE PIZZA - apenas o dia filtrado
        const dataPizza =
          filtro === "hoje"
            ? new Date()
            : new Date(new Date().setDate(new Date().getDate() - 1));

        const formasMap = new Map();

        pedidos.forEach((p) => {
          const dt = parseDataBR(p.dt_pedido || p.data_pedido);
          if (!dt) return;
          if (dt.getHours() < parseInt(horaAbertura.split(":")[0])) dt.setDate(dt.getDate() - 1);
          if (dt.toDateString() !== dataPizza.toDateString()) return;
          if (!isDentroTurno(dt)) return;

          const forma = p.forma_pagamento || "Não Informado";
          const valor = parseFloat(p.vl_total || 0);
          formasMap.set(forma, (formasMap.get(forma) || 0) + valor);
        });

        const labels = Array.from(formasMap.keys());
        const data = Array.from(formasMap.values());
        const colors = ["#007BFF", "#28a745", "#ffc107", "#dc3545", "#6c757d"];

        setFormasData({
          labels,
          datasets: [
            {
              label: "Faturamento por Forma de Pagamento",
              data,
              backgroundColor: colors.slice(0, labels.length),
              borderWidth: 1,
            },
          ],
        });

        const valoresObj = {};
        labels.forEach((lbl, i) => (valoresObj[lbl] = data[i]));
        setFormasValores(valoresObj);
      })
      .catch((err) => console.error("Erro ao buscar pedidos:", err));
  }, [filtro, horaAbertura, horaFechamento]);

  const formatValue = (value) => `R$ ${value.toFixed(2)}`;

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: { x: { grid: { display: false } }, y: { beginAtZero: true } },
    plugins: {
      legend: { display: false },
      datalabels: {
        anchor: "end",
        align: "end",
        color: "#333",
        font: { weight: "bold", size: 11 },
        formatter: formatValue,
      },
      tooltip: { callbacks: { label: (ctx) => formatValue(ctx.parsed.y) } },
    },
  };

  return (
    <div className="grafico-row">
      {/* GRÁFICO DE BARRAS */}
      <div className="grafico-container">
        <h4>
          📊 Faturamento últimos 7 dias (Turno {horaAbertura}→{horaFechamento})
        </h4>
        <div className="grafico-wrapper">
          <Bar data={barData} options={barOptions} />
        </div>
      </div>

      {/* GRÁFICO DE PIZZA */}
      <div className="grafico-container">
        <h4>
          💳 Faturamento por Forma de Pagamento ({filtro === "hoje" ? "Hoje" : "Ontem"})
        </h4>
        <div className="grafico-wrapper">
          {formasData.labels.length > 0 ? (
            <>
              <Doughnut data={formasData} />
              <div className="legenda-pizza" style={{ marginTop: 20 }}>
                {formasData.labels.map((lbl, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 4,
                    }}
                  >
                    <span>{lbl}:</span>
                    <span>{formatValue(formasValores[lbl])}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p style={{ textAlign: "center", marginTop: 50 }}>
              Sem dados para o período selecionado
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Grafico;
