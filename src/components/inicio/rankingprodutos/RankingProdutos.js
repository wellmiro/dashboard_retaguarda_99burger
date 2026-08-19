import React, { useEffect, useState } from "react";
import "./Styles.css";

const coresLista = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#f97316"];

function RankingProdutos({ pedidosIniciais }) {
  const agora = new Date();
  const primeiroDia = new Date(agora.getFullYear(), agora.getMonth(), 1).toISOString().split('T')[0];
  const hoje = agora.toISOString().split('T')[0];

  const [dataInicio, setDataInicio] = useState(primeiroDia);
  const [dataFim, setDataFim] = useState(hoje);
  const [rankingData, setRankingData] = useState([]);
  const [totalGeral, setTotalGeral] = useState(0);

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
    let somaTotal = 0;
    const inicio = new Date(dataInicio + "T00:00:00");
    const fim = new Date(dataFim + "T23:59:59");

    pedidosIniciais.forEach((pedido) => {
      const dtP = parseDataBR(pedido.dt_pedido || pedido.data_pedido);
      if (dtP && dtP >= inicio && dtP <= fim) {
        const itens = Array.isArray(pedido.itens) ? pedido.itens : pedido.pedido_itens || [];
        itens.forEach((item) => {
          const valorItem = parseFloat(String(item.vl_total || 0).replace(",", "."));
          const categoria = item.categoria || item.nome_categoria || "Outros";
          faturamentoPorCategoria[categoria] = (faturamentoPorCategoria[categoria] || 0) + valorItem;
          somaTotal += valorItem;
        });
      }
    });

    const ordenados = Object.entries(faturamentoPorCategoria)
      .map(([nome, faturamento]) => ({ nome, faturamento }))
      .sort((a, b) => b.faturamento - a.faturamento);

    setRankingData(ordenados);
    setTotalGeral(somaTotal);
  }, [pedidosIniciais, dataInicio, dataFim]);

  const maxF = Math.max(...rankingData.map((r) => r.faturamento), 1);

  return (
    <div className="ranking-container-geral">
      <div className="ranking-card">
        <div className="ranking-header">
          <h3 className="ranking-titulo">Faturamento por Categoria</h3>
          <div className="ranking-filtros">
            <div className="filtro-item">
              <label>De:</label>
              <input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
            </div>
            <div className="filtro-item">
              <label>Até:</label>
              <input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="ranking-lista">
          {rankingData.map((item, idx) => {
             const percentual = ((item.faturamento / totalGeral) * 100).toFixed(1);
             return (
              <div className="ranking-item" key={idx}>
                <div className="ranking-info-topo">
                  <span className="categoria-nome">{item.nome}</span>
                </div>
                
                <div className="ranking-barra-row">
                  <div className="barra-fundo">
                    <div
                      className="barra-cor"
                      style={{
                        width: `${(item.faturamento / maxF) * 100}%`,
                        backgroundColor: coresLista[idx % coresLista.length],
                      }}
                    >
                      <span className="barra-percentual">{percentual}%</span>
                    </div>
                  </div>
                  <span className="categoria-valor">
                    {item.faturamento.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="ranking-footer">
          <span className="footer-label">TOTAL VENDIDO</span>
          <span className="footer-valor">
            {totalGeral.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </span>
        </div>
      </div>
    </div>
  );
}

export default RankingProdutos;