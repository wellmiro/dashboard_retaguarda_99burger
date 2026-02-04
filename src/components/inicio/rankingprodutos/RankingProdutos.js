import React, { useEffect, useState } from "react";
import "./Styles.css";

// Cores base para as barras. Se houver mais de 5 categorias, elas se repetem.
const coresLista = ["#007BFF", "#28A745", "#FFC107", "#DC3545", "#6F42C1", "#17A2B8", "#FD7E14"];

function RankingProdutos({ pedidosIniciais }) {
  const agora = new Date();
  const primeiroDia = new Date(agora.getFullYear(), agora.getMonth(), 1).toISOString().split('T')[0];
  const hoje = agora.toISOString().split('T')[0];

  const [dataInicio, setDataInicio] = useState(primeiroDia);
  const [dataFim, setDataFim] = useState(hoje);
  const [rankingData, setRankingData] = useState([]);

  const parseDataBR = (dt) => {
    if (!dt) return null;
    if (dt.includes("-")) return new Date(dt.replace(/-/g, '/'));
    const [data, hora] = dt.split(" ");
    const [dia, mes, ano] = data.split("/");
    return new Date(`${ano}-${mes}-${dia} ${hora || "00:00:00"}`);
  };

  useEffect(() => {
    if (!pedidosIniciais || !Array.isArray(pedidosIniciais)) return;

    const faturamentoPorCategoria = {};
    const inicio = new Date(dataInicio + "T00:00:00");
    const fim = new Date(dataFim + "T23:59:59");

    pedidosIniciais.forEach((pedido) => {
      const dtP = parseDataBR(pedido.dt_pedido || pedido.data_pedido);
      
      if (dtP && dtP >= inicio && dtP <= fim) {
        const itens = Array.isArray(pedido.itens) ? pedido.itens : pedido.pedido_itens || [];
        
        itens.forEach((item) => {
          // Usando a mesma lógica de soma dos Cards para bater com o banco (vl_total do item)
          const valorItem = parseFloat(String(item.vl_total || 0).replace(",", "."));
          const categoria = item.categoria || item.nome_categoria || "Outros";
          
          faturamentoPorCategoria[categoria] = (faturamentoPorCategoria[categoria] || 0) + valorItem;
        });
      }
    });

    const ordenados = Object.entries(faturamentoPorCategoria)
      .map(([nome, faturamento]) => ({ nome, faturamento }))
      .sort((a, b) => b.faturamento - a.faturamento);
      // REMOVIDO O .slice(0, 5) para trazer todas as categorias

    setRankingData(ordenados);
  }, [pedidosIniciais, dataInicio, dataFim]);

  const maxF = Math.max(...rankingData.map((r) => r.faturamento), 0);

  return (
    <div className="ranking-produtos-container-geral">
      <div className="ranking-produtos">
        <div className="ranking-header-filtros">
          <h3 className="titulo-secao">Faturamento por Categoria</h3>
          <div className="filtros-container">
            <div className="filtro-item">
              <label>De:</label>
              <input 
                type="date" 
                className="input-estilizado"
                value={dataInicio} 
                onChange={(e) => setDataInicio(e.target.value)} 
              />
            </div>
            <div className="filtro-item">
              <label>Até:</label>
              <input 
                type="date" 
                className="input-estilizado"
                value={dataFim} 
                onChange={(e) => setDataFim(e.target.value)} 
              />
            </div>
          </div>
        </div>

        <div className="ranking-corpo">
          {rankingData.length > 0 ? (
            rankingData.map((item, idx) => (
              <div className="linha-ranking" key={idx}>
                <span className="label-nome">{item.nome}</span>
                <div className="progresso-bg">
                  <div
                    className="progresso-barra"
                    style={{
                      width: maxF > 0 ? `${(item.faturamento / maxF) * 100}%` : "0%",
                      // Usa o operador de resto (%) para ciclar entre as cores se houver muitas categorias
                      backgroundColor: coresLista[idx % coresLista.length],
                    }}
                  ></div>
                </div>
                <span className="valor-negrito">
                  {item.faturamento.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </span>
              </div>
            ))
          ) : (
            <p className="msg-vazia">Nenhum dado encontrado para este período.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default RankingProdutos;