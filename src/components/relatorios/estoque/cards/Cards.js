// src/components/estoque/cards/Cards.js
import React from "react";
import "./Styles.css";

function Cards({ produtos }) {
  // Agora produtos vem por props já filtrado
  const totalItens = produtos.length;
  const qtdTotal = produtos.reduce((sum, p) => sum + Number(p.qtd), 0);
  const valorTotal = produtos.reduce(
    (sum, p) => sum + Number(p.qtd) * Number(p.preco),
    0
  );

  const top5Valor = [...produtos]
    .sort((a, b) => Number(b.qtd) * Number(b.preco) - Number(a.qtd) * Number(a.preco))
    .slice(0, 5)
    .reduce((sum, p) => sum + Number(p.qtd) * Number(p.preco), 0);

  const formatCurrency = (val) =>
    val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div className="cards-container">
      <div
        className="card card-total"
        data-tooltip="Número total de produtos cadastrados no sistema."
      >
        <h3>{totalItens}</h3>
        <p>Total de Itens</p>
      </div>

      <div
        className="card card-pedidos"
        data-tooltip="Soma da quantidade de todos os produtos disponíveis."
      >
        <h3>{qtdTotal}</h3>
        <p>Qtd. Total</p>
      </div>

      <div
        className="card card-ticket"
        data-tooltip="Valor total de todos os produtos em estoque."
      >
        <h3>{formatCurrency(valorTotal)}</h3>
        <p>Valor Total</p>
      </div>

      <div
        className="card card-produtos"
        data-tooltip="Soma do valor total dos 5 produtos com maior valor (quantidade x preço unitário)."
      >
        <h3>{formatCurrency(top5Valor)}</h3>
        <p>Top 5 Valor</p>
      </div>
    </div>
  );
}

export default Cards;
