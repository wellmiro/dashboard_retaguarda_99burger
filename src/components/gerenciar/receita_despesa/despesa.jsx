import React, { useState, useEffect, useCallback } from "react";
import * as api from "../../../api/Despesas";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { Trash2, Pencil, X, Tag, Plus, Search, CheckCircle } from "lucide-react"; 
import "./styles.css";

ChartJS.register(ArcElement, Tooltip, Legend);

function Despesa() {
    const [despesas, setDespesas] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [filtroStatus, setFiltroStatus] = useState("TUDO");
    const [busca, setBusca] = useState("");
    
    const [showModalDespesa, setShowModalDespesa] = useState(false);
    const [showModalCategoria, setShowModalCategoria] = useState(false);
    const [editandoId, setEditandoId] = useState(null);

    const [mesFiltro, setMesFiltro] = useState(new Date().getMonth() + 1);
    const [anoFiltro, setAnoFiltro] = useState(new Date().getFullYear());

    const [form, setForm] = useState({ descricao: '', valor: '', id_categoria: '', data_vencimento: '' });
    const [novaCat, setNovaCat] = useState("");

    const carregarDados = useCallback(async () => {
        try {
            const [resCat, resDes] = await Promise.all([api.getCategoriasDespesa(), api.getDespesas()]);
            setCategorias(resCat.data || []);
            setDespesas(resDes.data || []);
        } catch (e) { console.error("Erro ao carregar dados", e); }
    }, []);

    useEffect(() => { carregarDados(); }, [carregarDados]);

    const handleSalvarDespesa = async () => {
        if (!form.descricao || !form.valor || !form.id_categoria || !form.data_vencimento) return alert("Preencha tudo!");
        try {
            if (editandoId) {
                await api.updateDespesa(editandoId, form);
            } else {
                await api.createDespesa({ ...form, id_usuario: localStorage.getItem("id_usuario"), status: 'A' });
            }
            fecharModal();
            carregarDados();
        } catch (e) { alert("Erro ao salvar"); }
    };

    const handleSalvarCategoria = async () => {
        if (!novaCat) return;
        try {
            await api.createCategoriaDespesa({ descricao: novaCat });
            setNovaCat("");
            carregarDados();
        } catch (e) { alert("Erro ao salvar categoria"); }
    };

    const handleExcluirCategoria = async (id) => {
        if (window.confirm("Excluir categoria?")) {
            try { await api.deleteCategoriaDespesa(id); carregarDados(); } catch (e) { alert("Erro ao excluir"); }
        }
    };

    const handleEditar = (d) => {
        setEditandoId(d.id_despesa);
        setForm({
            descricao: d.descricao,
            valor: d.valor,
            id_categoria: d.id_categoria,
            data_vencimento: d.data_vencimento.split('T')[0]
        });
        setShowModalDespesa(true);
    };

    const fecharModal = () => {
        setShowModalDespesa(false);
        setEditandoId(null);
        setForm({ descricao: '', valor: '', id_categoria: '', data_vencimento: '' });
    };

    const dadosFiltrados = despesas.filter(d => {
        const dataVenc = d.data_vencimento.split('T')[0].split('-');
        const matchMesAno = parseInt(dataVenc[1]) === Number(mesFiltro) && parseInt(dataVenc[0]) === Number(anoFiltro);
        const matchStatus = filtroStatus === "TUDO" || d.status === filtroStatus;
        const matchBusca = d.descricao.toLowerCase().includes(busca.toLowerCase());
        return matchMesAno && matchStatus && matchBusca;
    });

    const categoriasMap = new Map();
    const coresFixas = ['#ea1d2c', '#007BFF', '#28a745', '#ffc107', '#6f42c1', '#17a2b8', '#fd7e14', '#20c997'];

    dadosFiltrados.forEach(d => {
        const nome = d.categoria_nome || "Sem Categoria";
        const valor = parseFloat(String(d.valor || 0));
        categoriasMap.set(nome, (categoriasMap.get(nome) || 0) + valor);
    });

    const labelsPizza = Array.from(categoriasMap.keys());
    const valoresPizza = Array.from(categoriasMap.values());

    const dataChart = {
        labels: labelsPizza,
        datasets: [{
            data: valoresPizza,
            backgroundColor: coresFixas.slice(0, labelsPizza.length),
            hoverOffset: 8,
            borderWidth: 2,
            borderColor: "#ffffff"
        }]
    };

    const chartOptions = {
        cutout: '75%',
        plugins: {
            legend: { display: false },
            tooltip: { enabled: true }
        },
        maintainAspectRatio: false
    };

    const formatBRL = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    return (
        <div className="container-financeiro">
            <header className="header-principal">
                <div className="titulo-sessao">
                    <h1>Gerenciar Despesas</h1>
                    <p>Controle seus gastos de forma inteligente</p>
                </div>
                <div className="acoes-header">
                    <button className="btn-secundario" onClick={() => setShowModalCategoria(true)}>
                        <Tag size={18} /> Categorias
                    </button>
                    <button className="btn-ifood" onClick={() => setShowModalDespesa(true)}>
                        <Plus size={18} /> Nova Despesa
                    </button>
                </div>
            </header>

            <div className="card-filtros-data">
                <div className="seletor-grupo">
                    <label>Mês de Referência</label>
                    <select value={mesFiltro} onChange={(e) => setMesFiltro(e.target.value)}>
                        {["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"].map((m, i) => (
                            <option key={i} value={i+1}>{m}</option>
                        ))}
                    </select>
                </div>
                <div className="seletor-grupo">
                    <label>Ano</label>
                    <select value={anoFiltro} onChange={(e) => setAnoFiltro(e.target.value)}>
                        <option value="2025">2025</option>
                        <option value="2026">2026</option>
                    </select>
                </div>
            </div>

            <div className="layout-dashboard">
                <div className="coluna-cards">
                    <div className="card-info-v2 pendente">
                        <div className="indicator" />
                        <div className="info-content">
                            <span>A PAGAR</span>
                            <h2>{formatBRL(dadosFiltrados.filter(d=>d.status==='A').reduce((acc,curr)=>acc+Number(curr.valor),0))}</h2>
                        </div>
                    </div>
                    <div className="card-info-v2 pago">
                        <div className="indicator" />
                        <div className="info-content">
                            <span>TOTAL PAGO</span>
                            <h2>{formatBRL(dadosFiltrados.filter(d=>d.status==='P').reduce((acc,curr)=>acc+Number(curr.valor),0))}</h2>
                        </div>
                    </div>
                </div>

                <div className="card-grafico-v2">
                    <div className="chart-container">
                        <Doughnut data={dataChart} options={chartOptions} />
                    </div>
                    <div className="legenda-container">
                        <h3>Gastos por Categoria</h3>
                        <div className="legenda-scroll">
                            {labelsPizza.length > 0 ? labelsPizza.map((lbl, i) => (
                                <div key={i} className="legenda-item">
                                    <div className="legenda-left">
                                        <span className="dot" style={{ backgroundColor: coresFixas[i % coresFixas.length] }} />
                                        <span className="label">{lbl}</span>
                                    </div>
                                    <span className="valor">{formatBRL(categoriasMap.get(lbl))}</span>
                                </div>
                            )) : <p className="sem-dados">Sem dados no período.</p>}
                        </div>
                        {valoresPizza.length > 0 && (
                            <div className="total-pizza-footer">
                                <span>TOTAL GERAL</span>
                                <strong>{formatBRL(valoresPizza.reduce((a,b)=>a+b, 0))}</strong>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="sessao-tabela">
                <div className="tabela-header-filtros">
                    {/* BOTÕES ESTILO PÍLULA IFOOD */}
                    <div className="tabs-status">
                        <button className={filtroStatus === 'TUDO' ? 'active' : ''} onClick={() => setFiltroStatus('TUDO')}>Todos</button>
                        <button className={filtroStatus === 'A' ? 'active' : ''} onClick={() => setFiltroStatus('A')}>Pendentes</button>
                        <button className={filtroStatus === 'P' ? 'active' : ''} onClick={() => setFiltroStatus('P')}>Pagos</button>
                    </div>

                    {/* BUSCA COM ÍCONE INTERNO */}
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
                                <th>Status</th>
                                <th style={{ textAlign: 'right' }}>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dadosFiltrados.map(d => (
                                <tr key={d.id_despesa}>
                                    <td>{new Date(d.data_vencimento).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</td>
                                    <td><strong>{d.descricao}</strong></td>
                                    <td><span className="cat-tag">{d.categoria_nome}</span></td>
                                    <td>{formatBRL(Number(d.valor))}</td>
                                    <td><span className={`badge-ifood ${d.status}`}>{d.status === 'P' ? 'PAGO' : 'PENDENTE'}</span></td>
                                    <td className="acoes-flex">
                                        <button className="btn-icon edit" title="Editar" onClick={() => handleEditar(d)}><Pencil size={18}/></button>
                                        {d.status === 'A' && (
                                            <button className="btn-icon ok" title="Marcar como Pago" onClick={() => api.pagarDespesa(d.id_despesa).then(carregarDados)}><CheckCircle size={18}/></button>
                                        )}
                                        <button className="btn-icon del" title="Excluir" onClick={() => window.confirm("Excluir?") && api.deleteDespesa(d.id_despesa).then(carregarDados)}><Trash2 size={18}/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAIS MANTIDOS IGUAIS */}
            {showModalCategoria && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Gestão de Categorias</h2>
                            <button className="btn-close" onClick={() => setShowModalCategoria(false)}><X size={20}/></button>
                        </div>
                        <div className="form-group">
                            <div style={{display:'flex', gap:'10px'}}>
                                <input value={novaCat} onChange={e => setNovaCat(e.target.value)} placeholder="Nova categoria..." style={{flex:1}} />
                                <button className="btn-ifood" onClick={handleSalvarCategoria}><Plus size={16}/></button>
                            </div>
                        </div>
                        <div style={{maxHeight: '200px', overflowY: 'auto'}}>
                            {categorias.map(c => (
                                <div key={c.id_categoria} style={{display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid #eee'}}>
                                    <span>{c.descricao}</span>
                                    <button onClick={() => handleExcluirCategoria(c.id_categoria)} style={{background:'none', border:'none', color:'red', cursor:'pointer'}}><Trash2 size={16}/></button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {showModalDespesa && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>{editandoId ? "Editar Despesa" : "Nova Despesa"}</h2>
                            <button className="btn-close" onClick={fecharModal}><X size={20}/></button>
                        </div>
                        <div className="form-group"><label>Descrição</label><input value={form.descricao} onChange={e => setForm({...form, descricao: e.target.value})} /></div>
                        <div className="form-group"><label>Valor</label><input type="number" value={form.valor} onChange={e => setForm({...form, valor: e.target.value})} /></div>
                        <div className="form-group">
                            <label>Categoria</label>
                            <select value={form.id_categoria} onChange={e => setForm({...form, id_categoria: e.target.value})}>
                                <option value="">Selecione...</option>
                                {categorias.map(c => <option key={c.id_categoria} value={c.id_categoria}>{c.descricao}</option>)}
                            </select>
                        </div>
                        <div className="form-group"><label>Vencimento</label><input type="date" value={form.data_vencimento} onChange={e => setForm({...form, data_vencimento: e.target.value})} /></div>
                        <button className="btn-ifood w-100" style={{marginTop: '20px'}} onClick={handleSalvarDespesa}>Salvar</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Despesa;