import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import ResumoIA from './ResumoIA';
import './grafico.css';

// Registrando o que é necessário para o Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

function Grafico({ dados = [], todosOsDados = [] }) {
    const coresFixas = ['#ea1d2c', '#007BFF', '#28a745', '#ffc107', '#6f42c1', '#17a2b8', '#fd7e14'];

    const categoriasMap = {};
    dados.forEach(d => {
        const cat = d.categoria_nome || "Outros";
        categoriasMap[cat] = (categoriasMap[cat] || 0) + parseFloat(d.valor || 0);
    });

    const labels = Object.keys(categoriasMap);
    const valores = Object.values(categoriasMap);
    const totalGeral = valores.reduce((a, b) => a + b, 0);

    const dataChart = {
        labels: labels,
        datasets: [{
            data: valores,
            backgroundColor: coresFixas.slice(0, labels.length),
            borderWidth: 2,
            borderColor: "#ffffff",
            cutout: '75%'
        }]
    };

    const chartOptions = {
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: { enabled: true },
            // ESSA PARTE DESATIVA OS NÚMEROS DENTRO DO GRÁFICO
            datalabels: { display: false },
            labels: { render: () => '' } 
        }
    };

    const pendentes = todosOsDados.filter(d => {
        const status = String(d.status || '').toLowerCase();
        return d.pago !== 1 && d.pago !== true && status !== 'pago';
    });

    const formatBRL = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    return (
        <div className="main-dashboard-wrapper">
            {/* CARD ESQUERDO: GRÁFICO E LISTA */}
            <div className="card-custom card-main-stats">
                <div className="stats-grid-internal">
                    <div className="col-visual">
                        <div className="chart-wrapper-fixed">
                            <Doughnut data={dataChart} options={chartOptions} />
                        </div>
                        <div className="ia-summary-box">
                            <ResumoIA dados={dados} />
                        </div>
                    </div>

                    <div className="col-list">
                        <h3 className="section-title">Gastos por Categoria</h3>
                        <div className="scrollable-list">
                            {labels.map((l, i) => (
                                <div key={i} className="list-item-row">
                                    <div className="item-info">
                                        <span className="color-dot" style={{ backgroundColor: coresFixas[i % coresFixas.length] }} />
                                        <span className="item-label">{l}</span>
                                    </div>
                                    <span className="item-value">{formatBRL(categoriasMap[l])}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="card-footer-total">
                    <span className="footer-label">TOTAL DO MÊS</span>
                    <strong className="footer-value">{formatBRL(totalGeral)}</strong>
                </div>
            </div>

            {/* CARD DIREITO: PENDÊNCIAS */}
            <div className="card-custom card-pending-list">
                <div className="pending-header">
                    <h3>🔔 Contas a Pagar</h3>
                    <span className="pending-badge">{pendentes.length}</span>
                </div>
                <div className="scrollable-list">
                    {pendentes.map((p, i) => (
                        <div key={i} className="pending-item">
                            <div className="pending-info">
                                <strong>{p.descricao}</strong>
                                <small>Vence em: {p.data_vencimento}</small>
                            </div>
                            <span className="pending-price">{formatBRL(p.valor)}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Grafico;