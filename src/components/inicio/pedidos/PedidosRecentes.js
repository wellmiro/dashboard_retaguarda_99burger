// src/components/pedidos/PedidosRecentes.js
import React, { useState, useEffect } from 'react';
import { getPedidos } from '../../../api/Pedidos';
import './Styles.css';

function PedidosRecentes() {
  const [pedidos, setPedidos] = useState([]);

  useEffect(() => {
    getPedidos().then(res => {
      const ultimosPedidos = res.data
        .sort((a, b) => b.id_pedido - a.id_pedido)
        .slice(0, 5);
      setPedidos(ultimosPedidos);
    });
  }, []);

  const formatCurrency = (val) =>
    Number(val).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const getStatusClass = (status) => {
    switch (status) {
      case 'A':
        return 'andamento';
      case 'F':
        return 'finalizado';
      case 'C':
        return 'cancelado';
      default:
        return status.toLowerCase();
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'A':
        return 'Em Andamento';
      case 'F':
        return 'Finalizado';
      case 'C':
        return 'Cancelado';
      default:
        return status;
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
          </tr>
        </thead>
        <tbody>
          {pedidos.length === 0 ? (
            <tr>
              <td colSpan="4" style={{ textAlign: "center" }}>
                Nenhum pedido encontrado
              </td>
            </tr>
          ) : (
            pedidos.map((pedido) => (
              <tr key={pedido.id_pedido}>
                <td className="quantity">{pedido.id_pedido}</td>
                <td>{pedido.nome_cliente && pedido.nome_cliente !== '-' ? pedido.nome_cliente : `Pedido ${pedido.id_pedido}`}</td>
                <td className="total-value">{formatCurrency(pedido.vl_total)}</td>
                <td className={`status ${getStatusClass(pedido.status)}`}>
                  {getStatusLabel(pedido.status)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default PedidosRecentes;
