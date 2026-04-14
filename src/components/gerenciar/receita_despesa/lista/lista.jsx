import React, { useState } from "react";
import api from "../../../../api/Despesas";
import { Trash2, Pencil, Search, CheckCircle } from "lucide-react";
import "./lista.css";

function Lista({ dados, onRefresh, onEdit }) {
    const [filtroStatus, setFiltroStatus] = useState("TUDO");
    const [busca, setBusca] = useState("");

    const formatBRL = (v) => 
        Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    const dadosExibidos = dados.filter(d => {
        const matchStatus = filtroStatus === "TUDO" || d.status === filtroStatus;
        const matchBusca = d.descricao.toLowerCase().includes(busca.toLowerCase());
        return matchStatus && matchBusca;
    });

    const handlePagar = async (id) => {
        try {
            await api.pagarDespesa(id);
            onRefresh();
        } catch (e) {
            alert("Erro ao baixar despesa");
        }
    };

    const handleExcluir = async (id) => {
        if (window.confirm("Deseja realmente excluir este lançamento?")) {
            try {
                await api.deleteDespesa(id);
                onRefresh();
            } catch (e) {
                alert("Erro ao excluir");
            }
        }
    };

    return (
        <div className="sessao-tabela">
            <div className="tabela-header-filtros">
                <div className="tabs-status">
                    <button 
                        className={filtroStatus === 'TUDO' ? 'active' : ''} 
                        onClick={() => setFiltroStatus('TUDO')}>Todos</button>
                    <button 
                        className={filtroStatus === 'A' ? 'active' : ''} 
                        onClick={() => setFiltroStatus('A')}>Pendentes</button>
                    <button 
                        className={filtroStatus === 'P' ? 'active' : ''} 
                        onClick={() => setFiltroStatus('P')}>Pagos</button>
                </div>

                <div className="busca-box">
                    <Search size={18} color="#94a3b8" />
                    <input 
                        placeholder="Buscar despesa..." 
                        value={busca} 
                        onChange={e => setBusca(e.target.value)} 
                    />
                </div>
            </div>

            <div className="wrapper-tabela">
                <table className="tabela-moderna">
                    <thead>
                        <tr>
                            <th>Vencimento</th>
                            <th>Descrição</th>
                            <th>Categoria</th>
                            <th>Valor</th>
                            <th className="col-status">Status</th>
                            <th className="col-acoes">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dadosExibidos.map(d => (
                            <tr key={d.id_despesa}>
                                <td>{new Date(d.data_vencimento).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</td>
                                <td><strong>{d.descricao}</strong></td>
                                <td><span className="cat-tag">{d.categoria_nome || 'Sem Categoria'}</span></td>
                                <td>{formatBRL(d.valor)}</td>
                                <td className="col-status">
                                    <span className={`badge-ifood ${d.status}`}>
                                        {d.status === 'P' ? 'PAGO' : 'PENDENTE'}
                                    </span>
                                </td>
                                <td className="col-acoes">
                                    <div className="acoes-flex">
                                        <button className="btn-icon edit" onClick={() => onEdit(d)}>
                                            <Pencil size={18}/>
                                        </button>
                                        {d.status === 'A' && (
                                            <button className="btn-icon ok" onClick={() => handlePagar(d.id_despesa)}>
                                                <CheckCircle size={18}/>
                                            </button>
                                        )}
                                        <button className="btn-icon del" onClick={() => handleExcluir(d.id_despesa)}>
                                            <Trash2 size={18}/>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {dadosExibidos.length === 0 && (
                    <div className="vazio-msg">Nenhum lançamento encontrado.</div>
                )}
            </div>
        </div>
    );
}

export default Lista;