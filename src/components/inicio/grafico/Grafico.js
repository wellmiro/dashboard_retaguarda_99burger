// src/components/inicio/grafico/Grafico.js
import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { getPedidos } from '../../../api/Pedidos';
import './Styles.css';

// Register plugins / elements
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  ChartDataLabels
);

function Grafico() {
  const [barData, setBarData] = useState({
    labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
    datasets: [{ label: 'Faturamento (R$)', data: [0, 0, 0, 0, 0, 0, 0], backgroundColor: 'rgba(0,123,255,0.8)', borderRadius: 6 }]
  });

  const [pieData, setPieData] = useState({
    labels: ['Pix', 'Cartão', 'Dinheiro'],
    datasets: [{ data: [0, 0, 0], backgroundColor: ['#007BFF', '#28a745', '#ffc107'], borderColor: '#fff', borderWidth: 2 }]
  });

  // Função para converter DD/MM/YYYY HH:MM:SS para Date válida
  const parseDataBR = (dt) => {
    if (!dt) return null;
    const [data, hora] = dt.split(' ');
    const [dia, mes, ano] = data.split('/');
    return new Date(`${ano}-${mes}-${dia}T${hora}`);
  };

  useEffect(() => {
    getPedidos().then(res => {
      const pedidos = res.data;
      const hoje = new Date();

      // Filtra pedidos da semana atual (últimos 7 dias)
      const semanaPedidos = pedidos.filter(p => {
        const dataPedido = parseDataBR(p.dt_pedido);
        if (!dataPedido) return false;
        const diffDias = (hoje - dataPedido) / (1000 * 60 * 60 * 24);
        return diffDias >= 0 && diffDias < 7;
      });

      // Calcula faturamento por dia da semana
      const faturamentoSemana = [0, 0, 0, 0, 0, 0, 0]; // Seg-Dom
      semanaPedidos.forEach(p => {
        const dataPedido = parseDataBR(p.dt_pedido);
        if (!dataPedido) return;
        const diaSemana = dataPedido.getDay(); // 0 = Dom, 1 = Seg ...
        const index = diaSemana === 0 ? 6 : diaSemana - 1; // ajustar para Seg=0 ... Dom=6
        faturamentoSemana[index] += parseFloat(p.vl_total || 0);
      });

      setBarData(prev => ({
        ...prev,
        datasets: [{ ...prev.datasets[0], data: faturamentoSemana }]
      }));

      // Calcula formas de pagamento
      const pagamentos = { Pix: 0, Cartão: 0, Dinheiro: 0 };
      semanaPedidos.forEach(p => {
        const fp = p.forma_pagamento;
        if (fp && pagamentos[fp] !== undefined) {
          pagamentos[fp] += parseFloat(p.vl_total || 0);
        }
      });

      setPieData(prev => ({
        ...prev,
        datasets: [{ ...prev.datasets[0], data: [pagamentos.Pix, pagamentos['Cartão'], pagamentos.Dinheiro] }]
      }));
    });
  }, []);

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    devicePixelRatio: window.devicePixelRatio || 2,
    scales: { x: { grid: { display: false } }, y: { beginAtZero: true } },
    plugins: {
      legend: { display: false },
      datalabels: {
        anchor: 'end',
        align: 'end',
        color: 'rgba(0,123,255,0.95)',
        font: { weight: 'bold', size: 11 },
        formatter: (value) => `R$ ${value.toFixed(2)}`,
        clamp: true
      },
      tooltip: { callbacks: { label: (ctx) => `R$ ${ctx.parsed.y.toFixed(2)}` } }
    }
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    devicePixelRatio: window.devicePixelRatio || 2,
    plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, padding: 8 } } }
  };

  return (
    <div className="grafico-row">
      <div className="grafico-container">
        <h4>Faturamento últimos 7 dias</h4>
        <div className="grafico-wrapper">
          <Bar data={barData} options={barOptions} />
        </div>
      </div>

      <div className="grafico-container">
        <h4>Formas de pagamento</h4>
        <div className="grafico-wrapper">
          <Pie data={pieData} options={pieOptions} />
        </div>
      </div>
    </div>
  );
}

export default Grafico;
