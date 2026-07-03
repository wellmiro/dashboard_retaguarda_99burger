import React from "react";
import { Tag, Plus } from "lucide-react";
import "./header.css"

function Header({ mesFiltro, setMesFiltro, anoFiltro, setAnoFiltro, abrirModalCategoria, abrirModalDespesa }) {
    const meses = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    return (
        <div className="area-header-despesa">
            <header className="header-principal">
                <div className="titulo-sessao">
                    <h1>Gerenciar Despesas</h1>
                    <p>Controle seus gastos de forma inteligente</p>
                </div>
                <div className="acoes-header">
                    <button className="btn-secundario" onClick={abrirModalCategoria}>
                        <Tag size={18} /> Categorias
                    </button>
                    <button className="btn-ifood" onClick={abrirModalDespesa}>
                        <Plus size={18} /> Nova Despesa
                    </button>
                </div>
            </header>

            <div className="card-filtros-data">
                <div className="seletor-grupo">
                    <label>MÊS DE REFERÊNCIA</label>
                    <select value={mesFiltro} onChange={(e) => setMesFiltro(e.target.value)}>
                        {meses.map((m, i) => (
                            <option key={i} value={i + 1}>{m}</option>
                        ))}
                    </select>
                </div>
                <div className="seletor-grupo">
                    <label>ANO</label>
                    <select value={anoFiltro} onChange={(e) => setAnoFiltro(e.target.value)}>
                        <option value="2024">2024</option>
                        <option value="2025">2025</option>
                        <option value="2026">2026</option>
                    </select>
                </div>
            </div>
        </div>
    );
}

export default Header;