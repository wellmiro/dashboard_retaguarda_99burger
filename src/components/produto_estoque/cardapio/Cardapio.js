import React, { useState, useEffect, useCallback } from "react";
import {
    getProdutos,
    updateProduto,
    deleteProduto
} from "../../../api/Produtos";
import { getCategorias } from "../../../api/Categorias";
import { getFichaTecnica } from "../../../api/Insumos";
import Grupos from "../grupos/Grupos";
import FichaTecnica from "../FichaTecnica/FichaTecnica";
import {
    formatQtd,
    stepPorUnidade,
    isFracionado,
    UNIDADES_MEDIDA
} from "../../../utils/formatQtd";
import "./Styles.css";

const getBadge = (qtd) => {
    const quantidade = Number(qtd) || 0;

    if (quantidade <= 0) {
        return {
            text: "Fora de estoque",
            color: "vermelho"
        };
    }

    if (quantidade <= 5) {
        return {
            text: "Estoque baixo",
            color: "laranja"
        };
    }

    return {
        text: "Ativo",
        color: "verde"
    };
};

const INITIAL_MODAL_FORM = {
    nome: "",
    descricao: "",
    preco: 0,
    qtd: 0,
    qtd_max: 0,
    qtd_min: 0,
    unidade_medida: "UN",
    id_categoria: "",
    url_foto: "",
    grupos: []
};

/*
 * Calcula quantas unidades do produto podem ser produzidas
 * considerando o insumo que limita a produção.
 */
const calcularEstoqueRealPorFicha = (
    itensFicha,
    unidadeProduto = "UN"
) => {
    if (
        !Array.isArray(itensFicha) ||
        itensFicha.length === 0
    ) {
        return null;
    }

    const capacidades = itensFicha.map((item) => {
        const qtdAtualInsumo =
            Number(item.qtd_atual) || 0;

        const qtdConsumida =
            Number(item.qtd_consumida) || 0;

        /*
         * Evita divisão por zero.
         * Se um item não consome nada, ele não limita a produção.
         */
        if (qtdConsumida <= 0) {
            return Infinity;
        }

        return qtdAtualInsumo / qtdConsumida;
    });

    const menorCapacidade = Math.min(
        ...capacidades
    );

    if (!isFinite(menorCapacidade)) {
        return 0;
    }

    const produtoFracionado =
        isFracionado(unidadeProduto);

    return produtoFracionado
        ? Number(menorCapacidade.toFixed(3))
        : Math.floor(menorCapacidade);
};

