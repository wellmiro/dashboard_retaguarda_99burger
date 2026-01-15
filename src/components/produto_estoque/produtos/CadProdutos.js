import React, { useState, useEffect, useCallback } from 'react';
import './Styles.css';
import { createProduto } from '../../../api/Produtos';
import { getCategorias } from '../../../api/Categorias';

const INITIAL_FORM_DATA = {
    nome: '',
    preco: '',
    categoria: '', // id_categoria
    urlFoto: '',
    descricao: '',
    qtdMax: '',
    qtdMin: '',
};

const CadProdutos = ({ onUpdate }) => {
    const [formData, setFormData] = useState(INITIAL_FORM_DATA);
    const [categorias, setCategorias] = useState([]);
    const [isLoading, setIsLoading] = useState(true); // Novo estado de loading

    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }, []);

    // 1. Função de carregamento com useCallback
    const fetchCategorias = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await getCategorias();
            // Garante que res.data é um array antes de mapear
            const dataArray = Array.isArray(res.data) ? res.data : [];
            const lista = dataArray.map(c => ({ id: c.id_categoria, nome: c.descricao }));
            setCategorias(lista);
        } catch (err) {
            console.error("Erro ao carregar categorias:", err);
            setCategorias([]);
            // Opcional: Mostrar uma mensagem de erro ao usuário
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCategorias();
    }, [fetchCategorias]);

    const handleClear = useCallback(() => {
        setFormData(INITIAL_FORM_DATA);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const { nome, preco, categoria, urlFoto, descricao, qtdMax, qtdMin } = formData;

        if (!nome || !preco || !categoria) {
            alert("Preencha os campos obrigatórios: Nome, Preço e Categoria");
            return;
        }

        try {
            const produtoData = {
                nome,
                descricao,
                preco: parseFloat(preco) < 0 ? 0 : parseFloat(preco), 
                url_foto: urlFoto,
                qtd: 0,
                qtd_max: qtdMax ? parseInt(qtdMax) : 0, 
                qtd_min: qtdMin ? parseInt(qtdMin) : 0, 
                id_categoria: parseInt(categoria)
            };

            await createProduto(produtoData);
            handleClear();
            alert(`Produto "${nome}" cadastrado com sucesso!`);
            if (onUpdate) onUpdate();
        } catch (err) {
            console.error("Erro ao cadastrar produto:", err.response?.data || err);
            alert(`Erro ao cadastrar produto! Detalhe: ${err.response?.data?.message || "Verifique o console."}`);
        }
    };

    const { nome, preco, categoria, urlFoto, descricao, qtdMax, qtdMin } = formData; 

    return (
        <div id="produtoWrapper">
            <h2 className="section-title">Cadastro de Produto</h2>
            <form className="form-produto" onSubmit={handleSubmit}>

                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label">Categoria* {isLoading && ' (Carregando...)'}</label>
                        <select
                            className="form-select"
                            name="categoria" 
                            value={categoria}
                            onChange={handleInputChange}
                            disabled={isLoading} // Desabilita enquanto carrega
                        >
                            <option value="">Selecione a categoria</option>
                            {/* Garante que `categorias` é um array antes de mapear */}
                            {categorias.map(cat => ( 
                                <option key={cat.id} value={cat.id}>{cat.nome}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Nome do Produto*</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Nome do produto"
                            name="nome" 
                            value={nome}
                            onChange={handleInputChange}
                        />
                    </div>
                </div>
                
                {/* ... (o restante do JSX do formulário permanece o mesmo) ... */}
                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label">Qtd Máx</label>
                        <input
                            type="number"
                            className="form-control"
                            placeholder="Quantidade máxima"
                            name="qtdMax" 
                            value={qtdMax}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Qtd Min</label>
                        <input
                            type="number"
                            className="form-control"
                            placeholder="Quantidade mínima"
                            name="qtdMin" 
                            value={qtdMin}
                            onChange={handleInputChange}
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label">Preço*</label>
                        <input
                            type="number"
                            className="form-control"
                            placeholder="R$"
                            name="preco" 
                            value={preco}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">URL da Foto</label>
                        <input
                            type="url"
                            className="form-control"
                            placeholder="https://..."
                            name="urlFoto" 
                            value={urlFoto}
                            onChange={handleInputChange}
                        />
                    </div>

                    {urlFoto && (
                        <div className="form-group preview">
                            <label className="form-label">Preview</label>
                            <img src={urlFoto} alt="Preview" className="product-image-preview" />
                        </div>
                    )}
                </div>

                <div className="form-row">
                    <div className="form-group full-width">
                        <label className="form-label">Descrição</label>
                        <textarea
                            className="form-control descricao"
                            placeholder="Descrição do produto"
                            name="descricao" 
                            value={descricao}
                            onChange={handleInputChange}
                        ></textarea>
                    </div>
                </div>

                <div className="form-actions">
                    <button type="submit" className="btn salvar">Cadastrar Produto</button>
                    <button type="button" className="btn btn-secondary" onClick={handleClear}>Limpar</button>
                </div>
            </form>
        </div>
    );
};

export default CadProdutos;