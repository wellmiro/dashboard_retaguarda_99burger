import React, { useState, useEffect, useCallback } from 'react';
import { getCategorias, postCategoria, putCategoria, deleteCategoria } from '../../../api/Api';
import './Styles.css';

const Categorias = () => {
    const [categorias, setCategorias] = useState([]);
    // Ajustado para url_icone para bater com seu JSON
    const [novaCategoria, setNovaCategoria] = useState({ descricao: '', ordem: '', url_icone: '' });
    const [editando, setEditando] = useState(null);
    const [mensagem, setMensagem] = useState({ texto: '', tipo: '' });
    const [isLoading, setIsLoading] = useState(false);

    const imgDefault = "https://cdn-icons-png.flaticon.com/512/3075/3075977.png";

    const carregarCategorias = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await getCategorias();
            const dados = Array.isArray(res.data) ? res.data : (res.data.categorias || []);
            
            // Higienização usando o campo correto do banco: url_icone
            const higienizados = dados.map(item => ({
                ...item,
                url_icone: item.url_icone || ''
            }));

            setCategorias(higienizados.sort((a, b) => Number(a.ordem) - Number(b.ordem)));
        } catch (err) { 
            exibirMensagem("Erro ao carregar do banco", "erro"); 
        } finally { 
            setIsLoading(false); 
        }
    }, []);

    useEffect(() => { carregarCategorias(); }, [carregarCategorias]);

    const exibirMensagem = (texto, tipo) => {
        setMensagem({ texto, tipo });
        setTimeout(() => setMensagem({ texto: '', tipo: '' }), 3000);
    };

    const iniciarEdicao = (cat) => {
        setEditando({
            id_categoria: cat.id_categoria,
            descricao: cat.descricao || '',
            ordem: cat.ordem || 0,
            url_icone: cat.url_icone || '' // Pegando o valor real do banco
        });
    };

    const handleSalvarEdicao = async () => {
        try {
            await putCategoria(editando.id_categoria, editando);
            setEditando(null);
            exibirMensagem("Registro atualizado!", "sucesso");
            carregarCategorias();
        } catch (err) { exibirMensagem("Erro ao salvar alterações", "erro"); }
    };

    const handleUrlPrompt = () => {
        const novaUrl = window.prompt("Edite o link da imagem:", editando.url_icone);
        if (novaUrl !== null) {
            setEditando(prev => ({ ...prev, url_icone: novaUrl }));
        }
    };

    return (
        <div id="categoriaWrapper">
            <h2 className="section-title">Gerenciar Categorias</h2>
            {mensagem.texto && <div className={`mensagem ${mensagem.tipo}`}>{mensagem.texto}</div>}

            {/* FORMULÁRIO DE CADASTRO */}
            <form className="form-categoria" onSubmit={async (e) => {
                e.preventDefault();
                try {
                    await postCategoria(novaCategoria);
                    setNovaCategoria({ descricao: '', ordem: '', url_icone: '' });
                    carregarCategorias();
                    exibirMensagem("Categoria criada!", "sucesso");
                } catch (err) { exibirMensagem("Erro ao inserir", "erro"); }
            }}>
                <div className="form-row">
                    <div className="form-group flex-3">
                        <label>NOME DA CATEGORIA</label>
                        <input className="form-control" placeholder="Ex: Lanches" value={novaCategoria.descricao}
                            onChange={(e) => setNovaCategoria({...novaCategoria, descricao: e.target.value})} />
                    </div>
                    <div className="form-group flex-1">
                        <label>ORDEM</label>
                        <input type="number" className="form-control" value={novaCategoria.ordem}
                            onChange={(e) => setNovaCategoria({...novaCategoria, ordem: e.target.value})} />
                    </div>
                </div>
                <div className="form-row" style={{marginTop: '10px'}}>
                    <div className="form-group full">
                        <label>URL DO ÍCONE (IMAGEM)</label>
                        <input className="form-control" placeholder="Cole o link aqui..." value={novaCategoria.url_icone}
                            onChange={(e) => setNovaCategoria({...novaCategoria, url_icone: e.target.value})} />
                    </div>
                </div>
                <button type="submit" className="btn-primary-ifood">+ Adicionar Categoria</button>
            </form>

            {/* LISTA DE REGISTROS */}
            <ul id="listaCategorias">
                {isLoading ? <p>Buscando no banco...</p> : categorias.map((cat) => (
                    <li key={cat.id_categoria} className="cat-item">
                        <div className="cat-info">
                            <span className="badge-ordem">{cat.ordem}º</span>
                            <img 
                                key={`img-${cat.id_categoria}-${cat.url_icone}`}
                                src={cat.url_icone && cat.url_icone.trim() !== "" ? cat.url_icone : imgDefault} 
                                alt="" className="cat-icon" 
                                onError={(e) => { e.target.src = imgDefault; }}
                            />
                            <strong>{cat.descricao}</strong>
                        </div>
                        <div className="cat-actions">
                            <button className="btn-action edit" onClick={() => iniciarEdicao(cat)}>✏️</button>
                            <button className="btn-action delete" onClick={() => { if(window.confirm("Excluir?")) deleteCategoria(cat.id_categoria).then(carregarCategorias) }}>🗑️</button>
                        </div>
                    </li>
                ))}
            </ul>

            {/* MODAL DE EDIÇÃO */}
            {editando && (
                <div className="modal-overlay">
                    <div className="modal">
                        <button className="btn-close-modal" onClick={() => setEditando(null)}>×</button>
                        <h2 className="modal-title">Editar Categoria</h2>
                        
                        <div className="modal-image-container-large">
                            <img src={editando.url_icone || imgDefault} alt="Preview" className="modal-img-preview-large" 
                                onError={(e) => { e.target.src = imgDefault; }} />
                            <div className="pencil-badge-red" onClick={handleUrlPrompt}>✎</div>
                        </div>

                        <div className="modal-form-compact">
                            <div className="modal-row">
                                <div className="form-group flex-3">
                                    <label>NOME DA CATEGORIA</label>
                                    <input className="modal-input" value={editando.descricao}
                                        onChange={(e) => setEditando({...editando, descricao: e.target.value})} />
                                </div>
                                <div className="form-group flex-1">
                                    <label>ORDEM</label>
                                    <input type="number" className="modal-input" value={editando.ordem}
                                        onChange={(e) => setEditando({...editando, ordem: e.target.value})} />
                                </div>
                            </div>
                            <div className="form-group" style={{marginTop: '15px'}}>
                                <label>URL DA IMAGEM</label>
                                <input className="modal-input" value={editando.url_icone} 
                                    onChange={(e) => setEditando({...editando, url_icone: e.target.value})} />
                            </div>
                            <div className="modal-actions-ifood">
                                <button className="btn-ifood secondary" onClick={() => setEditando(null)}>Cancelar</button>
                                <button className="btn-ifood primary" onClick={handleSalvarEdicao}>Salvar Alterações</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Categorias;