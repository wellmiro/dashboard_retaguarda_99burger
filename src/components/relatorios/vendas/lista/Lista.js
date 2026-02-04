import React, { useEffect, useState } from "react";
import { getPedidos } from "../../../../api/Pedidos";
import dayjs from "dayjs";
import "dayjs/locale/pt-br"; // Importante para o nome do mês em PT-BR
import "./Styles.css";

dayjs.locale("pt-br");

function Lista({ filtroData = {} }) {
  const [totaisPorProdutoMes, setTotaisPorProdutoMes] = useState([]);

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        const res = await getPedidos();
        const pedidosRaw = res.data || [];

        const inicioFiltro = filtroData.inicio ? dayjs(filtroData.inicio).startOf("day") : dayjs().startOf("year");
        const fimFiltro = filtroData.fim ? dayjs(filtroData.fim).endOf("day") : dayjs().endOf("year");

        const mapProdutoMes = new Map();

        pedidosRaw.forEach((pedido) => {
          if (!pedido.dt_pedido) return;

          const partes = pedido.dt_pedido.split(' ')[0].split('/');
          const dataPedido = dayjs(`${partes[2]}-${partes[1]}-${partes[0]}`);

          if (dataPedido.isBefore(inicioFiltro) || dataPedido.isAfter(fimFiltro)) return;

          const mesNome = dataPedido.format("MMMM");

          pedido.itens?.forEach((item) => {
            const produto = item.nome_produto || "Desconhecido";
            const categoria = item.categoria || "Geral";
            const categoria_icone = item.categoria_icone || null;
            const qtd = parseFloat(item.qtd) || 0;
            const valor = parseFloat(item.vl_total) || 0;

            const chave = `${mesNome}-${produto}-${categoria}`;
            const existente = mapProdutoMes.get(chave) || { 
              qtd: 0, total: 0, mes: mesNome, produto, categoria, categoria_icone 
            };

            mapProdutoMes.set(chave, {
              ...existente,
              qtd: existente.qtd + qtd,
              total: existente.total + valor,
            });
          });
        });

        const totaisArray = Array.from(mapProdutoMes.values()).sort((a, b) => b.total - a.total);
        setTotaisPorProdutoMes(totaisArray);
      } catch (error) {
        console.error("Erro ao carregar lista:", error);
      }
    };

    fetchPedidos();
  }, [filtroData]);

  const maxQtd = Math.max(...totaisPorProdutoMes.map((i) => i.qtd), 1);

  const getPerformance = (qtd) => {
    const pct = (qtd / maxQtd) * 100;
    if (pct >= 75) return "verde";
    if (pct >= 50) return "amarelo";
    if (pct >= 25) return "laranja";
    return "vermelho";
  };

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
              <th>Qtd</th>
              <th>Total (R$)</th>
              <th>Perf.</th>
            </tr>
          </thead>
          <tbody>
            {totaisPorProdutoMes.map((item, index) => (
              <tr key={index}>
                <td>{item.mes}</td>
                <td>{item.produto}</td>
                <td>
                  {item.categoria}
                  {item.categoria_icone && <img src={item.categoria_icone} alt="icon" className="categoria-icone"/>}
                </td>
                <td>{item.qtd}</td>
                <td>{item.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                <td><span className={`bolinha ${getPerformance(item.qtd)}`}/></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Lista;