// src/components/inicio/rankingprodutos/RankingProdutos.js
import React, { useEffect, useState } from "react";
import { getPedidos } from "../../../api/Pedidos";
import "./Styles.css";

// cores fixas para os top 5 (em ordem)
const coresTop5 = ["#007BFF", "#28A745", "#FFC107", "#DC3545", "#6F42C1"];

function RankingProdutos() {
  const [produtosData, setProdutosData] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getPedidos().then(res => {
      const contagemProdutos = {};

      res.data.forEach(pedido => {
        pedido.itens.forEach(item => {
          const qtd = parseFloat(item.qtd);
          if (contagemProdutos[item.nome_produto]) {
            contagemProdutos[item.nome_produto] += qtd;
          } else {
            contagemProdutos[item.nome_produto] = qtd;
          }
        });
      });

      // transforma em array e ordena decrescente
      const produtosArray = Object.entries(contagemProdutos)
        .map(([nome, vendidos]) => ({ nome, vendidos }))
        .sort((a, b) => b.vendidos - a.vendidos)
        .slice(0, 5); // top 5

      setProdutosData(produtosArray);
      setLoaded(true);
    });
  }, []);

  const maxVendidos = Math.max(...produtosData.map(p => p.vendidos), 0);

  return (
    <div className="ranking-produtos">
      <h3>Ranking de Produtos</h3>
      {produtosData.map((produto, idx) => (
        <div className="produto" key={idx}>
          <span className="nome">{produto.nome}</span>
          <div className="barra-bg">
            <div
              className="barra"
              style={{
                width: loaded ? `${(produto.vendidos / maxVendidos) * 100}%` : "0%",
                backgroundColor: coresTop5[idx], // cor pelo índice do ranking
              }}
            ></div>
          </div>
          <span className="vendidos">{produto.vendidos}</span>
        </div>
      ))}
    </div>
  );
}

export default RankingProdutos;
