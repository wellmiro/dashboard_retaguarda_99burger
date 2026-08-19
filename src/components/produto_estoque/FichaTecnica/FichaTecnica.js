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
    ChevronUp
} from "lucide-react";
import api from "../../../api/Api";
import "./Styles.css";

export default function FichaTecnica({
    idProduto,
    produtoNome = "Produto",
    produtoPreco = null,
    onClose,
    onEstoqueAtualizado,
}) {
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

    const [confirmaExclusao, setConfirmaExclusao] =
        useState({
            aberto: false,
            id_ficha: null,
            nome: ""
        });

    const [mostrarEstoqueInsumos, setMostrarEstoqueInsumos] =
        useState(false);

    const carregarDados = useCallback(async () => {
        if (!idProduto) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setErro("");

        try {
            const [resFicha, resInsumos] =
                await Promise.all([
                    api.get(
                        `/produtos/${idProduto}/ficha`
                    ),
                    api.get(`/insumos`)
                ]);

            const dataFicha = Array.isArray(
                resFicha.data
            )
                ? resFicha.data
                : (resFicha.data?.data || []);

            const dataInsumos = Array.isArray(
                resInsumos.data
            )
                ? resInsumos.data
                : (resInsumos.data?.data || []);

            setItens(dataFicha);
            setInsumosDisponiveis(dataInsumos);

            console.log(
                "📋 [FICHA] Dados carregados:",
                dataFicha
            );
        } catch (e) {
            console.error(
                "Erro ao carregar ficha:",
                e.response?.data || e
            );

            setErro(
                "Não foi possível carregar os dados da ficha técnica."
            );

            setItens([]);
        } finally {
            setIsLoading(false);
        }
    }, [idProduto]);

    useEffect(() => {
        carregarDados();
    }, [carregarDados]);

    const insumoSelecionadoObj =
        insumosDisponiveis.find(
            (i) =>
                String(i.id_insumo) ===
                String(novoInsumoId)
        );

    const unidadeAtual =
        insumoSelecionadoObj?.unidade_medida || "";

    const stepPorUnidade = (unidade) => {
        const u = String(unidade || "").toUpperCase();

        if (u === "KG" || u === "L") {
            return "0.001";
        }

        if (u === "G" || u === "ML") {
            return "1";
        }

        return "0.01";
    };

    const formatQtd = (qtd, unidade) => {
        const num = Number(qtd);

        if (isNaN(num)) {
            return qtd;
        }

        const fracionado = [
            "KG",
            "G",
            "L",
            "ML",
            "M",
            "CM"
        ].includes(
            String(unidade || "").toUpperCase()
        );

        if (fracionado) {
            return (
                num.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 3
                }) +
                ` ${unidade || ""}`
            );
        }

        return (
            num.toLocaleString("pt-BR", {
                maximumFractionDigits: 0
            }) +
            ` ${unidade || ""}`
        );
    };

    const formatMoeda = (valor) => {
        const num = Number(valor) || 0;

        return num.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    const custoItem = (item) => {
        const qtd =
            Number(item.qtd_consumida) || 0;

        const custoUnit =
            Number(item.custo_unitario) || 0;

        return qtd * custoUnit;
    };

    const custoTotalProduto = itens.reduce(
        (total, item) =>
            total + custoItem(item),
        0
    );

    const precoVendaNum =
        produtoPreco !== null &&
        produtoPreco !== undefined
            ? Number(produtoPreco)
            : null;

    const temPrecoVenda =
        precoVendaNum !== null &&
        !isNaN(precoVendaNum) &&
        precoVendaNum > 0;

    const margemValor = temPrecoVenda
        ? precoVendaNum - custoTotalProduto
        : null;

    const margemPercentual =
        temPrecoVenda &&
        precoVendaNum > 0
            ? (margemValor / precoVendaNum) * 100
            : null;

    const insumosOrdenadosParaEstoque =
        [...insumosDisponiveis].sort(
            (a, b) => {
                const aAlerta =
                    Number(a.qtd_minima) > 0 &&
                    Number(a.qtd_atual) <=
                        Number(a.qtd_minima);

                const bAlerta =
                    Number(b.qtd_minima) > 0 &&
                    Number(b.qtd_atual) <=
                        Number(b.qtd_minima);

                if (aAlerta !== bAlerta) {
                    return aAlerta ? -1 : 1;
                }

                return String(
                    a.nome || ""
                ).localeCompare(
                    String(b.nome || "")
                );
            }
        );

    /*
     * ADICIONAR INGREDIENTE
     */
    const adicionarIngrediente = async (e) => {
        e.preventDefault();

        if (!idProduto) {
            setErro("ID do produto inválido.");
            return;
        }

        if (!novoInsumoId) {
            setErro("Selecione um insumo.");
            return;
        }

        const valor = Number(novaQtd);

        if (isNaN(valor) || valor <= 0) {
            setErro(
                "Informe uma quantidade válida."
            );
            return;
        }

        setErro("");
        setSucesso("");
        setIsSalvando(true);

        try {
            console.log(
                "➕ [FICHA] Adicionando ingrediente:",
                {
                    id_produto: idProduto,
                    id_insumo: novoInsumoId,
                    qtd_consumida: valor
                }
            );

            await api.post(`/produtos/ficha`, {
                id_produto: Number(idProduto),
                id_insumo: Number(novoInsumoId),
                qtd_consumida: Number(
                    valor.toFixed(3)
                )
            });

            setNovoInsumoId("");
            setNovaQtd("");

            setSucesso(
                "Ingrediente adicionado com sucesso!"
            );

            await carregarDados();

            /*
             * IMPORTANTE:
             * Aguarda o callback do Cardapio.
             */
            if (onEstoqueAtualizado) {
                console.log(
                    "🔄 [FICHA] Solicitando recálculo após ADIÇÃO:",
                    idProduto
                );

                await onEstoqueAtualizado(
                    idProduto
                );

                console.log(
                    "✅ [FICHA] Recálculo após ADIÇÃO concluído."
                );
            }

            setTimeout(
                () => setSucesso(""),
                2500
            );
        } catch (err) {
            console.error(
                "❌ Erro ao adicionar ingrediente:",
                err.response?.data || err
            );

            setErro(
                err.response?.data?.erro ||
                    err.response?.data?.message ||
                    "Erro ao adicionar ingrediente."
            );
        } finally {
            setIsSalvando(false);
        }
    };

    const iniciarEdicao = (item) => {
        setEditandoId(item.id_ficha);
        setQtdEditada(
            String(item.qtd_consumida)
        );
    };

    const cancelarEdicao = () => {
        setEditandoId(null);
        setQtdEditada("");
    };

    /*
     * EDITAR INGREDIENTE
     */
    const salvarEdicao = async (id_ficha) => {
        const valor = Number(qtdEditada);

        if (isNaN(valor) || valor <= 0) {
            setErro(
                "Informe uma quantidade válida."
            );
            return;
        }

        setErro("");
        setSucesso("");

        try {
            console.log(
                "✏️ [FICHA] Alterando ingrediente:",
                id_ficha,
                valor
            );

            await api.put(
                `/produtos/ficha/${id_ficha}`,
                {
                    qtd_consumida: Number(
                        valor.toFixed(3)
                    )
                }
            );

            setEditandoId(null);
            setQtdEditada("");

            setSucesso(
                "Quantidade atualizada com sucesso!"
            );

            await carregarDados();

            if (onEstoqueAtualizado) {
                console.log(
                    "🔄 [FICHA] Solicitando recálculo após EDIÇÃO:",
                    idProduto
                );

                await onEstoqueAtualizado(
                    idProduto
                );

                console.log(
                    "✅ [FICHA] Recálculo após EDIÇÃO concluído."
                );
            }

            setTimeout(
                () => setSucesso(""),
                2500
            );
        } catch (err) {
            console.error(
                "❌ Erro ao atualizar quantidade:",
                err.response?.data || err
            );

            setErro(
                "Erro ao atualizar quantidade."
            );
        }
    };

    const pedirConfirmacaoExclusao = (item) => {
        setConfirmaExclusao({
            aberto: true,
            id_ficha: item.id_ficha,
            nome: item.nome
        });
    };

    const fecharConfirmacao = () => {
        setConfirmaExclusao({
            aberto: false,
            id_ficha: null,
            nome: ""
        });
    };

    /*
     * EXCLUIR INGREDIENTE
     */
    const confirmarExcluir = async () => {
        if (!confirmaExclusao.id_ficha) {
            return;
        }

        setErro("");
        setSucesso("");

        try {
            console.log(
                "🗑️ [FICHA] Excluindo ingrediente:",
                confirmaExclusao.id_ficha
            );

            await api.delete(
                `/produtos/ficha/${confirmaExclusao.id_ficha}`
            );

            setSucesso(
                "Ingrediente removido com sucesso!"
            );

            fecharConfirmacao();

            await carregarDados();

            if (onEstoqueAtualizado) {
                console.log(
                    "🔄 [FICHA] Solicitando recálculo após EXCLUSÃO:",
                    idProduto
                );

                await onEstoqueAtualizado(
                    idProduto
                );

                console.log(
                    "✅ [FICHA] Recálculo após EXCLUSÃO concluído."
                );
            }

            setTimeout(
                () => setSucesso(""),
                2500
            );
        } catch (err) {
            console.error(
                "❌ Erro ao remover ingrediente:",
                err.response?.data || err
            );

            setErro(
                "Erro ao remover ingrediente."
            );
        }
    };

    return (
        <div className="ficha-tecnica-container">
            <h2 className="titulo">
                Ficha Técnica ({produtoNome} - ID:{" "}
                {idProduto})
            </h2>

            <div className="divider" />

            <p className="sub-title">
                Toda vez que este produto for vendido
                e o pedido for finalizado, o sistema
                desconta automaticamente do estoque a
                quantidade de cada insumo informada aqui.
            </p>

            {!isLoading && itens.length > 0 && (
                <div className="custo-resumo-card">
                    <div className="custo-resumo-linha">
                        <span className="custo-resumo-label">
                            Custo de produção
                            (ingredientes)
                        </span>

                        <span className="custo-resumo-valor">
                            R${" "}
                            {formatMoeda(
                                custoTotalProduto
                            )}
                        </span>
                    </div>

                    {temPrecoVenda && (
                        <>
                            <div className="custo-resumo-linha">
                                <span className="custo-resumo-label">
                                    Preço de venda
                                </span>

                                <span className="custo-resumo-valor">
                                    R${" "}
                                    {formatMoeda(
                                        precoVendaNum
                                    )}
                                </span>
                            </div>

                            <div className="custo-resumo-linha">
                                <span className="custo-resumo-label">
                                    Margem (lucro bruto)
                                </span>

                                <span
                                    className={`custo-resumo-valor ${
                                        margemValor <
                                        0
                                            ? "negativo"
                                            : "positivo"
                                    }`}
                                >
                                    R${" "}
                                    {formatMoeda(
                                        margemValor
                                    )}{" "}
                                    (
                                    {margemPercentual.toFixed(
                                        1
                                    )}
                                    %)
                                </span>
                            </div>
                        </>
                    )}
                </div>
            )}

            <button
                type="button"
                className="btn-ver-estoque-insumos"
                onClick={() =>
                    setMostrarEstoqueInsumos(
                        (prev) => !prev
                    )
                }
            >
                <Package size={16} />

                <span>
                    {mostrarEstoqueInsumos
                        ? "Ocultar"
                        : "Ver"}{" "}
                    estoque dos insumos
                </span>

                {mostrarEstoqueInsumos ? (
                    <ChevronUp size={16} />
                ) : (
                    <ChevronDown size={16} />
                )}
            </button>

            {mostrarEstoqueInsumos && (
                <div className="painel-estoque-insumos">
                    {insumosDisponiveis.length ===
                    0 ? (
                        <p className="mensagem-vazia">
                            Nenhum insumo cadastrado
                            ainda.
                        </p>
                    ) : (
                        <ul className="lista-estoque-insumos">
                            {insumosOrdenadosParaEstoque.map(
                                (insumo) => {
                                    const qtdAtual =
                                        Number(
                                            insumo.qtd_atual
                                        ) || 0;

                                    const qtdMinima =
                                        Number(
                                            insumo.qtd_minima
                                        ) || 0;

                                    const emAlerta =
                                        qtdMinima >
                                            0 &&
                                        qtdAtual <=
                                            qtdMinima;

                                    return (
                                        <li
                                            key={
                                                insumo.id_insumo
                                            }
                                            className={`estoque-insumo-linha ${
                                                emAlerta
                                                    ? "em-alerta"
                                                    : ""
                                            }`}
                                        >
                                            <span className="estoque-insumo-nome">
                                                {emAlerta && (
                                                    <span title="Estoque baixo">
                                                        ⚠️
                                                    </span>
                                                )}{" "}
                                                {
                                                    insumo.nome
                                                }
                                            </span>

                                            <span className="estoque-insumo-qtd">
                                                {formatQtd(
                                                    qtdAtual,
                                                    insumo.unidade_medida
                                                )}
                                            </span>
                                        </li>
                                    );
                                }
                            )}
                        </ul>
                    )}
                </div>
            )}

            <form
                onSubmit={adicionarIngrediente}
                className="form-adicionar-ficha"
            >
                <div className="form-adicionar-linha">
                    <div className="form-group-select">
                        <select
                            className="select-insumo"
                            value={novoInsumoId}
                            onChange={(e) =>
                                setNovoInsumoId(
                                    e.target.value
                                )
                            }
                        >
                            <option value="">
                                Selecione o insumo...
                            </option>

                            {insumosDisponiveisMap(
                                insumosDisponiveis
                            ).map((insumo) => (
                                <option
                                    key={
                                        insumo.id_insumo
                                    }
                                    value={
                                        insumo.id_insumo
                                    }
                                >
                                    {insumo.nome} (
                                    {
                                        insumo.unidade_medida
                                    }
                                    )
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group-qtd">
                        <input
                            type="number"
                            className="input-qtd"
                            placeholder="Qtd"
                            step={stepPorUnidade(
                                unidadeAtual
                            )}
                            value={novaQtd}
                            onChange={(e) =>
                                setNovaQtd(
                                    e.target.value
                                )
                            }
                        />

                        <span className="unidade-label">
                            {unidadeAtual}
                        </span>
                    </div>
                </div>

                <button
                    type="submit"
                    className="btn-adicionar-ficha"
                    disabled={isSalvando}
                >
                    {isSalvando ? (
                        <Loader2
                            size={16}
                            className="spin"
                        />
                    ) : (
                        <Plus size={16} />
                    )}

                    <span>
                        Adicionar Ingrediente
                    </span>
                </button>
            </form>

            {erro && (
                <div className="alert-erro">
                    <AlertCircle size={18} />
                    <span>{erro}</span>
                </div>
            )}

            {sucesso && (
                <div className="alert-sucesso">
                    {sucesso}
                </div>
            )}

            {isLoading ? (
                <div className="loading">
                    <Loader2
                        size={20}
                        className="spin"
                    />

                    <span>
                        Carregando ingredientes...
                    </span>
                </div>
            ) : itens.length === 0 ? (
                <div className="mensagem-vazia-container">
                    <p className="mensagem-vazia">
                        Nenhum ingrediente vinculado
                        a este produto ainda.
                    </p>
                </div>
            ) : (
                <ul className="itens-lista">
                    {itens.map((item) => {
                        const isEditando =
                            editandoId ===
                            item.id_ficha;

                        return (
                            <li
                                key={item.id_ficha}
                                className="item-linha"
                            >
                                <span className="item-nome">
                                    {item.nome}
                                </span>

                                <div className="item-detalhes">
                                    {isEditando ? (
                                        <>
                                            <input
                                                type="number"
                                                className="input-inplace"
                                                step={stepPorUnidade(
                                                    item.unidade_medida
                                                )}
                                                value={
                                                    qtdEditada
                                                }
                                                onChange={(
                                                    e
                                                ) =>
                                                    setQtdEditada(
                                                        e
                                                            .target
                                                            .value
                                                    )
                                                }
                                            />

                                            <button
                                                type="button"
                                                className="btn-commit"
                                                title="Salvar"
                                                onClick={() =>
                                                    salvarEdicao(
                                                        item.id_ficha
                                                    )
                                                }
                                            >
                                                <Check
                                                    size={
                                                        16
                                                    }
                                                />
                                            </button>

                                            <button
                                                type="button"
                                                className="btn-cancel"
                                                title="Cancelar"
                                                onClick={
                                                    cancelarEdicao
                                                }
                                            >
                                                <X
                                                    size={
                                                        16
                                                    }
                                                />
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <span className="item-valor">
                                                Consome{" "}
                                                {formatQtd(
                                                    item.qtd_consumida,
                                                    item.unidade_mdida ||
                                                        item.unidade_medida
                                                )}{" "}
                                                por venda

                                                <span className="item-custo">
                                                    {" "}
                                                    — R${" "}
                                                    {formatMoeda(
                                                        custoItem(
                                                            item
                                                        )
                                                    )}
                                                </span>
                                            </span>

                                            <button
                                                type="button"
                                                className="btn-edit-inline"
                                                title="Editar quantidade"
                                                onClick={() =>
                                                    iniciarEdicao(
                                                        item
                                                    )
                                                }
                                            >
                                                <Edit2
                                                    size={
                                                        16
                                                    }
                                                />
                                            </button>

                                            <button
                                                type="button"
                                                className="btn-delete-inline"
                                                title="Remover ingrediente"
                                                onClick={() =>
                                                    pedirConfirmacaoExclusao(
                                                        item
                                                    )
                                                }
                                            >
                                                <Trash2
                                                    size={
                                                        16
                                                    }
                                                />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}

            {confirmaExclusao.aberto && (
                <div
                    className="modal-overlay"
                    role="dialog"
                    aria-modal="true"
                >
                    <div className="modal-card">
                        <h3 className="modal-title">
                            Remover ingrediente?
                        </h3>

                        <p className="modal-text">
                            Tem certeza que deseja
                            remover{" "}
                            <b>
                                {
                                    confirmaExclusao.nome
                                }
                            </b>{" "}
                            da ficha técnica?
                        </p>

                        <div className="modal-actions">
                            <button
                                type="button"
                                className="btn-modal cancelar"
                                onClick={
                                    fecharConfirmacao
                                }
                            >
                                Não
                            </button>

                            <button
                                type="button"
                                className="btn-modal confirmar"
                                onClick={
                                    confirmarExcluir
                                }
                            >
                                Sim
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function insumosDisponiveisMap(arr) {
    return Array.isArray(arr) ? arr : [];
}