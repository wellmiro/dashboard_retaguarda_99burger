import React, { useState, useEffect } from "react";
import * as api from "../../../api/Despesas";
import { Chart } from "react-google-charts";
import { Trash2, Pencil, X, Check } from "lucide-react";
import "./styles.css";

function Despesa() {
    const [loading, setLoading] = useState(true);
    const [despesas, setDespesas] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [filtroStatus, setFiltroStatus] = useState("TUDO");
    const [busca, setBusca] = useState("");
    
    const [showModalDespesa, setShowModalDespesa] = useState(false);
    const [showModalCat, setShowModalCat] = useState(false);
    const [editandoId, setEditandoId] = useState(null);

    const [mesFiltro, setMesFiltro] = useState(new Date().getMonth() + 1);
    const [anoFiltro, setAnoFiltro] = useState(new Date().getFullYear());

    const [form, setForm] = useState({ descricao: '', valor: '', id_categoria: '', data_vencimento: '' });
    const [novaCat, setNovaCat] = useState("");

    const carregarDados = async () => {
        setLoading(true);
        try {
            const [resCat, resDes] = await Promise.all([api.getCategoriasDespesa(), api.getDespesas()]);
            setCategorias(resCat.data || []);
            setDespesas(resDes.data || []);
        } catch (e) { console.error("Erro ao carregar:", e); }
        setLoading(false);
    };

    useEffect(() => { carregarDados(); }, []);

    const handleSalvarDespesa = async () => {
        if (!form.descricao || !form.valor || !form.id_categoria || !form.data_vencimento) {
            return alert("Preencha todos os campos obrigatórios!");
        }
        try {
            if (editandoId) {
                await api.updateDespesa(editandoId, form);
            } else {
                await api.createDespesa({ 
                    ...form, 
                    id_usuario: localStorage.getItem("id_usuario"), 
                    status: 'A' 
                });
            }
            fecharModal();
            carregarDados();
        } catch (e) { alert("Erro ao salvar despesa"); }
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

    const handleSalvarCategoria = async () => {
        if (!novaCat) return;
        try {
            await api.createCategoriaDespesa({ descricao: novaCat });
            setNovaCat("");
            carregarDados();
        } catch (e) { alert("Erro ao salvar categoria"); }
    };

    const dadosFiltrados = despesas.filter(d => {
        const dataVenc = d.data_vencimento.split('T')[0].split('-');
        const ano = parseInt(dataVenc[0]);
        const mes = parseInt(dataVenc[1]);
        const matchMesAno = mes === Number(mesFiltro) && ano === Number(anoFiltro);
        const matchStatus = filtroStatus === "TUDO" || d.status === filtroStatus;
        const matchBusca = d.descricao.toLowerCase().includes(busca.toLowerCase());
        return matchMesAno && matchStatus && matchBusca;
    });

    const totalAberto = dadosFiltrados.filter(d => d.status === 'A').reduce((acc, curr) => acc + Number(curr.valor), 0);
    const totalPago = dadosFiltrados.filter(d => d.status === 'P').reduce((acc, curr) => acc + Number(curr.valor), 0);

    const cores = ["#3498db", "#2ecc71", "#ea1d2c", "#f1c40f", "#9b59b6", "#e67e22", "#1abc9c"];

    const prepararDadosGrafico = () => {
        const resumo = {};
        dadosFiltrados.forEach(d => {
            const cat = d.categoria_nome || "Outros";
            resumo[cat] = (resumo[cat] || 0) + Number(d.valor);
        });
        const labels = Object.entries(resumo);
        const data = [["Categoria", "Valor"]];
        labels.forEach(([cat, valor]) => data.push([cat, valor]));
        return { data, resumo: labels };
    };

    const { data: dadosGrafico, resumo: resumoCategorias } = prepararDadosGrafico();

    return (
        <div className="container-financeiro">
            <div className="header-financeiro">
                <h1>Gerenciar Despesas</h1>
                <div className="acoes-topo">
                    <button className="btn-outline" onClick={() => setShowModalCat(true)}>Categorias</button>
                    <button className="btn-principal" onClick={() => setShowModalDespesa(true)}>+ Nova Despesa</button>
                </div>
            </div>

            <div className="filtros-topo">
                <div className="filtro-item">
                    <label>MÊS DE REFERÊNCIA</label>
                    <select className="input-padrao" value={mesFiltro} onChange={(e) => setMesFiltro(e.target.value)}>
                        {["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"].map((m, i) => (
                            <option key={i} value={i+1}>{m}</option>
                        ))}
                    </select>
                </div>
                <div className="filtro-item">
                    <label>ANO</label>
                    <select className="input-padrao" value={anoFiltro} onChange={(e) => setAnoFiltro(e.target.value)}>
                        <option value="2025">2025</option>
                        <option value="2026">2026</option>
                    </select>
                </div>
            </div>

            <div className="dashboard-row">
                <div className="cards-col">
                    <div className="mini-card pendente">
                        <span>A PAGAR</span>
                        <h3>R$ {totalAberto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
                    </div>
                    <div className="mini-card pago">
                        <span>TOTAL PAGO</span>
                        <h3>R$ {totalPago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
                    </div>
                </div>

                <div className="grafico-col">
                    <div className="grafico-wrapper">
                        <div className="chart-area">
                            <Chart 
                                chartType="PieChart" 
                                data={dadosGrafico} 
                                options={{
                                    pieHole: 0.5,
                                    colors: cores,
                                    chartArea: { width: '90%', height: '90%' },
                                    legend: 'none',
                                    pieSliceText: 'percentage'
                                }} 
                                width={"100%"} height={"220px"} 
                            />
                        </div>
                        <div className="legenda-custom">
                            <h4 className="titulo-legenda">Gastos por Categoria ({mesFiltro}/{anoFiltro})</h4>
                            <div className="legenda-scroll">
                                {resumoCategorias.length > 0 ? resumoCategorias.map(([cat, valor], i) => (
                                    <div key={i} className="legenda-item">
                                        <div className="legenda-cor-txt">
                                            <div className="ponto-cor" style={{ backgroundColor: cores[i % cores.length] }}></div>
                                            <span className="txt-cat">{cat}</span>
                                        </div>
                                        <span className="val-cat">R$ {valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                )) : <p className="sem-dados">Nenhuma despesa encontrada</p>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card-tabela">
                <div className="tabela-header">
                    <div className="btn-group">
                        <button className={filtroStatus === 'TUDO' ? 'active' : ''} onClick={() => setFiltroStatus("TUDO")}>Todos</button>
                        <button className={filtroStatus === 'A' ? 'active' : ''} onClick={() => setFiltroStatus("A")}>Pendentes</button>
                        <button className={filtroStatus === 'P' ? 'active' : ''} onClick={() => setFiltroStatus("P")}>Pagos</button>
                    </div>
                    <input type="text" className="input-padrao" placeholder="Buscar descrição..." value={busca} onChange={(e) => setBusca(e.target.value)} />
                </div>

                <table className="tabela-v">
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
                        {dadosFiltrados.map(d => (
                            <tr key={d.id_despesa}>
                                <td>{new Date(d.data_vencimento).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</td>
                                <td><strong>{d.descricao}</strong></td>
                                <td>{d.categoria_nome}</td>
                                <td className="txt-valor-negativo">R$ {Number(d.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                <td>
                                    <span 
                                        className={`badge-status ${d.status}`}
                                        onClick={() => { if(d.status === 'A' && window.confirm("Confirmar pagamento?")) api.pagarDespesa(d.id_despesa).then(carregarDados) }}
                                        style={{cursor: d.status === 'A' ? 'pointer' : 'default'}}
                                    >
                                        {d.status === 'P' ? 'PAGO' : 'PENDENTE'}
                                    </span>
                                </td>
                                <td>
                                    <div className="tabela-acoes-icones">
                                        <button className="btn-icon editar" title="Editar" onClick={() => handleEditar(d)}>
                                            <Pencil size={16} />
                                        </button>
                                        <button className="btn-icon excluir" title="Excluir" onClick={() => { if(window.confirm("Excluir despesa?")) api.deleteDespesa(d.id_despesa).then(carregarDados) }}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* MODAL NOVA/EDITAR DESPESA */}
            {showModalDespesa && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>{editandoId ? "Editar Despesa" : "Nova Despesa"}</h2>
                        <div className="form-group">
                            <label>Descrição</label>
                            <input type="text" className="input-padrao" value={form.descricao} onChange={e => setForm({...form, descricao: e.target.value})} />
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Valor</label>
                                <input type="number" className="input-padrao" value={form.valor} onChange={e => setForm({...form, valor: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label>Vencimento</label>
                                <input type="date" className="input-padrao" value={form.data_vencimento} onChange={e => setForm({...form, data_vencimento: e.target.value})} />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Categoria</label>
                            <select className="input-padrao" value={form.id_categoria} onChange={e => setForm({...form, id_categoria: e.target.value})}>
                                <option value="">Selecione...</option>
                                {categorias.map(c => <option key={c.id_categoria} value={c.id_categoria}>{c.descricao}</option>)}
                            </select>
                        </div>
                        <div className="modal-acoes">
                            <button className="btn-outline" onClick={fecharModal}>Cancelar</button>
                            <button className="btn-principal" onClick={handleSalvarDespesa}>
                                <Check size={18} style={{marginRight: '5px'}} /> Salvar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL CATEGORIAS */}
            {showModalCat && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header-flex">
                             <h2>Categorias</h2>
                             <button className="btn-fechar-modal" onClick={() => setShowModalCat(false)}><X size={20}/></button>
                        </div>
                        <div className="add-cat-row">
                            <input type="text" className="input-padrao" placeholder="Nova categoria..." value={novaCat} onChange={e => setNovaCat(e.target.value)} />
                            <button className="btn-principal" onClick={handleSalvarCategoria}>Add</button>
                        </div>
                        <div className="lista-categorias">
                            {categorias.map(c => (
                                <div key={c.id_categoria} className="item-cat-lista">
                                    <span>{c.descricao}</span>
                                    <button className="btn-trash-cat" onClick={() => { if(window.confirm("Excluir categoria?")) api.deleteCategoriaDespesa(c.id_categoria).then(carregarDados) }}>
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Despesa;