import React, { useState, useEffect, useCallback } from 'react';
import './Styles.css';
// IMPORTANTE: Importando tudo da nossa API centralizada
import { createProduto, getCategorias } from '../../../api/Api';

const INITIAL_FORM_DATA = {
    nome: '',
    preco: '',
    categoria: '', 
    urlFoto: '',
    descricao: '',
    qtdMax: '',
    qtdMin: '',
};

const CadProdutos = ({ onUpdate }) => {
    const [formData, setFormData] = useState(INITIAL_FORM_DATA);
    const [categorias, setCategorias] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }, []);

    const fetchCategorias = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await getCategorias();
            
            // O interceptor já resolveu o 401, agora tratamos o retorno
            const dataRaw = res.data?.categorias || res.data || [];
            const dataArray = Array.isArray(dataRaw) ? dataRaw : [];
            
            const lista = dataArray.map(c => ({ 
                id: c.id_categoria, 
                nome: c.descricao 
            }));
            
            setCategorias(lista);
        } catch (err) {
            console.error("Erro ao carregar categorias no cadastro:", err);
            setCategorias([]);
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
            alert("⚠️ Preencha os campos obrigatórios: Nome, Preço e Categoria");
            return;
        }

        try {
            const produtoData = {
                nome,
                descricao,
                preco: parseFloat(preco), 
                url_foto: urlFoto,
                qtd: 0,
                qtd_max: qtdMax ? parseInt(qtdMax) : 0, 
                qtd_min: qtdMin ? parseInt(qtdMin) : 0, 
                id_categoria: parseInt(categoria)
            };

            await createProduto(produtoData);
            handleClear();
            alert(`✅ Produto "${nome}" cadastrado com sucesso!`);
            if (onUpdate) onUpdate(); // Atualiza a lista de produtos se houver o componente pai
        } catch (err) {
            console.error("Erro ao cadastrar produto:", err);
            alert("❌ Erro ao cadastrar produto. Verifique os dados.");
        }
    };

    const { nome, preco, categoria, urlFoto, descricao, qtdMax, qtdMin } = formData; 

    return (
        <div id="produtoWrapper">
            <h2 className="section-title">Cadastro de Produto</h2>
            <form className="form-produto" onSubmit={handleSubmit}>

                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label">
                            Categoria* {isLoading && <span className="loading-text"> (Carregando...)</span>}
                        </label>
                        <select
                            className="form-select"
                            name="categoria" 
                            value={categoria}
                            onChange={handleInputChange}
                            disabled={isLoading}
                        >
                            <option value="">Selecione a categoria</option>
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
                            placeholder="Ex: X-Salada Especial"
                            name="nome" 
                            value={nome}
                            onChange={handleInputChange}
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label">Preço (R$)*</label>
                        <input
                            type="number"
                            step="0.01"
                            className="form-control"
                            placeholder="0,00"
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
                            placeholder="https://link-da-imagem.com"
                            name="urlFoto" 
                            value={urlFoto}
                            onChange={handleInputChange}
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label">Estoque Máx</label>
                        <input
                            type="number"
                            className="form-control"
                            name="qtdMax" 
                            value={qtdMax}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Estoque Min (Alerta)</label>
                        <input
                            type="number"
                            className="form-control"
                            name="qtdMin" 
                            value={qtdMin}
                            onChange={handleInputChange}
                        />
                    </div>
                </div>

                <div className="form-group full-width">
                    <label className="form-label">Descrição Detalhada</label>
                    <textarea
                        className="form-control descricao"
                        placeholder="Descreva os ingredientes do produto..."
                        name="descricao" 
                        value={descricao}
                        onChange={handleInputChange}
                    ></textarea>
                </div>

                {urlFoto && (
                    <div className="preview-container">
                        <p className="form-label">Pré-visualização:</p>
                        <img src={urlFoto} alt="Preview" className="product-image-preview" 
                             onError={(e) => e.target.style.display='none'} />
                    </div>
                )}

                <div className="form-actions">
                    <button type="submit" className="btn-primary">Salvar Produto</button>
                    <button type="button" className="btn-secondary" onClick={handleClear}>Limpar Campos</button>
                </div>
            </form>
        </div>
    );
};

export default CadProdutos;