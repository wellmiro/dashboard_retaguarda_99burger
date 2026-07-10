import React, { useState, useEffect, useCallback } from "react";
import { getPedidos } from "../../../api/Pedidos";

import "./Styles.css";

function Cards({ filtro, setFiltro, horaAbertura, setHoraAbertura, horaFechamento, setHoraFechamento }) {
  const [pedidosDoDia, setPedidosDoDia] = useState(0);
  const [faturamentoDoDia, setFaturamentoDoDia] = useState(0);
  const [taxaEntrega, setTaxaEntrega] = useState(0);
  const [produtosVendidos, setProdutosVendidos] = useState(0);
  const [boletoAReceber, setBoletoAReceber] = useState(0);

  const [dataEspecifica, setDataEspecifica] = useState(new Date().toISOString().split('T')[0]);

  const parseDataBR = (dt) => {
    if (!dt) return null;
    if (dt.includes("-")) return new Date(dt);
    const [data, hora] = dt.split(" ");
    const [dia, mes, ano] = data.split("/");
    const horario = hora || "00:00:00";
    return new Date(`${ano}-${mes}-${dia}T${horario}`);
  };

  const getIntervalo = useCallback(() => {
    let inicio = new Date();
    let fim = new Date();

    if (filtro === "hoje") {
      inicio = new Date();
    } else if (filtro === "ontem") {
      inicio.setDate(inicio.getDate() - 1);
    } else if (filtro === "data_especifica") {
      const [ano, mes, dia] = dataEspecifica.split("-");
      inicio = new Date(ano, mes - 1, dia);
    }

    const dataBaseFim = new Date(inicio);
    inicio.setHours(...horaAbertura.split(":"), 0, 0);
    fim = dataBaseFim;
    fim.setHours(...horaFechamento.split(":"), 59, 999);

    if (fim.getTime() <= inicio.getTime()) {
      fim.setDate(fim.getDate() + 1);
    }

    return { inicio, fim };
  }, [filtro, dataEspecifica, horaAbertura, horaFechamento]);

  useEffect(() => {
    getPedidos()
      .then((res) => {
        const pedidos = Array.isArray(res.data) ? res.data : res.data?.pedidos || [];
        const { inicio, fim } = getIntervalo();

        const pedidosPeriodo = pedidos.filter((p) => {
          const dataPedido = parseDataBR(p.dt_pedido || p.data_pedido);
          return (
            dataPedido &&
            dataPedido.getTime() >= inicio.getTime() &&
            dataPedido.getTime() <= fim.getTime()
          );
        });

        setPedidosDoDia(pedidosPeriodo.length);

        const pedidosFinalizados = pedidosPeriodo.filter((p) => p.status === "F");

        const totalFaturamento = pedidosFinalizados.reduce(
          (acc, p) => acc + parseFloat(p.vl_total || p.valor_total || 0),
          0
        );
        setFaturamentoDoDia(totalFaturamento);

        const totalEntrega = pedidosFinalizados.reduce(
          (acc, p) => acc + parseFloat(p.vl_entrega || p.valor_entrega || 0),
          0
        );
        setTaxaEntrega(totalEntrega);

        const totalProdutos = pedidosFinalizados.reduce((acc, p) => {
          const itens = Array.isArray(p.itens) ? p.itens : p.itens || p.pedido_itens || [];
          return (
            acc +
            itens.reduce(
              (subAcc, item) => subAcc + parseFloat(item.qtd || item.quantidade || 0),
              0
            )
          );
        }, 0);
        setProdutosVendidos(totalProdutos);

        const totalBoleto = pedidosFinalizados
          .filter((p) => String(p.forma_pagamento || "").toLowerCase() === "boleto")
          .reduce((acc, p) => acc + parseFloat(p.vl_total || p.valor_total || 0), 0);
        setBoletoAReceber(totalBoleto);
      })
      .catch((err) => console.error("Erro ao buscar pedidos:", err));
  }, [getIntervalo]); // Dependência atualizada

  const handleDateChange = (e) => {
    const novaData = e.target.value;
    setDataEspecifica(novaData);
    
    const hoje = new Date().toISOString().split('T')[0];
    const ontem = new Date();
    ontem.setDate(ontem.getDate() - 1);
    const ontemStr = ontem.toISOString().split('T')[0];

    if (novaData === hoje) {
      setFiltro("hoje");
    } else if (novaData === ontemStr) {
      setFiltro("ontem");
    } else {
      setFiltro("data_especifica");
    }
  };

  return (
    <div className="cards-wrapper">
      <div className="filtros">
        <label>
          Período:
          <select value={filtro} onChange={(e) => setFiltro(e.target.value)}>
            <option value="hoje">Hoje</option>
            <option value="ontem">Ontem</option>
            <option value="data_especifica">Data Específica</option>
          </select>
        </label>
        
        <label>
          Abertura:
          <input
            type="time"
            value={horaAbertura}
            onChange={(e) => setHoraAbertura(e.target.value)}
          />
        </label>

        <label>
          Fechamento:
          <input
            type="time"
            value={horaFechamento}
            onChange={(e) => setHoraFechamento(e.target.value)}
          />
        </label>

        <label className="filtro-data-direita">
          Filtrar dia:
          <input
            type="date"
            value={dataEspecifica}
            onChange={handleDateChange}
          />
        </label>
      </div>

      <div className="cards-row">
        <div className="card bg-danger">
          <div className="card-left">
            <div className="card-icon">📦</div>
            <div className="card-info">
              <span className="card-value">{pedidosDoDia}</span>
              <span className="card-label">Pedidos no período</span>
            </div>
          </div>
        </div>

        <div className="card bg-success">
          <div className="card-left">
            <div className="card-icon">💰</div>
            <div className="card-info">
              <span className="card-value">
                R$ {(faturamentoDoDia || 0).toFixed(2)}
              </span>
              <span className="card-label">Faturamento</span>
            </div>
          </div>
        </div>

        <div className="card bg-warning text-dark">
          <div className="card-left">
            <div className="card-icon">🚚</div>
            <div className="card-info">
              <span className="card-value">
                R$ {(taxaEntrega || 0).toFixed(2)}
              </span>
              <span className="card-label">Taxa de entrega</span>
            </div>
          </div>
        </div>

        <div className="card bg-primary">
          <div className="card-left">
            <div className="card-icon">🛒</div>
            <div className="card-info">
              <span className="card-value">{produtosVendidos}</span>
              <span className="card-label">Produtos vendidos</span>
            </div>
          </div>
        </div>

        <div className="card bg-info">
          <div className="card-left">
            <div className="card-icon">🧾</div>
            <div className="card-info">
              <span className="card-value">
                R$ {(boletoAReceber || 0).toFixed(2)}
              </span>
              <span className="card-label">Boleto - A Receber</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cards;