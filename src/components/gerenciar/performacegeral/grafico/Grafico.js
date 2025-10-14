import React, { useEffect, useRef } from 'react';
import { getPedidos } from '../../../../api/Pedidos';
import './Styles.css';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const horasDia = ['10h', '11h', '12h', '13h', '14h', '15h', '16h', '17h', '18h', '19h', '20h', '21h', '22h', '23h'];
const coresPadrao = ['#007BFF', '#28a745', '#ffc107', '#dc3545', '#6c757d', '#17a2b8', '#fd7e14', '#e83e8c'];

const Grafico = () => {
  const graficoFaturamento = useRef(null);
  const graficoVendasHora = useRef(null);
  const graficoPagamento = useRef(null);
  const graficoCategoria = useRef(null);
  const faturamentoChartRef = useRef(null);
  const vendasHoraChartRef = useRef(null);
  const pagamentoChartRef = useRef(null);
  const categoriaChartRef = useRef(null);

  useEffect(() => {
    const fetchDataAndDrawCharts = async () => {
      try {
        const res = await getPedidos();
        const pedidos = res.data;

        const faturamentoMensal = Array(12).fill(0);
        const vendasPorHora = Array(14).fill(0);
        const pagamentosMap = new Map();
        const categoriasMap = new Map();

        if (pedidos && pedidos.length > 0) {
          pedidos.forEach(pedido => {
            const dataString = pedido.dt_pedido;
            const valorString = pedido.vl_total;

            if (dataString && valorString) {
              const vl_total = parseFloat(String(valorString).replace(/[^0-9,.]/g, '').replace(',', '.'));

              let dataParaParse = dataString;
              if (dataString.includes('/')) {
                const partes = dataString.split(' ');
                const dataInvertida = partes[0].split('/').reverse().join('-');
                dataParaParse = `${dataInvertida} ${partes[1] || '00:00:00'}`;
              }

              const dataPedido = new Date(dataParaParse);
              if (isNaN(vl_total) || isNaN(dataPedido.getTime())) return;

              faturamentoMensal[dataPedido.getMonth()] += vl_total;

              const hora = dataPedido.getHours();
              const indiceHora = hora - 10;
              if (indiceHora >= 0 && indiceHora < vendasPorHora.length) vendasPorHora[indiceHora]++;

              const formaPagamento = pedido.forma_pagamento || 'Não Informado';
              pagamentosMap.set(formaPagamento, (pagamentosMap.get(formaPagamento) || 0) + 1);

              if (pedido.itens && Array.isArray(pedido.itens)) {
                pedido.itens.forEach(item => {
                  const categoria = item.categoria || 'Sem Categoria';
                  const vl_item = parseFloat(item.vl_total || 0);
                  categoriasMap.set(categoria, (categoriasMap.get(categoria) || 0) + vl_item);
                });
              }
            }
          });
        }

        const pagamentosLabels = Array.from(pagamentosMap.keys());
        const pagamentosData = Array.from(pagamentosMap.values());
        const categoriasLabels = Array.from(categoriasMap.keys());
        const categoriasData = Array.from(categoriasMap.values());

        const pagamentosDataset = pagamentosData.length > 0 ? pagamentosData : [1];
        const pagamentosLabelSet = pagamentosLabels.length > 0 ? pagamentosLabels : ['Sem Dados'];
        const categoriasDataset = categoriasData.length > 0 ? categoriasData : [1];
        const categoriasLabelSet = categoriasLabels.length > 0 ? categoriasLabels : ['Sem Dados'];

        // --- 1. Faturamento Mensal ---
        if (faturamentoChartRef.current) faturamentoChartRef.current.destroy();
        faturamentoChartRef.current = new Chart(graficoFaturamento.current, {
          type: 'line',
          data: {
            labels: meses,
            datasets: [{
              label: 'Faturamento (R$)',
              data: faturamentoMensal,
              borderColor: coresPadrao[0],
              backgroundColor: 'rgba(0,123,255,0.2)',
              fill: true,
              tension: 0.3
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    return `R$ ${context.raw.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                  }
                }
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  callback: function(value) {
                    return 'R$ ' + value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                  }
                }
              },
              x: { ticks: { display: true } }
            }
          }
        });

        // --- 2. Vendas por Horário ---
        if (vendasHoraChartRef.current) vendasHoraChartRef.current.destroy();
        vendasHoraChartRef.current = new Chart(graficoVendasHora.current, {
          type: 'bar',
          data: { labels: horasDia, datasets: [{ label: 'Pedidos', data: vendasPorHora, backgroundColor: coresPadrao[1] }] },
          options: { responsive: true, plugins: { legend: { display: false } } }
        });

        // --- 3. Vendas por Forma de Pagamento ---
        if (pagamentoChartRef.current) pagamentoChartRef.current.destroy();
        pagamentoChartRef.current = new Chart(graficoPagamento.current, {
          type: 'doughnut',
          data: { labels: pagamentosLabelSet, datasets: [{ data: pagamentosDataset, backgroundColor: coresPadrao.slice(0, pagamentosLabelSet.length) }] },
          options: {
            responsive: true,
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: { label: context => `${context.label}: ${context.raw}` }
              }
            }
          }
        });

        // --- 4. Receita por Categoria (Pizza) ---
        if (categoriaChartRef.current) categoriaChartRef.current.destroy();
        categoriaChartRef.current = new Chart(graficoCategoria.current, {
          type: 'pie',
          data: { labels: categoriasLabelSet, datasets: [{ data: categoriasDataset, backgroundColor: coresPadrao.slice(0, categoriasLabelSet.length) }] },
          options: {
            responsive: true,
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    return `${context.label}: R$ ${context.raw.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                  }
                }
              }
            }
          }
        });

      } catch (error) {
        console.error("Erro fatal na busca de pedidos:", error);
      }
    };

    fetchDataAndDrawCharts();

    return () => {
      if (faturamentoChartRef.current) faturamentoChartRef.current.destroy();
      if (vendasHoraChartRef.current) vendasHoraChartRef.current.destroy();
      if (pagamentoChartRef.current) pagamentoChartRef.current.destroy();
      if (categoriaChartRef.current) categoriaChartRef.current.destroy();
    };
  }, []);

  return (
    <div className="graficos-row">
      <div className="grafico-container">
        <h4>📈 Faturamento Mensal</h4>
        <canvas ref={graficoFaturamento}></canvas>
      </div>

      <div className="grafico-container">
        <h4>🕒 Vendas por Horário</h4>
        <canvas ref={graficoVendasHora}></canvas>
      </div>

      <div className="grafico-container">
        <h4>💳 Vendas por Forma de Pagamento</h4>
        <canvas ref={graficoPagamento}></canvas>
      </div>

      <div className="grafico-container">
        <h4>🏷️ Receita por Categoria de Produto</h4>
        <canvas ref={graficoCategoria}></canvas>
      </div>
    </div>
  );
};

export default Grafico;
