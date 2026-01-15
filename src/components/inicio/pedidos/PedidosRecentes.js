import React, { useState, useEffect } from 'react';
import { getPedidos } from '../../../api/Pedidos';
import './Styles.css';

function PedidosRecentes({ filtro = "hoje", horaAbertura = "17:00", horaFechamento = "03:50" }) {
  const [pedidos, setPedidos] = useState([]);
  const [expandido, setExpandido] = useState(false);

  const parseData = (dt) => {
    if (!dt) return null;
    if (dt.includes('-')) return new Date(dt);
    const [data, hora] = dt.split(' ');
    const [dia, mes, ano] = data.split('/');
    const horario = hora || '00:00:00';
    return new Date(`${ano}-${mes}-${dia}T${horario}`);
  };

  const getIntervalo = () => {
    const inicio = new Date();
    const fim = new Date();

    if (filtro === "hoje") {
      const [hInicio, mInicio] = horaAbertura.split(':');
      const [hFim, mFim] = horaFechamento.split(':');
      inicio.setHours(parseInt(hInicio), parseInt(mInicio), 0, 0);
      fim.setHours(parseInt(hFim), parseInt(mFim), 59, 999);
      if (fim.getTime() <= inicio.getTime()) fim.setDate(fim.getDate() + 1);
    } else if (filtro === "ontem") {
      inicio.setDate(inicio.getDate() - 1);
      fim.setDate(fim.getDate() - 1);
      const [hInicio, mInicio] = horaAbertura.split(':');
      const [hFim, mFim] = horaFechamento.split(':');
      inicio.setHours(parseInt(hInicio), parseInt(mInicio), 0, 0);
      fim.setHours(parseInt(hFim), parseInt(mFim), 59, 999);
      if (fim.getTime() <= inicio.getTime()) fim.setDate(fim.getDate() + 1);
    }
    return { inicio, fim };
  };

  useEffect(() => {
    getPedidos()
      .then(res => {
        // Linha corrigida para evitar erro se res.data não for array
        const todosPedidos = Array.isArray(res.data) ? res.data : (res.data ? [res.data] : []);
        const { inicio, fim } = getIntervalo();

        const pedidosPeriodo = todosPedidos
          .filter(p => {
            const dt = parseData(p.dt_pedido || p.data_pedido);
            if (!dt) return false;
            return dt.getTime() >= inicio.getTime() && dt.getTime() <= fim.getTime();
          })
          .sort((a, b) => parseData(b.dt_pedido || b.data_pedido) - parseData(a.dt_pedido || a.data_pedido));

        setPedidos(pedidosPeriodo);
      })
      .catch(err => console.error('Erro ao buscar pedidos:', err));
  }, [filtro, horaAbertura, horaFechamento]);

  const toggleExpandido = () => setExpandido(!expandido);

  const formatCurrency = (val) =>
    Number(val).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const getStatusClass = (status) => {
    switch (status) {
      case 'A': return 'andamento';
      case 'F': return 'finalizado';
      case 'C': return 'cancelado';
      default: return status.toLowerCase();
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'A': return 'Em Andamento';
      case 'F': return 'Finalizado';
      case 'C': return 'Cancelado';
      default: return status;
    }
  };

  return (
    <div className="lista-container pedidos-recentes">
      <h3>Pedidos Recentes</h3>
      <table className="lista-estoque pedidos-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Cliente</th>
            <th>Valor</th>
            <th>Status</th>
            <th>Forma Pagamento</th>
            <th>Horário</th>
          </tr>
        </thead>
        <tbody>
          {pedidos.length === 0 ? (
            <tr>
              <td colSpan="6" style={{ textAlign: "center" }}>
                Nenhum pedido encontrado
              </td>
            </tr>
          ) : (
            (expandido ? pedidos : pedidos.slice(0, 5)).map((pedido, idx) => {
              const horario = parseData(pedido.dt_pedido || pedido.data_pedido);
              const horaStr = horario ? `${horario.getHours()}:${String(horario.getMinutes()).padStart(2,'0')}` : '--:--';
              const formaPagamento = pedido.forma_pagamento || 'Sem Forma';

              return (
                <tr key={pedido.id_pedido}>
                  <td>{pedido.id_pedido}</td>
                  <td>{pedido.nome_cliente && pedido.nome_cliente !== '-' ? pedido.nome_cliente : `Pedido ${pedido.id_pedido}`}</td>
                  <td>{formatCurrency(pedido.vl_total)}</td>
                  <td className={getStatusClass(pedido.status)}>
                    <span className="status-badge">{getStatusLabel(pedido.status)}</span>
                  </td>
                  <td>{formaPagamento}</td>
                  <td>{horaStr}</td>
                  <td>
                    {idx === 0 && pedidos.length > 5 && (
                      <button className="btn-expand" onClick={toggleExpandido}>
                        {expandido ? '▲' : '▼'}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

export default PedidosRecentes;