const Cardapio = () => {
    const [produtosState, setProdutosState] =
        useState([]);

    const [categoriasList, setCategoriasList] =
        useState([]);

    const [produtoEdit, setProdutoEdit] =
        useState(null);

    const [activeTab, setActiveTab] =
        useState("informacoes");

    const [formData, setFormData] =
        useState(INITIAL_MODAL_FORM);

    const [isLoading, setIsLoading] =
        useState(true);

    const [
        qtdBloqueadaPorFicha,
        setQtdBloqueadaPorFicha
    ] = useState(false);

    const [
        carregandoEstoqueReal,
        setCarregandoEstoqueReal
    ] = useState(false);

    /*
     * =========================================================
     * CATEGORIAS
     * =========================================================
     */

    const fetchCategorias = useCallback(
        async () => {
            try {
                const response =
                    await getCategorias();

                const dataArray =
                    Array.isArray(response.data)
                        ? response.data
                        : [];

                setCategoriasList(dataArray);
            } catch (err) {
                console.error(
                    "Erro ao buscar categorias:",
                    err
                );

                setCategoriasList([]);
            }
        },
        []
    );

    /*
     * =========================================================
     * PRODUTOS
     * =========================================================
     */

    const fetchProdutos = useCallback(
        async () => {
            setIsLoading(true);

            try {
                const response =
                    await getProdutos();

                const dataArray =
                    Array.isArray(response.data)
                        ? response.data
                        : [];

                setProdutosState(dataArray);
            } catch (err) {
                console.error(
                    "Erro ao buscar produtos:",
                    err
                );

                setProdutosState([]);
            } finally {
                setIsLoading(false);
            }
        },
        []
    );

    useEffect(() => {
        fetchCategorias();
        fetchProdutos();
    }, [
        fetchCategorias,
        fetchProdutos
    ]);

    /*
     * =========================================================
     * CATEGORIAS COM PRODUTOS
     *
     * Usa String() para evitar problema caso o backend
     * mande id_categoria como número e o outro endpoint
     * mande como string.
     * =========================================================
     */

    const categoriasComProdutos =
        categoriasList.filter((cat) =>
            produtosState.some(
                (p) =>
                    String(p.id_categoria) ===
                    String(cat.id_categoria)
            )
        );

    /*
     * =========================================================
     * ATUALIZAR ESTOQUE REAL
     * =========================================================
     *
     * Regra:
     *
     * - Com ficha técnica:
     *      calcula estoque pela menor capacidade
     *      e trava o campo Qtd.
     *
     * - Sem ficha técnica:
     *      qtd = 0
     *      libera edição manual.
     *
     * IMPORTANTE:
     * Quando a ficha fica vazia depois de excluir
     * o último ingrediente, também atualizamos o produto
     * para qtd = 0.
     */

    const atualizarEstoqueRealDoFormulario =
        useCallback(
            async (produto) => {
                if (!produto?.id_produto) {
                    console.error(
                        "❌ Produto inválido para atualizar estoque."
                    );

                    return;
                }

                const idProduto =
                    produto.id_produto;

                setCarregandoEstoqueReal(true);

                try {
                    console.log(
                        "🔎 [ESTOQUE] Buscando ficha técnica:",
                        idProduto
                    );

                    const res =
                        await getFichaTecnica(
                            idProduto
                        );

                    const itensFicha =
                        Array.isArray(res.data)
                            ? res.data
                            : (
                                  res.data?.data ||
                                  []
                              );

                    console.log(
                        "📋 [ESTOQUE] Ficha encontrada:",
                        itensFicha
                    );

                    /*
                     * =====================================================
                     * PRODUTO COM FICHA TÉCNICA
                     * =====================================================
                     */

                    if (
                        itensFicha.length > 0
                    ) {
                        const estoqueReal =
                            calcularEstoqueRealPorFicha(
                                itensFicha,
                                produto.unidade_medida
                            );

                        console.log(
                            "🧮 [ESTOQUE] Estoque calculado:",
                            estoqueReal
                        );

                        /*
                         * Atualiza o formulário imediatamente.
                         */

                        setFormData(
                            (prev) => ({
                                ...prev,
                                qtd: estoqueReal
                            })
                        );

                        setQtdBloqueadaPorFicha(
                            true
                        );

                        /*
                         * Grava somente a qtd no backend.
                         */

                        await updateProduto(
                            idProduto,
                            {
                                qtd: estoqueReal
                            }
                        );

                        /*
                         * Atualiza o produto no card.
                         */

                        setProdutosState(
                            (prev) =>
                                prev.map((p) =>
                                    String(
                                        p.id_produto
                                    ) ===
                                    String(
                                        idProduto
                                    )
                                        ? {
                                              ...p,
                                              qtd: estoqueReal
                                          }
                                        : p
                                )
                        );

                        /*
                         * Atualiza produtoEdit.
                         */

                        setProdutoEdit(
                            (prev) =>
                                prev &&
                                String(
                                    prev.id_produto
                                ) ===
                                    String(
                                        idProduto
                                    )
                                    ? {
                                          ...prev,
                                          qtd: estoqueReal
                                      }
                                    : prev
                        );

                        console.log(
                            "✅ [ESTOQUE] Produto atualizado:",
                            estoqueReal
                        );

                        return;
                    }

                    /*
                     * =====================================================
                     * SEM FICHA TÉCNICA
                     * =====================================================
                     *
                     * Isso acontece principalmente quando o usuário
                     * exclui o último ingrediente.
                     *
                     * Nesse momento o estoque calculado deixa de existir.
                     *
                     * Portanto:
                     *
                     * 1. qtd = 0
                     * 2. salva qtd = 0 no backend
                     * 3. atualiza card
                     * 4. libera edição manual
                     */

                    console.log(
                        "ℹ️ [ESTOQUE] Ficha técnica vazia."
                    );

                    setFormData(
                        (prev) => ({
                            ...prev,
                            qtd: 0
                        })
                    );

                    setQtdBloqueadaPorFicha(
                        false
                    );

                    /*
                     * IMPORTANTE:
                     * Quando a ficha foi excluída completamente,
                     * o estoque do produto também precisa voltar
                     * para zero.
                     */

                    await updateProduto(
                        idProduto,
                        {
                            qtd: 0
                        }
                    );

                    setProdutosState(
                        (prev) =>
                            prev.map((p) =>
                                String(
                                    p.id_produto
                                ) ===
                                String(idProduto)
                                    ? {
                                          ...p,
                                          qtd: 0
                                      }
                                    : p
                            )
                    );

                    setProdutoEdit(
                        (prev) =>
                            prev &&
                            String(
                                prev.id_produto
                            ) ===
                                String(idProduto)
                                ? {
                                      ...prev,
                                      qtd: 0
                                  }
                                : prev
                    );

                    console.log(
                        "✅ [ESTOQUE] Ficha vazia. Estoque definido como 0."
                    );
                } catch (err) {
                    console.error(
                        "❌ [ESTOQUE] Erro:",
                        err.response?.data ||
                            err
                    );
                } finally {
                    setCarregandoEstoqueReal(
                        false
                    );
                }
            },
            []
        );

    /*
     * =========================================================
     * EDITAR PRODUTO
     * =========================================================
     */

    const handleEditClick =
        useCallback(
            async (produto) => {
                if (
                    !produto ||
                    !produto.id_produto
                ) {
                    alert(
                        "Erro: Produto inválido ou ID não encontrado."
                    );

                    return;
                }

                console.log(
                    "Selecionando produto:",
                    produto
                );

                setProdutoEdit(produto);

                setFormData({
                    nome:
                        produto.nome || "",

                    descricao:
                        produto.descricao ||
                        "",

                    preco:
                        parseFloat(
                            produto.preco
                        ) || 0,

                    qtd:
                        produto.qtd ?? 0,

                    qtd_max:
                        produto.qtd_max ?? 0,

                    qtd_min:
                        produto.qtd_min ?? 0,

                    unidade_medida:
                        produto.unidade_medida ||
                        "UN",

                    id_categoria:
                        produto.id_categoria !=
                        null
                            ? String(
                                  produto.id_categoria
                              )
                            : "",

                    url_foto:
                        produto.url_foto ||
                        "",

                    grupos:
                        produto.grupos || []
                });

                setActiveTab(
                    "informacoes"
                );

                setQtdBloqueadaPorFicha(
                    false
                );

                await atualizarEstoqueRealDoFormulario(
                    produto
                );
            },
            [
                atualizarEstoqueRealDoFormulario
            ]
        );

    /*
     * =========================================================
     * CALLBACK DA FICHA TÉCNICA
     * =========================================================
     *
     * É chamado após:
     *
     * - adicionar ingrediente
     * - editar ingrediente
     * - excluir ingrediente
     *
     * Inclusive quando excluir o último ingrediente.
     */

    const handleEstoqueAtualizado =
        useCallback(
            async () => {
                if (
                    !produtoEdit?.id_produto
                ) {
                    return;
                }

                const produtoAtual =
                    produtosState.find(
                        (p) =>
                            String(
                                p.id_produto
                            ) ===
                            String(
                                produtoEdit.id_produto
                            )
                    ) ||
                    produtoEdit;

                await atualizarEstoqueRealDoFormulario(
                    produtoAtual
                );
            },
            [
                produtoEdit,
                produtosState,
                atualizarEstoqueRealDoFormulario
            ]
        );

    /*
     * =========================================================
     * TROCAR ABA
     * =========================================================
     */

    const handleTrocarAba =
        useCallback(
            async (novaAba) => {
                setActiveTab(novaAba);

                if (
                    novaAba ===
                        "informacoes" &&
                    produtoEdit?.id_produto
                ) {
                    const produtoAtual =
                        produtosState.find(
                            (p) =>
                                String(
                                    p.id_produto
                                ) ===
                                String(
                                    produtoEdit.id_produto
                                )
                        ) ||
                        produtoEdit;

                    await atualizarEstoqueRealDoFormulario(
                        produtoAtual
                    );
                }
            },
            [
                produtoEdit,
                produtosState,
                atualizarEstoqueRealDoFormulario
            ]
        );

    /*
     * =========================================================
     * INPUTS
     * =========================================================
     */

    const handleInputChange =
        useCallback((e) => {
            const {
                name,
                value
            } = e.target;

            setFormData(
                (prev) => ({
                    ...prev,
                    [name]: value
                })
            );
        }, []);

    const handleUnidadeChange =
        useCallback((e) => {
            const novaUnidade =
                e.target.value;

            setFormData(
                (prev) => {
                    const ajustarValor =
                        (valor) => {
                            const num =
                                Number(
                                    valor
                                ) || 0;

                            return isFracionado(
                                novaUnidade
                            )
                                ? num
                                : Math.round(
                                      num
                                  );
                        };

                    return {
                        ...prev,

                        unidade_medida:
                            novaUnidade,

                        qtd: ajustarValor(
                            prev.qtd
                        ),

                        qtd_max:
                            ajustarValor(
                                prev.qtd_max
                            ),

                        qtd_min:
                            ajustarValor(
                                prev.qtd_min
                            )
                    };
                }
            );
        }, []);

    const handleEditImageUrl =
        useCallback(() => {
            const url = prompt(
                "Informe a nova URL da foto:",
                formData.url_foto
            );

            if (url !== null) {
                setFormData(
                    (prev) => ({
                        ...prev,
                        url_foto: url
                    })
                );
            }
        }, [
            formData.url_foto
        ]);

    /*
     * =========================================================
     * ATUALIZAR PRODUTO
     * =========================================================
     */

    const handleUpdateProduto =
        async () => {
            if (
                !produtoEdit ||
                !produtoEdit.id_produto
            ) {
                alert(
                    "Erro: ID do produto não encontrado!"
                );

                return;
            }

            const fracionado =
                isFracionado(
                    formData.unidade_medida
                );

            const parseQtd =
                (valor) => {
                    const num =
                        Number(valor) || 0;

                    return fracionado
                        ? Number(
                              num.toFixed(
                                  3
                              )
                          )
                        : Math.round(num);
                };

            const idCategoria =
                formData.id_categoria
                    ? parseInt(
                          formData.id_categoria,
                          10
                      )
                    : null;

            const payload = {
                nome: formData.nome,

                descricao:
                    formData.descricao,

                preco:
                    parseFloat(
                        formData.preco
                    ) || 0,

                qtd: parseQtd(
                    formData.qtd
                ),

                qtd_max: parseQtd(
                    formData.qtd_max
                ),

                qtd_min: parseQtd(
                    formData.qtd_min
                ),

                unidade_medida:
                    formData.unidade_medida,

                id_categoria:
                    idCategoria,

                url_foto:
                    formData.url_foto
            };

            console.log(
                "🚀 [PUT PRODUTO]",
                produtoEdit.id_produto,
                payload
            );

            try {
                await updateProduto(
                    produtoEdit.id_produto,
                    payload
                );

                alert(
                    "Produto atualizado com sucesso!"
                );

                await fetchProdutos();

                setProdutoEdit(
                    null
                );
            } catch (err) {
                console.error(
                    "Erro ao atualizar produto:",
                    err.response
                        ?.data || err
                );

                alert(
                    `Erro ao atualizar produto! Detalhe: ${
                        err.response
                            ?.data
                            ?.message ||
                        err.response
                            ?.data
                            ?.error ||
                        "Verifique o console."
                    }`
                );
            }
        };

    /*
     * =========================================================
     * DELETAR PRODUTO
     * =========================================================
     */

    const handleDeleteProduto =
        async () => {
            if (
                !produtoEdit ||
                !produtoEdit.id_produto
            ) {
                alert(
                    "Erro: ID do produto não encontrado!"
                );

                return;
            }

            if (
                !window.confirm(
                    "Deseja realmente deletar este produto?"
                )
            ) {
                return;
            }

            try {
                await deleteProduto(
                    produtoEdit.id_produto
                );

                alert(
                    "Produto deletado com sucesso!"
                );

                await fetchProdutos();

                setProdutoEdit(
                    null
                );
            } catch (err) {
                console.error(
                    "Erro ao deletar produto:",
                    err.response
                        ?.data || err
                );

                alert(
                    `Erro ao deletar produto: ${
                        err.response
                            ?.data
                            ?.error ||
                        "Verifique o console."
                    }`
                );
            }
        };

    /*
     * =========================================================
     * LOADING
     * =========================================================
     */

    if (isLoading) {
        return (
            <div className="cardapio-loading">
                Carregando Cardápio...
            </div>
        );
    }

    /*
     * =========================================================
     * RENDER
     * =========================================================
     */

    return (
        <div className="cardapio-panel">
            {categoriasComProdutos.map(
                (cat) => {
                    const produtosCat =
                        produtosState
                            .filter(
                                (p) =>
                                    String(
                                        p.id_categoria
                                    ) ===
                                    String(
                                        cat.id_categoria
                                    )
                            )
                            .sort(
                                (a, b) =>
                                    Number(
                                        a.id_produto
                                    ) -
                                    Number(
                                        b.id_produto
                                    )
                            );

                    return (
                        <div
                            key={
                                cat.id_categoria
                            }
                            className="categoria-section"
                        >
                            <div className="categoria-header">
                                <h2 className="section-title">
                                    ✨{" "}
                                    {
                                        cat.descricao
                                    }
                                </h2>
                            </div>

                            <div className="row">
                                {produtosCat.map(
                                    (p) => {
                                        const badge =
                                            getBadge(
                                                p.qtd
                                            );

                                        return (
                                            <div
                                                key={
                                                    p.id_produto
                                                }
                                                className="product-card"
                                            >
                                                <button
                                                    className="edit-btn"
                                                    onClick={() =>
                                                        handleEditClick(
                                                            p
                                                        )
                                                    }
                                                    title="Editar produto"
                                                >
                                                    ✏️
                                                </button>

                                                {p.url_foto && (
                                                    <img
                                                        src={
                                                            p.url_foto
                                                        }
                                                        alt={
                                                            p.nome
                                                        }
                                                    />
                                                )}

                                                <h5>
                                                    {
                                                        p.nome
                                                    }
                                                </h5>

                                                <p>
                                                    Qtd:{" "}
                                                    {formatQtd(
                                                        p.qtd,
                                                        p.unidade_medida
                                                    )}{" "}
                                                    | R${" "}
                                                    {Number(
                                                        p.preco
                                                    ).toFixed(
                                                        2
                                                    )}
                                                </p>

                                                {Number(
                                                    p.custo_total
                                                ) >
                                                    0 && (
                                                    <p className="custo-produto-card">
                                                        Custo:
                                                        {" "}
                                                        R${" "}
                                                        {Number(
                                                            p.custo_total
                                                        ).toFixed(
                                                            2
                                                        )}

                                                        <span
                                                            className={`margem-inline ${
                                                                Number(
                                                                    p.preco
                                                                ) -
                                                                    Number(
                                                                        p.custo_total
                                                                    ) <
                                                                0
                                                                    ? "negativo"
                                                                    : "positivo"
                                                            }`}
                                                        >
                                                            {" "}
                                                            (margem
                                                            {" "}
                                                            R${" "}
                                                            {(
                                                                Number(
                                                                    p.preco
                                                                ) -
                                                                Number(
                                                                    p.custo_total
                                                                )
                                                            ).toFixed(
                                                                2
                                                            )}
                                                            )
                                                        </span>
                                                    </p>
                                                )}

                                                <span
                                                    className={`badge ${badge.color}`}
                                                >
                                                    {
                                                        badge.text
                                                    }
                                                </span>
                                            </div>
                                        );
                                    }
                                )}
                            </div>
                        </div>
                    );
                }
            )}

            {produtoEdit &&
                produtoEdit.id_produto && (
                    <div
                        className="modal-overlay"
                        onClick={() =>
                            setProdutoEdit(
                                null
                            )
                        }
                    >
                        <div
                            className="modal"
                            onClick={(e) =>
                                e.stopPropagation()
                            }
                        >
                            <div className="modal-img-container">
                                {formData.url_foto && (
                                    <img
                                        src={
                                            formData.url_foto
                                        }
                                        alt={
                                            formData.nome
                                        }
                                        className="modal-img"
                                    />
                                )}

                                <button
                                    className="edit-img-btn"
                                    onClick={
                                        handleEditImageUrl
                                    }
                                >
                                    ✏️
                                </button>
                            </div>

                            <div className="modal-tabs">
                                <button
                                    className={`btn ${
                                        activeTab ===
                                        "informacoes"
                                            ? "salvar"
                                            : ""
                                    }`}
                                    onClick={() =>
                                        handleTrocarAba(
                                            "informacoes"
                                        )
                                    }
                                >
                                    Informações
                                </button>

                                <button
                                    className={`btn ${
                                        activeTab ===
                                        "grupos"
                                            ? "salvar"
                                            : ""
                                    }`}
                                    onClick={() =>
                                        handleTrocarAba(
                                            "grupos"
                                        )
                                    }
                                >
                                    Grupos
                                </button>

                                <button
                                    className={`btn ${
                                        activeTab ===
                                        "ficha"
                                            ? "salvar"
                                            : ""
                                    }`}
                                    onClick={() =>
                                        handleTrocarAba(
                                            "ficha"
                                        )
                                    }
                                >
                                    Ficha Técnica
                                </button>
                            </div>

                            {activeTab ===
                                "informacoes" && (
                                <div className="modal-form">
                                    <div className="form-group full">
                                        <label>
                                            Nome
                                        </label>

                                        <input
                                            type="text"
                                            name="nome"
                                            value={
                                                formData.nome
                                            }
                                            onChange={
                                                handleInputChange
                                            }
                                        />
                                    </div>

                                    <div className="form-group full">
                                        <label>
                                            Descrição
                                        </label>

                                        <textarea
                                            name="descricao"
                                            value={
                                                formData.descricao
                                            }
                                            onChange={
                                                handleInputChange
                                            }
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>
                                            Preço
                                        </label>

                                        <input
                                            type="number"
                                            step="0.01"
                                            name="preco"
                                            value={
                                                formData.preco
                                            }
                                            onChange={
                                                handleInputChange
                                            }
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>
                                            Unidade de
                                            Medida
                                        </label>

                                        <select
                                            name="unidade_medida"
                                            value={
                                                formData.unidade_medida
                                            }
                                            onChange={
                                                handleUnidadeChange
                                            }
                                        >
                                            {UNIDADES_MEDIDA.map(
                                                (
                                                    u
                                                ) => (
                                                    <option
                                                        key={
                                                            u
                                                        }
                                                        value={
                                                            u
                                                        }
                                                    >
                                                        {
                                                            u
                                                        }
                                                    </option>
                                                )
                                            )}
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label>
                                            Qtd

                                            {qtdBloqueadaPorFicha && (
                                                <span
                                                    className="qtd-ficha-badge"
                                                    title="Calculado automaticamente com base no estoque dos insumos da ficha técnica."
                                                >
                                                    {" "}
                                                    🔒
                                                    calculado
                                                    pela
                                                    ficha
                                                    técnica
                                                </span>
                                            )}
                                        </label>

                                        <input
                                            type="number"
                                            step={stepPorUnidade(
                                                formData.unidade_medida
                                            )}
                                            min="0"
                                            name="qtd"
                                            value={
                                                carregandoEstoqueReal
                                                    ? "..."
                                                    : formData.qtd
                                            }
                                            onChange={
                                                handleInputChange
                                            }
                                            disabled={
                                                qtdBloqueadaPorFicha ||
                                                carregandoEstoqueReal
                                            }
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>
                                            Qtd
                                            Máx
                                        </label>

                                        <input
                                            type="number"
                                            step={stepPorUnidade(
                                                formData.unidade_medida
                                            )}
                                            min="0"
                                            name="qtd_max"
                                            value={
                                                formData.qtd_max
                                            }
                                            onChange={
                                                handleInputChange
                                            }
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>
                                            Qtd
                                            Min
                                        </label>

                                        <input
                                            type="number"
                                            step={stepPorUnidade(
                                                formData.unidade_medida
                                            )}
                                            min="0"
                                            name="qtd_min"
                                            value={
                                                formData.qtd_min
                                            }
                                            onChange={
                                                handleInputChange
                                            }
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>
                                            Categoria
                                        </label>

                                        <select
                                            name="id_categoria"
                                            value={
                                                formData.id_categoria
                                            }
                                            onChange={
                                                handleInputChange
                                            }
                                        >
                                            <option value="">
                                                Selecione...
                                            </option>

                                            {categoriasList.map(
                                                (
                                                    c
                                                ) => (
                                                    <option
                                                        key={
                                                            c.id_categoria
                                                        }
                                                        value={
                                                            c.id_categoria
                                                        }
                                                    >
                                                        {
                                                            c.descricao
                                                        }
                                                    </option>
                                                )
                                            )}
                                        </select>
                                    </div>
                                </div>
                            )}

                            {activeTab ===
                                "grupos" && (
                                <Grupos
                                    idProduto={
                                        produtoEdit.id_produto
                                    }
                                    grupos={
                                        formData.grupos ||
                                        []
                                    }
                                    setGrupos={(
                                        novosGrupos
                                    ) =>
                                        setFormData(
                                            (
                                                prev
                                            ) => ({
                                                ...prev,
                                                grupos:
                                                    novosGrupos
                                            })
                                        )
                                    }
                                />
                            )}

                            {activeTab ===
                                "ficha" && (
                                <FichaTecnica
                                    idProduto={
                                        produtoEdit.id_produto
                                    }
                                    produtoNome={
                                        formData.nome
                                    }
                                    produtoPreco={
                                        formData.preco
                                    }
                                    onEstoqueAtualizado={
                                        handleEstoqueAtualizado
                                    }
                                />
                            )}

                            <div className="modal-actions">
                                <button
                                    className="btn salvar"
                                    onClick={
                                        handleUpdateProduto
                                    }
                                >
                                    Atualizar
                                </button>

                                <button
                                    className="btn apagar"
                                    onClick={
                                        handleDeleteProduto
                                    }
                                >
                                    Deletar
                                </button>

                                <button
                                    className="btn fechar"
                                    onClick={() =>
                                        setProdutoEdit(
                                            null
                                        )
                                    }
                                >
                                    Fechar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
        </div>
    );
};

export default Cardapio;