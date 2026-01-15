import React, { useEffect, useState } from "react";
import { getPedidos } from "../../../../api/Pedidos";
import dayjs from "dayjs";
import "./Styles.css";

function Lista({ filtroData = {} }) {
  const [totaisPorProdutoMes, setTotaisPorProdutoMes] = useState([]);

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        const res = await getPedidos();
        let pedidos = res.data || [];

        const inicioFiltro = filtroData.inicio ? dayjs(filtroData.inicio) : dayjs().startOf("year");
        const fimFiltro = filtroData.fim ? dayjs(filtroData.fim) : dayjs().endOf("year");

        pedidos = pedidos.filter((pedido) => {
          if (!pedido.dt_pedido) return false;
          const [dia, mes, anoHora] = pedido.dt_pedido.split("/");
          const [ano, hora] = anoHora.split(" ");
          const pedidoData = dayjs(`${ano}-${mes}-${dia}T${hora || "00:00"}`);

          const tipoMatch =
            !filtroData.tipo || filtroData.tipo === "todas" ||
            (filtroData.tipo === "presencial" && (!pedido.vl_entrega || parseFloat(pedido.vl_entrega) === 0)) ||
            (filtroData.tipo === "delivery" && pedido.vl_entrega && parseFloat(pedido.vl_entrega) > 0) ||
            (filtroData.tipo === "online" && pedido.nome_login && !pedido.nome_cliente);

          return tipoMatch && pedidoData.isSameOrAfter(inicioFiltro) && pedidoData.isSameOrBefore(fimFiltro);
        });

        const mapProdutoMes = new Map();

        pedidos.forEach((pedido) => {
          let mesNome = "Desconhecido";
          if (pedido.dt_pedido) {
            const [dia, mes, anoHora] = pedido.dt_pedido.split("/");
            if (anoHora) {
              const [ano, hora] = anoHora.split(" ");
              const dataObj = new Date(`${ano}-${mes}-${dia}T${hora}`);
              if (!isNaN(dataObj)) mesNome = dataObj.toLocaleString("pt-BR", { month: "long" });
            }
          }

          pedido.itens?.forEach((item) => {
            const produto = item.nome_produto || "Produto Desconhecido";
            const categoria = item.categoria || "Sem Categoria";
            const categoria_icone = item.categoria_icone || null;
            const qtd = parseFloat(item.qtd) || 0;
            const valor = parseFloat(item.vl_total) || 0;

            const chave = `${mesNome}-${produto}-${categoria}`;
            const existente = mapProdutoMes.get(chave) || { qtd: 0, total: 0, mes: mesNome, produto, categoria, categoria_icone };

            mapProdutoMes.set(chave, {
              qtd: existente.qtd + qtd,
              total: existente.total + valor,
              mes: mesNome,
              produto,
              categoria,
              categoria_icone,
            });
          });
        });

        const totaisArray = Array.from(mapProdutoMes.values()).sort((a, b) => b.total - a.total);
        setTotaisPorProdutoMes(totaisArray);
      } catch (error) {
        console.error("Erro ao buscar pedidos:", error);
      }
    };

    fetchPedidos();
  }, [filtroData]);

  const getPerformanceClass = (qtd, maxQtd) => {
    const pct = (qtd / maxQtd) * 100;
    if (pct >= 75) return "verde";
    if (pct >= 50) return "amarelo";
    if (pct >= 25) return "laranja";
    return "vermelho";
  };

  const maxQtd = Math.max(...totaisPorProdutoMes.map((item) => item.qtd), 1);

  return (
    <div className="lista-container">
      <h3>Total Vendido por Produto / Mês</h3>
      <div className="lista-scroll">
        <table className="lista-vendas">
          <thead>
            <tr>
              <th>Mês</th>
              <th>Produto</th>
              <th>Categoria</th>
              <th>Qtd Total</th>
              <th>Valor Total (R$)</th>
              <th>Performance</th>
            </tr>
          </thead>
          <tbody>
            {totaisPorProdutoMes.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center" }}>
                  Nenhum total encontrado
                </td>
              </tr>
            ) : (
              totaisPorProdutoMes.map((item, index) => (
                <tr key={index}>
                  <td className="mes-coluna">{item.mes}</td>
                  <td>{item.produto}</td>
                  <td>
                    {item.categoria}
                    {item.categoria_icone && (
                      <img src={item.categoria_icone} alt={item.categoria} className="categoria-icone"/>
                    )}
                  </td>
                  <td>{item.qtd.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}</td>
                  <td>{item.total.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td>
                    <span className={`bolinha ${getPerformanceClass(item.qtd, maxQtd)}`} title={`Performance: ${getPerformanceClass(item.qtd, maxQtd)}`}/>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Lista;
