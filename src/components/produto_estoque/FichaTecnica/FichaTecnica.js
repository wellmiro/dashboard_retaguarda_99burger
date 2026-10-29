import React, { useEffect, useState, useCallback } from "react";
import {
    Edit2,
    Trash2,
    Check,
    X,
    AlertCircle,
    Loader2,
    Plus,
    Package,
    ChevronDown,
    ChevronUp,
    ShoppingCart,
    Calculator
} from "lucide-react";

import api from "../../../api/Api";
import "./Styles.css";

export default function FichaTecnica({
    idProduto,
    produtoNome = "Produto",
    produtoPreco = null,
    onClose,
    onEstoqueAtualizado
}) {
    // ESTADOS ORIGINAIS
    const [itens, setItens] = useState([]);
    const [insumosDisponiveis, setInsumosDisponiveis] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [erro, setErro] = useState("");
    const [sucesso, setSucesso] = useState("");
    const [novoInsumoId, setNovoInsumoId] = useState("");
    const [novaQtd, setNovaQtd] = useState("");
    const [isSalvando, setIsSalvando] = useState(false);
    const [editandoId, setEditandoId] = useState(null);
    const [qtdEditada, setQtdEditada] = useState("");
    const [confirmaExclusao, setConfirmaExclusao] = useState({ aberto: false, id_ficha: null, nome: "" });
    const [mostrarEstoqueInsumos, setMostrarEstoqueInsumos] = useState(false);

    // NOVOS ESTADOS PARA O SIMULADOR (LISTA DE COMPRAS)
    const [abaAtiva, setAbaAtiva] = useState("receita"); // receita ou simulador
    const [qtdDesejadaProducao, setQtdDesejadaProducao] = useState("");

    const carregarDados = useCallback(async () => {
        if (!idProduto) {
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        setErro("");
        try {
            const [resFicha, resInsumos] = await Promise.all([
                api.get(`/produtos/${idProduto}/ficha`),
                api.get(`/insumos`)
            ]);
            const dataFicha = Array.isArray(resFicha.data) ? resFicha.data : (resFicha.data?.data || []);
            const dataInsumos = Array.isArray(resInsumos.data) ? resInsumos.data : (resInsumos.data?.data || []);
            setItens(dataFicha);
            setInsumosDisponiveis(dataInsumos);
        } catch (e) {
            setErro("Não foi possível carregar os dados.");
            setItens([]);
        } finally {
            setIsLoading(false);
        }
    }, [idProduto]);

    useEffect(() => {
        carregarDados();
    }, [carregarDados]);

    // FORMATAÇÃO DE QUANTIDADE (IGUAL AO SEU UTILITÁRIO)
    const formatQtd = (qtd, unidade) => {
        const num = Number(qtd);
        if (isNaN(num)) return qtd;
        const fracionado = ["KG", "G", "L", "ML"].includes(String(unidade || "").toUpperCase());
        return num.toLocaleString("pt-BR", {
            minimumFractionDigits: fracionado ? 2 : 0,
            maximumFractionDigits: 3
        }) + ` ${unidade || ""}`;
    };

    const formatMoeda = (valor) => {
        return (Number(valor) || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    // LÓGICA DO SIMULADOR DE COMPRAS
    const gerarCalculoProducao = () => {
        const alvo = Number(qtdDesejadaProducao) || 0;
        if (alvo <= 0) return [];

        return itens.map(item => {
            const necessario = alvo * Number(item.qtd_consumida);
            const estoque = Number(item.qtd_atual) || 0;
            const falta = necessario - estoque;

            return {
                ...item,
                necessario,
                estoque,
                comprar: falta > 0 ? falta : 0
            };
        });
    };

    const listaCalculada = gerarCalculoProducao();

    // FUNÇÕES DE MANIPULAÇÃO (POST/PUT/DELETE) - MANTIDAS IGUAIS
    const adicionarIngrediente = async (e) => {
        e.preventDefault();
        if (!novoInsumoId || !novaQtd || Number(novaQtd) <= 0) {
            setErro("Selecione o insumo e a quantidade.");
            return;
        }
        setIsSalvando(true);
        try {
            await api.post(`/produtos/ficha`, {
                id_produto: Number(idProduto),
                id_insumo: Number(novoInsumoId),
                qtd_consumida: Number(Number(novaQtd).toFixed(3))
            });
            setNovoInsumoId(""); setNovaQtd("");
            setSucesso("Adicionado!");
            await carregarDados();
            if (onEstoqueAtualizado) await onEstoqueAtualizado(idProduto);
            setTimeout(() => setSucesso(""), 2000);
        } catch (err) {
            setErro("Erro ao salvar.");
        } finally {
            setIsSalvando(false);
        }
    };

    const salvarEdicao = async (id_ficha) => {
        if (Number(qtdEditada) <= 0) return;
        try {
            await api.put(`/produtos/ficha/${id_ficha}`, { qtd_consumida: Number(Number(qtdEditada).toFixed(3)) });
            setEditandoId(null);
            setSucesso("Atualizado!");
            await carregarDados();
            if (onEstoqueAtualizado) await onEstoqueAtualizado(idProduto);
            setTimeout(() => setSucesso(""), 2000);
        } catch (err) { setErro("Erro ao atualizar."); }
    };

    const confirmarExcluir = async () => {
        try {
            await api.delete(`/produtos/ficha/${confirmaExclusao.id_ficha}`);
            setConfirmaExclusao({ aberto: false, id_ficha: null, nome: "" });
            setSucesso("Removido!");
            await carregarDados();
            if (onEstoqueAtualizado) await onEstoqueAtualizado(idProduto);
            setTimeout(() => setSucesso(""), 2000);
        } catch (err) { setErro("Erro ao remover."); }
    };

    return (
        <div className="ficha-tecnica-container">
            <h2 className="titulo">Ficha Técnica: {produtoNome}</h2>

            {/* ABAS ESTILO DELPHI PAGE CONTROL */}
            <div className="tabs-producao">
                <button 
                    className={`tab-item ${abaAtiva === 'receita' ? 'active' : ''}`}
                    onClick={() => setAbaAtiva('receita')}
                >
                    <Edit2 size={16} /> Receita / Composição
                </button>
                <button 
                    className={`tab-item ${abaAtiva === 'simulador' ? 'active' : ''}`}
                    onClick={() => setAbaAtiva('simulador')}
                >
                    <ShoppingCart size={16} /> Simulador de Produção
                </button>
            </div>

            <div className="divider" />

            {abaAtiva === "receita" ? (
                /* --- ABA 1: CADASTRO DA RECEITA --- */
                <>
                    <p className="sub-title">Configure os ingredientes e quanto cada um consome por venda.</p>
                    
                    <form onSubmit={adicionarIngrediente} className="form-adicionar-ficha">
                        <div className="form-adicionar-linha">
                            <div className="form-group-select">
                                <select className="select-insumo" value={novoInsumoId} onChange={(e) => setNovoInsumoId(e.target.value)}>
                                    <option value="">Selecione o insumo...</option>
                                    {insumosDisponiveis.map(i => (
                                        <option key={i.id_insumo} value={i.id_insumo}>{i.nome} ({i.unidade_medida})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group-qtd">
                                <input type="number" className="input-qtd" placeholder="Qtd" value={novaQtd} onChange={(e) => setNovaQtd(e.target.value)} />
                                <span className="unidade-label">UN/KG</span>
                            </div>
                        </div>
                        <button type="submit" className="btn-adicionar-ficha" disabled={isSalvando}>
                            <Plus size={16} /> Adicionar na Receita
                        </button>
                    </form>

                    {erro && <div className="alert-erro"><AlertCircle size={18} /> {erro}</div>}
                    {sucesso && <div className="alert-sucesso">{sucesso}</div>}

                    <ul className="itens-lista">
                        {itens.map((item) => (
                            <li key={item.id_ficha} className="item-linha">
                                <span className="item-nome">{item.nome}</span>
                                <div className="item-detalhes">
                                    {editandoId === item.id_ficha ? (
                                        <>
                                            <input type="number" className="input-inplace" value={qtdEditada} onChange={(e) => setQtdEditada(e.target.value)} />
                                            <button className="btn-commit" onClick={() => salvarEdicao(item.id_ficha)}><Check size={16} /></button>
                                            <button className="btn-cancel" onClick={() => setEditandoId(null)}><X size={16} /></button>
                                        </>
                                    ) : (
                                        <>
                                            <span className="item-valor">{formatQtd(item.qtd_consumida, item.unidade_medida)}</span>
                                            <button className="btn-edit-inline" onClick={() => { setEditandoId(item.id_ficha); setQtdEditada(item.qtd_consumida); }}><Edit2 size={16} /></button>
                                            <button className="btn-delete-inline" onClick={() => setConfirmaExclusao({ aberto: true, id_ficha: item.id_ficha, nome: item.nome })}><Trash2 size={16} /></button>
                                        </>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                </>
            ) : (
                /* --- ABA 2: SIMULADOR DE PRODUÇÃO / LISTA DE COMPRAS --- */
                <div className="simulador-compras">
                    <div className="simulador-card-input">
                        <label>Quantas unidades de <b>{produtoNome}</b> você quer produzir?</label>
                        <div className="input-alvo-wrapper">
                            <Calculator size={20} />
                            <input 
                                type="number" 
                                placeholder="Ex: 50" 
                                value={qtdDesejadaProducao}
                                onChange={(e) => setQtdDesejadaProducao(e.target.value)}
                            />
                        </div>
                    </div>

                    {qtdDesejadaProducao > 0 ? (
                        <div className="resultado-calculo">
                            <p className="resumo-txt">Para produzir {qtdDesejadaProducao} unidades, você precisará de:</p>
                            <div className="lista-compras-automatica">
                                {listaCalculada.map(item => (
                                    <div key={item.id_ficha} className={`card-compra ${item.comprar > 0 ? 'falta' : 'sucesso'}`}>
                                        <div className="card-compra-header">
                                            <span className="insumo-titulo">{item.nome}</span>
                                            <span className={`status-badge ${item.comprar > 0 ? 'bad' : 'good'}`}>
                                                {item.comprar > 0 ? 'Falta no estoque' : 'Estoque OK'}
                                            </span>
                                        </div>
                                        <div className="card-compra-corpo">
                                            <div className="dado">
                                                <label>Necessário</label>
                                                <p>{formatQtd(item.necessario, item.unidade_medida)}</p>
                                            </div>
                                            <div className="dado">
                                                <label>Tem em Estoque</label>
                                                <p>{formatQtd(item.estoque, item.unidade_medida)}</p>
                                            </div>
                                            <div className="dado destaque">
                                                <label>Comprar</label>
                                                <p className={item.comprar > 0 ? 'txt-alerta' : 'txt-ok'}>
                                                    {item.comprar > 0 ? formatQtd(item.comprar, item.unidade_medida) : 'NADA'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="aviso-simulador">
                            <ShoppingCart size={40} />
                            <p>Digite a quantidade desejada acima para calcular o que falta comprar.</p>
                        </div>
                    )}
                </div>
            )}

            {/* MODAL CONFIRMAÇÃO EXCLUSÃO */}
            {confirmaExclusao.aberto && (
                <div className="modal-overlay">
                    <div className="modal-card">
                        <h3 className="modal-title">Remover ingrediente?</h3>
                        <p className="modal-text">Deseja remover <b>{confirmaExclusao.nome}</b> da receita?</p>
                        <div className="modal-actions">
                            <button className="btn-modal cancelar" onClick={() => setConfirmaExclusao({ aberto: false })}>Não</button>
                            <button className="btn-modal confirmar" onClick={confirmarExcluir}>Sim, Remover</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}