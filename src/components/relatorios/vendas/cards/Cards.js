import React, { useEffect, useState } from "react";
import { getPedidos } from "../../../../api/Pedidos";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import "./Styles.css";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

function Cards({ filtroData }) {
  const [totalVendido, setTotalVendido] = useState(0);
  const [totalPedidos, setTotalPedidos] = useState(0);
  const [ticketMedio, setTicketMedio] = useState(0);
  const [produtoMaisVendido, setProdutoMaisVendido] = useState("-");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getPedidos();
        let pedidos = res.data || [];

        // Se filtroData estiver vazio, usa todos os pedidos do mês atual
        const inicioFiltro = filtroData?.inicio
          ? dayjs(filtroData.inicio)
          : dayjs().startOf("month");
        const fimFiltro = filtroData?.fim
          ? dayjs(filtroData.fim)
          : dayjs().endOf("month");

        pedidos = pedidos.filter((pedido) => {
          if (!pedido.dt_pedido) return false;

          const [dia, mes, anoHora] = pedido.dt_pedido.split("/");
          const [ano, hora] = anoHora ? anoHora.split(" ") : [new Date().getFullYear(), "00:00"];
          const pedidoData = dayjs(`${ano}-${mes}-${dia}T${hora || "00:00"}`);

          const dataMatch = pedidoData.isSameOrAfter(inicioFiltro) && pedidoData.isSameOrBefore(fimFiltro);

          return dataMatch; // inicialização apenas por data
        });

        if (pedidos.length === 0) {
          setTotalVendido(0);
          setTotalPedidos(0);
          setTicketMedio(0);
          setProdutoMaisVendido("-");
          return;
        }

        let total = 0;
        const produtosMap = new Map();

        pedidos.forEach((pedido) => {
          total += parseFloat(pedido.vl_total || 0);

          if (pedido.itens && Array.isArray(pedido.itens)) {
            pedido.itens.forEach((item) => {
              const nome = item.nome_produto || "Produto Desconhecido";
              const qtd = parseFloat(item.qtd || 0);
              produtosMap.set(nome, (produtosMap.get(nome) || 0) + qtd);
            });
          }
        });

        let maisVendido = "-";
        let maxQtd = 0;
        produtosMap.forEach((qtd, nome) => {
          if (qtd > maxQtd) {
            maxQtd = qtd;
            maisVendido = nome;
          }
        });

        setTotalVendido(total);
        setTotalPedidos(pedidos.length);
        setTicketMedio(total / pedidos.length);
        setProdutoMaisVendido(maisVendido);
      } catch (error) {
        console.error("Erro ao buscar pedidos:", error);
      }
    };

    fetchData();
  }, [filtroData]);

  return (
    <div className="cards-container">
      <div className="card card-total">
        <h3>
          R${" "}
          {totalVendido.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </h3>
        <p>Total Vendido</p>
      </div>
      <div className="card card-pedidos">
        <h3>{totalPedidos}</h3>
        <p>Pedidos</p>
      </div>
      <div className="card card-ticket">
        <h3>
          R${" "}
          {ticketMedio.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </h3>
        <p>Ticket Médio</p>
      </div>
      <div className="card card-produtos">
        <h3>{produtoMaisVendido}</h3>
        <p>Produto Mais Vendido</p>
      </div>
    </div>
  );
}

export default Cards;
