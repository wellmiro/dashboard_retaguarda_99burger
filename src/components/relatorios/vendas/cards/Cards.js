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
        const pedidosRaw = res.data || [];

        const inicioFiltro = filtroData?.inicio ? dayjs(filtroData.inicio).startOf("day") : dayjs().startOf("month");
        const fimFiltro = filtroData?.fim ? dayjs(filtroData.fim).endOf("day") : dayjs().endOf("month");

        // 1. Filtrar os pedidos pela data
        const pedidosFiltrados = pedidosRaw.filter((p) => {
          if (!p.dt_pedido) return false;
          const partes = p.dt_pedido.split(' ')[0].split('/');
          const dataPedido = dayjs(`${partes[2]}-${partes[1]}-${partes[0]}`);
          return dataPedido.isSameOrAfter(inicioFiltro) && dataPedido.isSameOrBefore(fimFiltro);
        });

        let faturamentoReal = 0;
        const produtosMap = new Map();
        const pedidosContados = new Set(); // Para não contar o mesmo pedido duas vezes

        pedidosFiltrados.forEach((pedido) => {
          // Adiciona o ID ao Set para contar pedidos únicos
          pedidosContados.add(pedido.id_pedido);

          // SOMA EXCLUSIVA DOS ITENS (Igual ao seu SELECT SUM(pi.vl_total))
          // Ignoramos completamente o pedido.vl_total aqui
          if (pedido.itens && Array.isArray(pedido.itens)) {
            pedido.itens.forEach((item) => {
              const valorItem = parseFloat(String(item.vl_total || 0).replace(",", "."));
              faturamentoReal += valorItem;

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

        // 2. Define os valores finais baseados na soma dos ITENS
        setTotalVendido(faturamentoReal); 
        setTotalPedidos(pedidosContados.size); // Quantidade real de pedidos únicos
        setTicketMedio(pedidosContados.size > 0 ? faturamentoReal / pedidosContados.size : 0);
        setProdutoMaisVendido(maisVendido);

      } catch (err) {
        console.error("Erro ao buscar pedidos:", err);
      }
    };

    fetchData();
  }, [filtroData]);

  return (
    <div className="cards-container">
      <div className="card card-total">
        <h3>
          {totalVendido.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
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
          {ticketMedio.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
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