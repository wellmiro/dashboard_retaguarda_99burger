// src/components/relatorios/estoque/grafico/Grafico.js
import React, { useEffect, useRef, useState } from "react";
import { Chart, BarElement, CategoryScale, LinearScale, Tooltip, ArcElement } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { getProdutos } from "../../../../api/Produtos";

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, ArcElement, ChartDataLabels);

const Grafico = () => {
  const barChartRef = useRef(null);
  const pieChartRef = useRef(null);
  const barChartInstanceRef = useRef(null);
  const pieChartInstanceRef = useRef(null);

  const [produtos, setProdutos] = useState([]);

  useEffect(() => {
    const fetchProdutos = async () => {
      try {
        const res = await getProdutos();
        const produtosData = res.data || [];
        setProdutos(produtosData);
      } catch (err) {
        console.error("Erro ao buscar produtos:", err);
      }
    };

    fetchProdutos();
  }, []);

  useEffect(() => {
    if (produtos.length === 0) return;

    // --- GRÁFICO DE BARRAS (Top 5 produtos por valor total) ---
    const barCtx = barChartRef.current.getContext("2d");
    const top5 = [...produtos]
      .sort((a, b) => b.qtd * parseFloat(b.preco) - a.qtd * parseFloat(a.preco))
      .slice(0, 5);

    const barData = {
      labels: top5.map(p => p.nome),
      datasets: [{
        label: 'Valor Total',
        data: top5.map(p => p.qtd * parseFloat(p.preco)),
        backgroundColor: '#3b82f6'
      }]
    };

    if (barChartInstanceRef.current) barChartInstanceRef.current.destroy();

    barChartInstanceRef.current = new Chart(barCtx, {
      type: 'bar',
      data: barData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          datalabels: {
            color: '#111827',
            anchor: 'end',
            align: 'end',
            backgroundColor: 'rgba(255,255,255,0.8)',
            borderRadius: 4,
            padding: 4,
            font: { weight: '500', size: 12 },
            formatter: value => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
          },
          tooltip: {
            backgroundColor: 'rgba(0,0,0,0.7)',
            titleFont: { weight: '600' },
            bodyFont: { weight: '500' }
          }
        },
        scales: { y: { beginAtZero: true } }
      }
    });

    // --- GRÁFICO DE PIZZA (por categoria) ---
    const pieCtx = pieChartRef.current.getContext("2d");
    const categoryTotals = produtos.reduce((acc, p) => {
      acc[p.categoria] = (acc[p.categoria] || 0) + p.qtd * parseFloat(p.preco);
      return acc;
    }, {});

    const pieData = {
      labels: Object.keys(categoryTotals),
      datasets: [{
        data: Object.values(categoryTotals),
        backgroundColor: ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6'],
        borderColor: '#fff',
        borderWidth: 2
      }]
    };

    if (pieChartInstanceRef.current) pieChartInstanceRef.current.destroy();

    pieChartInstanceRef.current = new Chart(pieCtx, {
      type: 'pie',
      data: pieData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { font: { family: 'Inter', weight: '500' } } },
          datalabels: {
            color: '#111827',
            backgroundColor: 'rgba(255,255,255,0.8)',
            borderRadius: 4,
            padding: 4,
            font: { weight: '500', size: 12 },
            formatter: (value, ctx) => {
              const label = ctx.chart.data.labels[ctx.dataIndex];
              return `${label}\n${value.toLocaleString('pt-BR',{ style:'currency', currency:'BRL' })}`;
            }
          },
          tooltip: { backgroundColor: 'rgba(0,0,0,0.7)' }
        }
      }
    });

  }, [produtos]);

  return (
    <div className="charts-grid">
      <div className="chart-card"><canvas ref={barChartRef}></canvas></div>
      <div className="chart-card"><canvas ref={pieChartRef}></canvas></div>
    </div>
  );
};

export default Grafico;
