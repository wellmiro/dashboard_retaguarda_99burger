// src/components/gerenciar/performacegeral/cards/Cards.js
import React, { useEffect, useState } from 'react';
import { getPedidos } from '../../../../api/Pedidos';
import './Styles.css';

function Cards() {
  const [totalPedidos, setTotalPedidos] = useState(0);
  const [faturamento, setFaturamento] = useState(0);
  const [ticketMedio, setTicketMedio] = useState(0);
  const [topProdutoValor, setTopProdutoValor] = useState(0);

  useEffect(() => {
    getPedidos().then(res => {
      const pedidos = res.data;

      // Total histórico de pedidos
      setTotalPedidos(pedidos.length);

      // Faturamento geral
      const totalFaturamento = pedidos.reduce(
        (acc, pedido) => acc + parseFloat(pedido.vl_total || 0),
        0
      );
      setFaturamento(totalFaturamento);

      // Ticket médio geral
      const ticket = pedidos.length ? totalFaturamento / pedidos.length : 0;
      setTicketMedio(ticket);

      // Valor vendido do top produto
      const contagemProdutos = {};
      pedidos.forEach(pedido => {
        pedido.itens.forEach(item => {
          if (contagemProdutos[item.nome_produto]) {
            contagemProdutos[item.nome_produto] += parseFloat(item.vl_unitario || 0) * parseFloat(item.qtd || 0);
          } else {
            contagemProdutos[item.nome_produto] = parseFloat(item.vl_unitario || 0) * parseFloat(item.qtd || 0);
          }
        });
      });
      const topValor = Math.max(...Object.values(contagemProdutos), 0);
      setTopProdutoValor(topValor);
    });
  }, []);

  // Formata valores em R$
  const formatValor = valor =>
    valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="cards-row">
      <div className="metric-card bg-primary">
        <i className="fas fa-receipt"></i>
        <h4>{formatValor(totalPedidos)}</h4>
        <p>Total de Pedidos (Geral)</p>
      </div>
      <div className="metric-card bg-success">
        <i className="fas fa-dollar-sign"></i>
        <h4>R$ {formatValor(faturamento)}</h4>
        <p>Faturamento (Geral)</p>
      </div>
      <div className="metric-card bg-warning text-dark">
        <i className="fas fa-chart-line"></i>
        <h4>R$ {formatValor(ticketMedio)}</h4>
        <p>Ticket Médio (Geral)</p>
      </div>
      <div className="metric-card bg-info text-dark">
        <i className="fas fa-box"></i>
        <h4>R$ {formatValor(topProdutoValor)}</h4>
        <p>Valor Vendido do Top Produto (Geral)</p>
      </div>
    </div>
  );
}

export default Cards;
