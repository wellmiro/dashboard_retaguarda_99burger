import React, { useState, useEffect, useCallback } from 'react';
import './Styles.css';
import { getCategorias, postCategoria, putCategoria, deleteCategoria } from '../../../api/Categorias';

const Categorias = () => { // Renomeado o componente para Categorias
    const [categorias, setCategorias] = useState([]);
    const [novaCategoria, setNovaCategoria] = useState('');
    const [novaUrl, setNovaUrl] = useState('');
    const [mensagem, setMensagem] = useState('');

    // Modal
    const [modalCat, setModalCat] = useState(null);
    const [nomeEdit, setNomeEdit] = useState('');
    const [urlEdit, setUrlEdit] = useState('');

    // Função auxiliar para mostrar e esconder mensagem
    const showMessage = (msg) => {
        setMensagem(msg);
        setTimeout(() => setMensagem(''), 3000);
    };

    // Função de Busca com useCallback
    const carregarCategorias = useCallback(async () => {
        try {
            const res = await getCategorias();
            // Garantir que res.data é array
            const dataArray = Array.isArray(res.data) ? res.data : res.data.categorias || [];
            const formatted = dataArray.map(cat => ({
                id: cat.id_categoria,
                nome: cat.descricao,
                url_foto: cat.url_icone
            }));
            setCategorias(formatted);
        } catch (err) {
            console.error('Erro ao buscar categorias:', err);
            showMessage('❌ Erro ao carregar categorias!');
            setCategorias([]); // Garante que o estado seja um array
        }
    }, []);

    // Buscar categorias ao montar o componente
    useEffect(() => {
        carregarCategorias();
    }, [carregarCategorias]); // Dependência adicionada

    // Adicionar categoria via POST
    const addCategoria = async () => {
        const nome = novaCategoria.trim();
        const url_foto = novaUrl.trim();
        if (!nome) return showMessage('⚠️ Digite o nome da categoria!');
        if (!url_foto) return showMessage('⚠️ Digite a URL do ícone!');

        const novoBody = { descricao: nome, ordem: categorias.length + 1, url_icone: url_foto };

        try {
            const res = await postCategoria(novoBody);
            // Lógica para obter o ID do produto da resposta da API (ajustada para ser mais robusta)
            const novoId = res.data?.id_categoria || res.data?.categoria?.id_categoria || Date.now(); 
            
            setCategorias(prev => [...prev, { id: novoId, nome, url_foto }]);
            setNovaCategoria('');
            setNovaUrl('');
            showMessage('✅ Categoria cadastrada com sucesso!');
        } catch (err) {
            console.error('Erro ao cadastrar categoria:', err);
            showMessage('❌ Erro ao cadastrar categoria!');
        }
    };

    const openModal = (cat) => {
        setModalCat(cat);
        setNomeEdit(cat.nome);
        setUrlEdit(cat.url_foto);
    };

    const saveEdits = async () => {
        if (!nomeEdit.trim() || !urlEdit.trim()) {
            showMessage('⚠️ Preencha todos os campos antes de salvar!');
            return;
        }

        const updatedBody = {
            descricao: nomeEdit,
            ordem: (categorias.findIndex(c => c.id === modalCat.id) + 1) || 1,
            url_icone: urlEdit
        };

        try {
            await putCategoria(modalCat.id, updatedBody);
            const updated = categorias.map(c =>
                c.id === modalCat.id ? { ...c, nome: nomeEdit, url_foto: urlEdit } : c
            );
            setCategorias(updated);
            setModalCat(null);
            showMessage('✅ Categoria atualizada com sucesso!');
        } catch (err) {
            console.error('Erro ao atualizar categoria:', err);
            showMessage('❌ Erro ao atualizar categoria!');
        }
    };

    const removeCategoria = async (id) => {
        if (!window.confirm('Deseja realmente apagar esta categoria?')) return;

        try {
            await deleteCategoria(id);
            setCategorias(prev => prev.filter(c => c.id !== id));
            showMessage('✅ Categoria removida com sucesso!');
        } catch (err) {
            console.error('Erro ao deletar categoria:', err);
            showMessage('❌ Erro ao deletar categoria!');
        }
    };

    return (
        <div id="categoriaWrapper">
            <h2 className="section-title">Cadastro de Categoria</h2>

            {mensagem && <div className="mensagem">{mensagem}</div>}

            <form className="form-categoria" onSubmit={e => e.preventDefault()}>
                {/* ... (formulário de nova categoria) ... */}
                <div className="form-group full">
                    <label htmlFor="novaCategoria">Nome da Categoria</label>
                    <input
                        id="novaCategoria"
                        className="form-control modal-input"
                        placeholder="Digite o nome"
                        value={novaCategoria}
                        onChange={e => setNovaCategoria(e.target.value)}
                    />
                </div>

                <div className="form-group full">
                    <label htmlFor="novaUrl">URL do Ícone</label>
                    <input
                        id="novaUrl"
                        className="form-control modal-input"
                        placeholder="Digite a URL do ícone"
                        value={novaUrl}
                        onChange={e => setNovaUrl(e.target.value)}
                    />
                </div>

                <button type="button" className="btn btn-primary" onClick={addCategoria}>
                    + Adicionar Categoria
                </button>
            </form>

            <h5>Categorias Existentes:</h5>
            <ul id="listaCategorias">
                {/* Remoção da verificação Array.isArray, pois o estado já é inicializado como [] */}
                {categorias.map(cat => ( 
                    <li key={cat.id}>
                        <div className="cat-info">
                            <img src={cat.url_foto} alt={cat.nome} className="cat-icon" onError={(e) => { e.target.src = 'URL_IMAGEM_PADRAO' }} /> {/* Adicionando fallback para imagem */}
                            <span>{cat.nome}</span>
                        </div>
                        <div className="cat-actions">
                            <button className="btn-edit" onClick={() => openModal(cat)} title="Editar categoria">✏️</button>
                            <button className="btn-delete" onClick={() => removeCategoria(cat.id)} title="Apagar categoria">🗑️</button>
                        </div>
                    </li>
                ))}
            </ul>

            {modalCat && (
                <div className="modal-overlay" onClick={() => setModalCat(null)}>
                    {/* ... (Conteúdo do modal) ... */}
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-img-container">
                            <img src={urlEdit} alt={nomeEdit} className="modal-img" />
                            <button
                                className="edit-img-btn"
                                title="Alterar imagem"
                                onClick={() => {
                                    const novaUrlPrompt = prompt("Insira a nova URL do ícone:", urlEdit);
                                    if (novaUrlPrompt) setUrlEdit(novaUrlPrompt);
                                }}
                            >✏️</button>
                        </div>

                        <div className="modal-form">
                            <div className="form-group full">
                                <label>Nome da Categoria</label>
                                <input type="text" value={nomeEdit} onChange={e => setNomeEdit(e.target.value)} className="modal-input" />
                            </div>

                            <div className="form-group full">
                                <label>URL do Ícone</label>
                                <input type="text" value={urlEdit} onChange={e => setUrlEdit(e.target.value)} className="modal-input" />
                            </div>

                            <div className="modal-actions">
                                <button className="btn salvar" onClick={saveEdits}>💾 Salvar</button>
                                <button className="btn apagar" onClick={() => setModalCat(null)}>❌ Cancelar</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Categorias;