// src/components/Categoria.js
import React, { useState, useEffect } from 'react';
import './Styles.css';
import { getCategorias, postCategoria, putCategoria, deleteCategoria } from '../../../api/Categorias';

const Categoria = () => {
  const [categorias, setCategorias] = useState([]);
  const [novaCategoria, setNovaCategoria] = useState('');
  const [novaUrl, setNovaUrl] = useState('');
  const [mensagem, setMensagem] = useState('');

  // Modal
  const [modalCat, setModalCat] = useState(null);
  const [nomeEdit, setNomeEdit] = useState('');
  const [urlEdit, setUrlEdit] = useState('');

  // Buscar categorias ao montar o componente
  useEffect(() => {
    carregarCategorias();
  }, []);

  const carregarCategorias = () => {
    getCategorias()
      .then(res => {
        const formatted = res.data.map(cat => ({
          id: cat.id_categoria,
          nome: cat.descricao,
          url_foto: cat.url_icone
        }));
        setCategorias(formatted);
      })
      .catch(err => console.error('Erro ao buscar categorias:', err));
  };

  // Adicionar categoria via POST
  const addCategoria = () => {
    const nome = novaCategoria.trim();
    const url_foto = novaUrl.trim();
    if (!nome) return setMensagem('⚠️ Digite o nome da categoria!');
    if (!url_foto) return setMensagem('⚠️ Digite a URL do ícone!');

    const novoBody = { descricao: nome, ordem: categorias.length + 1, url_icone: url_foto };

    postCategoria(novoBody)
      .then(res => {
        setCategorias([...categorias, { id: res.data.id_categoria, nome, url_foto }]);
        setNovaCategoria('');
        setNovaUrl('');
        setMensagem('✅ Categoria cadastrada com sucesso!');
        setTimeout(() => setMensagem(''), 3000);
      })
      .catch(err => {
        console.error('Erro ao cadastrar categoria:', err);
        setMensagem('❌ Erro ao cadastrar categoria!');
        setTimeout(() => setMensagem(''), 3000);
      });
  };

  // Modal
  const openModal = (cat) => {
    setModalCat(cat);
    setNomeEdit(cat.nome);
    setUrlEdit(cat.url_foto);
  };

  const saveEdits = () => {
    if (!nomeEdit.trim() || !urlEdit.trim()) {
      setMensagem('⚠️ Preencha todos os campos antes de salvar!');
      setTimeout(() => setMensagem(''), 3000);
      return;
    }

    const updatedBody = {
      descricao: nomeEdit,
      ordem: categorias.findIndex(c => c.id === modalCat.id) + 1,
      url_icone: urlEdit
    };

    putCategoria(modalCat.id, updatedBody)
      .then(res => {
        const updated = categorias.map(c =>
          c.id === modalCat.id ? { ...c, nome: nomeEdit, url_foto: urlEdit } : c
        );
        setCategorias(updated);
        setModalCat(null);
        setMensagem('✅ Categoria atualizada com sucesso!');
        setTimeout(() => setMensagem(''), 3000);
      })
      .catch(err => {
        console.error('Erro ao atualizar categoria:', err);
        setMensagem('❌ Erro ao atualizar categoria!');
        setTimeout(() => setMensagem(''), 3000);
      });
  };

  const removeCategoria = (id) => {
    if (!window.confirm('Deseja realmente apagar esta categoria?')) return;

    deleteCategoria(id)
      .then(res => {
        setCategorias(categorias.filter(c => c.id !== id));
        setMensagem('✅ Categoria removida com sucesso!');
        setTimeout(() => setMensagem(''), 3000);
      })
      .catch(err => {
        console.error('Erro ao deletar categoria:', err);
        setMensagem('❌ Erro ao deletar categoria!');
        setTimeout(() => setMensagem(''), 3000);
      });
  };

  return (
    <div id="categoriaWrapper">
      <h2 className="section-title">Cadastro de Categoria</h2>

      {mensagem && <div className="mensagem">{mensagem}</div>}

      <form className="form-categoria" onSubmit={e => e.preventDefault()}>
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
        {categorias.map(cat => (
          <li key={cat.id}>
            <div className="cat-info">
              <img src={cat.url_foto} alt={cat.nome} className="cat-icon" />
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

export default Categoria;
