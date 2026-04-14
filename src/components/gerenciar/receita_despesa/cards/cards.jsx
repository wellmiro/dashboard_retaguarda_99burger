import React from "react";
import "./cards.css";

function Cards({ dados = [] }) {
    // Soma o que está com status 'A' (A Pagar)
    const aPagar = dados
        .filter(d => d.status === 'A')
        .reduce((acc, curr) => acc + Number(curr.valor), 0);

    // Soma o que está com status 'P' (Total Pago)
    const totalPago = dados
        .filter(d => d.status === 'P')
        .reduce((acc, curr) => acc + Number(curr.valor), 0);

    // Movimentação: soma de tudo (A Pagar + Pago)
    const movimentacao = aPagar + totalPago;

    const formatBRL = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    return (
        <div className="container-cads">
            <div className="cad-item pendente">
                <div className="barra-lateral" />
                <div className="conteudo-cad">
                    <span className="titulo-cad">A PAGAR</span>
                    <h2 className="valor-cad">{formatBRL(aPagar)}</h2>
                </div>
            </div>

            <div className="cad-item pago">
                <div className="barra-lateral" />
                <div className="conteudo-cad">
                    <span className="titulo-cad">TOTAL PAGO</span>
                    <h2 className="valor-cad">{formatBRL(totalPago)}</h2>
                </div>
            </div>

            <div className="cad-item movimentacao">
                <div className="barra-lateral" />
                <div className="conteudo-cad">
                    <span className="titulo-cad">MOVIMENTAÇÃO</span>
                    <h2 className="valor-cad">{formatBRL(movimentacao)}</h2>
                </div>
            </div>
        </div>
    );
}

export default Cards;