// src/components/relatorios/financeiro/grafico/Grafico.js
import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import "./Styles.css";

function Grafico() {
  const lineChartRef = useRef(null);
  const pieChartRef = useRef(null);
  const lineInstanceRef = useRef(null);
  const pieInstanceRef = useRef(null);

  // Dados do mês para exemplo
  const dias = Array.from({ length: 30 }, (_, i) => i + 1);
  const entradas = Array.from({ length: 30 }, () => Math.floor(Math.random() * 1500 + 500));
  const saidas = Array.from({ length: 30 }, () => Math.floor(Math.random() * 1000 + 300));

  useEffect(() => {
    // ================== LINE CHART ==================
    const lineCtx = lineChartRef.current.getContext("2d");

    if (lineInstanceRef.current) {
      lineInstanceRef.current.destroy();
    }

    lineInstanceRef.current = new Chart(lineCtx, {
      type: "line",
      data: {
        labels: dias,
        datasets: [
          {
            label: "Entradas (R$)",
            data: entradas,
            backgroundColor: "rgba(59, 130, 246, 0.2)",
            borderColor: "#3b82f6",
            borderWidth: 2,
            tension: 0.3,
            fill: true,
            pointBackgroundColor: "#3b82f6",
            pointBorderColor: "#1e40af",
            pointRadius: 5,
          },
          {
            label: "Saídas (R$)",
            data: saidas,
            backgroundColor: "rgba(239, 68, 68, 0.2)",
            borderColor: "#ef4444",
            borderWidth: 2,
            tension: 0.3,
            fill: true,
            pointBackgroundColor: "#ef4444",
            pointBorderColor: "#b91c1c",
            pointRadius: 5,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: { legend: { display: true } },
        scales: {
          y: { beginAtZero: true },
          x: { beginAtZero: true },
        },
      },
    });

    // ================== PIE CHART ==================
    const pieCtx = pieChartRef.current.getContext("2d");

    if (pieInstanceRef.current) {
      pieInstanceRef.current.destroy();
    }

    pieInstanceRef.current = new Chart(pieCtx, {
      type: "pie",
      data: {
        labels: ["Fornecedores", "Funcionários", "Impostos", "Manutenção"],
        datasets: [
          {
            data: [2500, 2000, 1500, 1500],
            backgroundColor: ["#3b82f6", "#6366f1", "#60a5fa", "#93c5fd"],
          },
        ],
      },
      options: {
        responsive: true,
        plugins: { legend: { position: "bottom" } },
      },
    });

    return () => {
      if (lineInstanceRef.current) lineInstanceRef.current.destroy();
      if (pieInstanceRef.current) pieInstanceRef.current.destroy();
    };
  }, []);

  return (
    <div className="financeiro-grafico-container">
      <div className="chart-container">
        <h2>Entradas x Saídas - Mês</h2>
        <canvas ref={lineChartRef}></canvas>
      </div>

      <div className="chart-container pie">
        <h2>Distribuição das Saídas</h2>
        <canvas ref={pieChartRef}></canvas>
      </div>
    </div>
  );
}

export default Grafico;
