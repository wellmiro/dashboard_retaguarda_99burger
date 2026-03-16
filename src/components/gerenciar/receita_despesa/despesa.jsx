import React, { useState, useEffect } from "react";
import * as api from "../../../api/Despesas";
import "./styles.css";

function Despesa() {
    const [loading, setLoading] = useState(true);
    const [despesas, setDespesas] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [filtroStatus, setFiltroStatus] = useState("TUDO");
    const [busca, setBusca] = useState("");

    // Modais
    const [showModalDespesa, setShowModalDespesa] = useState(false);
    const [showModalCat, setShowModalCat] = useState(false);

    // Forms
    const [form, setForm] = useState({ descricao: '', valor: '', id_categoria: '', data_vencimento: '' });
    const [novaCat, setNovaCat] = useState("");

    const carregarDados = async () => {
        setLoading(true);
        try {
            const [resCat, resDes] = await Promise.all([api.getCategoriasDespesa(), api.getDespesas()]);
            setCategorias(resCat.data || []);
            setDespesas(resDes.data || []);
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    useEffect(() => { carregarDados(); }, []);

    // Regras de Negócio e UX
    const totalAberto = despesas.filter(d => d.status === 'A').reduce((acc, curr) => acc + Number(curr.valor), 0);
    const totalPago = despesas.filter(d => d.status === 'P').reduce((acc, curr) => acc + Number(curr.valor), 0);

    const dadosFiltrados = despesas.filter(d => {
        const matchStatus = filtroStatus === "TUDO" || d.status === filtroStatus;
        const matchBusca = d.descricao.toLowerCase().includes(busca.toLowerCase());
        return matchStatus && matchBusca;
    });

    const handleSalvarDespesa = async () => {
        if (!form.descricao || !form.valor || !form.id_categoria) return alert("Preencha os campos!");
        try {
            await api.createDespesa({ 
                ...form, 
                id_usuario: localStorage.getItem("id_usuario"), 
                status: 'A' 
            });
            setShowModalDespesa(false);
            setForm({ descricao: '', valor: '', id_categoria: '', data_vencimento: '' });
            carregarDados();
        } catch (e) { alert("Erro ao salvar"); }
    };

    const handleAddCategoria = async () => {
        if (!novaCat) return;
        try {
            await api.createCategoriaDespesa({ descricao: novaCat });
            setNovaCat("");
            carregarDados();
        } catch (e) { alert("Erro ao criar categoria"); }
    };

    return (
        <div className="container-financeiro">
            <div className="header-financeiro">
                <h1>Painel Financeiro</h1>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn-outline" onClick={() => setShowModalCat(true)}>Gerenciar Categorias</button>
                    <button className="btn-principal" onClick={() => setShowModalDespesa(true)}>+ Nova Despesa</button>
                </div>
            </div>

            <div className="financeiro-resumo">
                <div className="card-info pendente">
                    <span>A Pagar</span>
                    <h3>R$ {totalAberto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
                </div>
                <div className="card-info pago">
                    <span>Total Pago</span>
                    <h3>R$ {totalPago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
                </div>
                <div className="card-info">
                    <span>Movimentação Total</span>
                    <h3>R$ {(totalAberto + totalPago).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
                </div>
            </div>

            <div className="controles-barra">
                <div className="filtros-container">
                    <button className={`btn-filtro ${filtroStatus === 'TUDO' ? 'active' : ''}`} onClick={() => setFiltroStatus('TUDO')}>Todos</button>
                    <button className={`btn-filtro ${filtroStatus === 'A' ? 'active' : ''}`} onClick={() => setFiltroStatus('A')}>Pendentes</button>
                    <button className={`btn-filtro ${filtroStatus === 'P' ? 'active' : ''}`} onClick={() => setFiltroStatus('P')}>Pagos</button>
                </div>
                <input 
                    type="text" 
                    className="busca-input" 
                    placeholder="Pesquisar despesa..." 
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                />
            </div>

            <div className="card-financeiro">
                <table className="tabela-ifood">
                    <thead>
                        <tr>
                            <th>Vencimento</th>
                            <th>Descrição</th>
                            <th>Categoria</th>
                            <th>Valor</th>
                            <th>Status</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? <tr><td colSpan="6">Carregando dados...</td></tr> : 
                        dadosFiltrados.map(d => (
                            <tr key={d.id_despesa}>
                                <td>{new Date(d.data_vencimento).toLocaleDateString('pt-BR')}</td>
                                <td><strong>{d.descricao}</strong></td>
                                <td>{d.categoria_nome}</td>
                                <td style={{ color: '#ea1d2c', fontWeight: 'bold' }}>
                                    R$ {Number(d.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </td>
                                <td>
                                    <span className={`status-badge status-${d.status}`}>
                                        {d.status === 'P' ? 'PAGO' : 'PENDENTE'}
                                    </span>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        {d.status === 'A' && (
                                            <button className="btn-outline" onClick={() => api.pagarDespesa(d.id_despesa).then(carregarDados)}>Baixar</button>
                                        )}
                                        <button className="btn-outline" style={{ color: '#ea1d2c' }} onClick={() => api.deleteDespesa(d.id_despesa).then(carregarDados)}>Excluir</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* MODAL GESTÃO CATEGORIAS */}
            {showModalCat && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Categorias de Despesa</h3>
                        <div className="form-group" style={{ display: 'flex', gap: '10px' }}>
                            <input type="text" placeholder="Nome da categoria..." value={novaCat} onChange={e => setNovaCat(e.target.value)} />
                            <button className="btn-principal" onClick={handleAddCategoria}>Add</button>
                        </div>
                        <div style={{ maxHeight: '250px', overflowY: 'auto', marginTop: '15px' }}>
                            {categorias.map(c => (
                                <div key={c.id_categoria} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', borderBottom: '1px solid #f1f5f9' }}>
                                    <span>{c.descricao}</span>
                                    <button style={{ background: 'none', border: 'none', color: '#ea1d2c', cursor: 'pointer' }} onClick={() => api.deleteCategoriaDespesa(c.id_categoria).then(carregarDados)}>Remover</button>
                                </div>
                            ))}
                        </div>
                        <button className="btn-outline" style={{ width: '100%', marginTop: '20px' }} onClick={() => setShowModalCat(false)}>Fechar</button>
                    </div>
                </div>
            )}

            {/* MODAL NOVA DESPESA */}
            {showModalDespesa && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Lançar Nova Despesa</h3>
                        <div className="form-group">
                            <label>Descrição</label>
                            <input type="text" value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} placeholder="Ex: Carne para Hamburguer" />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                            <div className="form-group">
                                <label>Valor</label>
                                <input type="number" value={form.valor} onChange={e => setForm({ ...form, valor: e.target.value })} placeholder="0,00" />
                            </div>
                            <div className="form-group">
                                <label>Vencimento</label>
                                <input type="date" value={form.data_vencimento} onChange={e => setForm({ ...form, data_vencimento: e.target.value })} />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Categoria</label>
                            <select value={form.id_categoria} onChange={e => setForm({ ...form, id_categoria: e.target.value })}>
                                <option value="">Selecione a categoria</option>
                                {categorias.map(c => <option key={c.id_categoria} value={c.id_categoria}>{c.descricao}</option>)}
                            </select>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                            <button className="btn-outline" onClick={() => setShowModalDespesa(false)}>Cancelar</button>
                            <button className="btn-principal" onClick={handleSalvarDespesa}>Confirmar Lançamento</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Despesa;