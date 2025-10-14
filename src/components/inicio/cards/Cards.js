// src/components/inicio/cards/Cards.js
import React, { useState, useEffect } from "react";
import { getPedidos } from "../../../api/Pedidos";
import "./Styles.css";

function Cards() {
  const [pedidosDoDia, setPedidosDoDia] = useState(0);
  const [faturamentoDoDia, setFaturamentoDoDia] = useState(0);
  const [taxaEntrega, setTaxaEntrega] = useState(0);
  const [produtosVendidos, setProdutosVendidos] = useState(0);

  // Função que interpreta datas no formato BR ou ISO automaticamente
  const parseDataBR = (dt) => {
    if (!dt) return null;

    // Se já vier no formato ISO (2025-10-04T13:20:00)
    if (dt.includes("-")) return new Date(dt);

    // Caso contrário, assume formato BR (04/10/2025 13:20:00)
    const [data, hora] = dt.split(" ");
    const [dia, mes, ano] = data.split("/");
    return new Date(`${ano}-${mes}-${dia}T${hora}`);
  };

  useEffect(() => {
    getPedidos()
      .then((res) => {
        const pedidos = res.data || [];
        console.log("📦 Retorno da API de Pedidos:", pedidos);

        const hoje = new Date();
        const pedidosHoje = pedidos.filter((p) => {
          const dataPedido = parseDataBR(p.dt_pedido || p.data_pedido);
          if (!dataPedido) return false;
          return (
            dataPedido.getDate() === hoje.getDate() &&
            dataPedido.getMonth() === hoje.getMonth() &&
            dataPedido.getFullYear() === hoje.getFullYear()
          );
        });

        console.log("📅 Pedidos de hoje:", pedidosHoje);

        // Total de pedidos do dia
        setPedidosDoDia(pedidosHoje.length);

        // Faturamento total (somando vl_total)
        const totalFaturamento = pedidosHoje.reduce(
          (acc, p) => acc + parseFloat(p.vl_total || p.valor_total || 0),
          0
        );
        setFaturamentoDoDia(totalFaturamento);

        // Taxa de entrega
        const totalEntrega = pedidosHoje.reduce(
          (acc, p) => acc + parseFloat(p.vl_entrega || p.valor_entrega || 0),
          0
        );
        setTaxaEntrega(totalEntrega);

        // Total de produtos vendidos (somando qtd de itens)
        const totalProdutos = pedidosHoje.reduce((acc, p) => {
          const itens = p.itens || p.pedido_itens || [];
          return (
            acc +
            itens.reduce(
              (subAcc, item) => subAcc + parseFloat(item.qtd || item.quantidade || 0),
              0
            )
          );
        }, 0);
        setProdutosVendidos(totalProdutos);
      })
      .catch((err) => {
        console.error("❌ Erro ao buscar pedidos:", err);
      });
  }, []);

  return (
    <div className="cards-row">
      <div className="card bg-danger">
        <div className="card-left">
          <div className="card-icon">📦</div>
          <div className="card-info">
            <span className="card-value">{pedidosDoDia}</span>
            <span className="card-label">Pedidos do dia</span>
          </div>
        </div>
      </div>

      <div className="card bg-success">
        <div className="card-left">
          <div className="card-icon">💰</div>
          <div className="card-info">
            <span className="card-value">
              R$ {(faturamentoDoDia || 0).toFixed(2)}
            </span>
            <span className="card-label">Faturamento do dia</span>
          </div>
        </div>
      </div>

      <div className="card bg-warning text-dark">
        <div className="card-left">
          <div className="card-icon">🚚</div>
          <div className="card-info">
            <span className="card-value">
              R$ {(taxaEntrega || 0).toFixed(2)}
            </span>
            <span className="card-label">Taxa de entrega</span>
          </div>
        </div>
      </div>

      <div className="card bg-primary">
        <div className="card-left">
          <div className="card-icon">🛒</div>
          <div className="card-info">
            <span className="card-value">{produtosVendidos}</span>
            <span className="card-label">Produtos vendidos</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cards;
