import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import { getPedidos } from "../../../../api/Pedidos";
import dayjs from "dayjs";
import "./Styles.css";

function Grafico({ filtroData = {} }) {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const [pedidos, setPedidos] = useState([]);

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        const res = await getPedidos();
        setPedidos(res.data);
      } catch (error) {
        console.error("Erro ao buscar pedidos:", error);
      }
    };
    fetchPedidos();
  }, []);

  useEffect(() => {
    if (!pedidos || pedidos.length === 0) return;

    const inicioFiltro = filtroData.inicio ? dayjs(filtroData.inicio) : dayjs().startOf("year");
    const fimFiltro = filtroData.fim ? dayjs(filtroData.fim) : dayjs().endOf("year");

    const vendasPorDia = {};
    pedidos.forEach((pedido) => {
      if (!pedido.dt_pedido) return;
      const [dia, mes, anoHora] = pedido.dt_pedido.split("/");
      const [ano, hora] = anoHora.split(" ");
      const pedidoData = dayjs(`${ano}-${mes}-${dia}T${hora || "00:00"}`);

      const tipoMatch =
        !filtroData.tipo || filtroData.tipo === "todas" ||
        (filtroData.tipo === "presencial" && (!pedido.vl_entrega || parseFloat(pedido.vl_entrega) === 0)) ||
        (filtroData.tipo === "delivery" && pedido.vl_entrega && parseFloat(pedido.vl_entrega) > 0) ||
        (filtroData.tipo === "online" && pedido.nome_login && !pedido.nome_cliente);

      const dataMatch = pedidoData.isSameOrAfter(inicioFiltro) && pedidoData.isSameOrBefore(fimFiltro);

      if (tipoMatch && dataMatch) {
        const dataLabel = pedidoData.format("DD/MM/YYYY");
        vendasPorDia[dataLabel] = (vendasPorDia[dataLabel] || 0) + parseFloat(pedido.vl_total || 0);
      }
    });

    const labels = Object.keys(vendasPorDia);
    const dataValues = Object.values(vendasPorDia);

    const ctx = chartRef.current.getContext("2d");

    if (chartInstanceRef.current) chartInstanceRef.current.destroy();

    chartInstanceRef.current = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Vendas (R$)",
            data: dataValues,
            backgroundColor: "rgba(59, 130, 246, 0.2)",
            borderColor: "#3b82f6",
            borderWidth: 2,
            tension: 0.3,
            fill: true,
            pointBackgroundColor: "#3b82f6",
            pointBorderColor: "#1e40af",
            pointRadius: 5,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function (context) {
                return `R$ ${context.raw.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
              },
            },
          },
        },
        scales: {
          y: { beginAtZero: true },
          x: { beginAtZero: true },
        },
      },
    });

    return () => {
      if (chartInstanceRef.current) chartInstanceRef.current.destroy();
    };
  }, [pedidos, filtroData]);

  return (
    <div className="chart-container">
      <canvas ref={chartRef}></canvas>
    </div>
  );
}

export default Grafico;
