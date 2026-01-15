import React, { useEffect, useState } from "react";
import { getPedidos } from "../../../api/Pedidos";
import "./Styles.css";

// cores fixas para os top 5 (em ordem)
const coresTop5 = ["#007BFF", "#28A745", "#FFC107", "#DC3545", "#6F42C1"];

function RankingProdutos() {
  const [produtosData, setProdutosData] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getPedidos()
      .then((res) => {
        const pedidos = Array.isArray(res.data) ? res.data : res.data?.pedidos || [];
        const contagemProdutos = {};

        pedidos.forEach((pedido) => {
          const itens = Array.isArray(pedido.itens) ? pedido.itens : pedido.pedido_itens || [];
          itens.forEach((item) => {
            const qtd = parseFloat(item.qtd || item.quantidade || 0);
            const nome = item.nome_produto || item.nome || "Produto Desconhecido";
            if (contagemProdutos[nome]) {
              contagemProdutos[nome] += qtd;
            } else {
              contagemProdutos[nome] = qtd;
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
      })
      .catch((err) => {
        console.error("Erro ao buscar pedidos:", err);
        setProdutosData([]);
        setLoaded(true);
      });
  }, []);

  const maxVendidos = Math.max(...produtosData.map((p) => p.vendidos), 0);

  return (
    <div className="ranking-produtos">
      <h3>Ranking de Produtos</h3>
      {produtosData.length > 0 ? (
        produtosData.map((produto, idx) => (
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
        ))
      ) : (
        <p style={{ textAlign: "center", marginTop: 20 }}>Sem dados para o período</p>
      )}
    </div>
  );
}

export default RankingProdutos;
