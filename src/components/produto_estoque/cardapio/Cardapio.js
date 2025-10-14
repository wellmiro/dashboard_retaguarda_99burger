// src/components/produto_estoque/cardapio/Cardapio.js
import React, { useState, useEffect } from "react";
import { getProdutos, updateProduto, deleteProduto } from "../../../api/Produtos";
import { getCategorias } from "../../../api/Categorias"; 
import Grupos from "../grupos/Grupos";
import "./Styles.css";

const getBadge = (qtd) => {
  if (qtd === 0) return { text: "Fora de estoque", color: "vermelho" };
  if (qtd <= 5) return { text: "Estoque baixo", color: "laranja" };
  return { text: "Ativo", color: "verde" };
};

const Cardapio = () => {
  const [produtosState, setProdutosState] = useState([]);
  const [categoriasList, setCategoriasList] = useState([]); 
  const [produtoEdit, setProdutoEdit] = useState(null);
  const [activeTab, setActiveTab] = useState("informacoes");
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "", // estado interno
    preco: 0,
    qtd: 0,
    qtd_max: 0,
    qtd_min: 0,
    id_categoria: "", 
    url_foto: "",
    grupos: []
  });

  useEffect(() => {
    fetchProdutos();
    fetchCategorias(); 
  }, []);

  const fetchProdutos = async () => {
    try {
      const response = await getProdutos();
      if (response.data) setProdutosState(response.data);
    } catch (err) {
      console.error("Erro ao buscar produtos:", err);
    }
  };

  const fetchCategorias = async () => {
    try {
      const response = await getCategorias(); 
      if (response.data) setCategoriasList(response.data);
    } catch (err) {
      console.error("Erro ao buscar categorias:", err);
    }
  };

  const categoriasUnicas = [
    ...new Set(produtosState.map((p) => p.categoria || "Sem Categoria"))
  ];

  const handleEditClick = (produto) => {
    setProdutoEdit(produto);

    // Pega o id_categoria correto
    const idCategoriaProduto = produto.id_categoria || categoriasList.find(c => c.descricao === produto.categoria)?.id_categoria || "";

    setFormData({
      nome: produto.nome || "",
      // Aqui carregamos a descrição que vem da API (produto_descricao)
      descricao: produto.produto_descricao || "", 
      preco: parseFloat(produto.preco) || 0,
      qtd: produto.qtd || 0,
      qtd_max: produto.qtd_max || 0,
      qtd_min: produto.qtd_min || 0,
      id_categoria: idCategoriaProduto, 
      url_foto: produto.url_foto || "",
      grupos: produto.grupos || []
    });

    setActiveTab("informacoes");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditImageUrl = () => {
    const url = prompt("Informe a nova URL da foto:", formData.url_foto);
    if (url !== null) {
      setFormData(prev => ({ ...prev, url_foto: url }));
    }
  };

  const handleUpdateProduto = async () => {
  if (!produtoEdit) return;
  
  const payload = {
    nome: formData.nome,
    descricao: formData.descricao, // << trocado de produto_descricao para descricao
    preco: parseFloat(formData.preco),
    qtd: parseInt(formData.qtd),
    qtd_max: parseInt(formData.qtd_max),
    qtd_min: parseInt(formData.qtd_min),
    id_categoria: parseInt(formData.id_categoria),
    url_foto: formData.url_foto,
    grupos: formData.grupos.map((g) => ({
      nome: g.nome,
      valor: parseFloat(g.valor)
    }))
  };

  try {
    await updateProduto(produtoEdit.id_produto, payload);
    alert("Produto atualizado com sucesso!");
    fetchProdutos();
    setProdutoEdit(null);
  } catch (err) {
    console.error("Erro ao atualizar produto:", err.response?.data || err);
    alert(
      `Erro ao atualizar produto! Detalhe: ${
        err.response?.data?.message || "Verifique o console para mais informações."
      }`
    );
  }
};

  const handleDeleteProduto = async () => {
    if (window.confirm("Deseja realmente deletar este produto?")) {
      try {
        await deleteProduto(produtoEdit.id_produto);
        alert("Produto deletado com sucesso!");
        fetchProdutos();
        setProdutoEdit(null);
      } catch (err) {
        console.error("Erro ao deletar produto:", err);
        alert("Erro ao deletar produto!");
      }
    }
  };

  return (
    <div className="cardapio-panel">
      {categoriasUnicas.map(cat => {
        const produtosCat = produtosState
          .filter(p => p.categoria === cat)
          .sort((a, b) => a.id_produto - b.id_produto);

        return (
          <div key={cat} className="categoria-section">
            <div className="categoria-header">
              <h2 className="section-title">{cat}</h2>
            </div>
            <div className="row">
              {produtosCat.map(p => {
                const badge = getBadge(p.qtd);
                return (
                  <div key={p.id_produto} className="product-card">
                    <button
                      className="edit-btn"
                      onClick={() => handleEditClick(p)}
                      title="Editar produto"
                    >
                      ✏️
                    </button>
                    {p.url_foto && <img src={p.url_foto} alt={p.nome} />}
                    <h5>{p.nome}</h5>
                    <p>Qtd: {p.qtd} | R$ {parseFloat(p.preco).toFixed(2)}</p>
                    <span className={`badge ${badge.color}`}>{badge.text}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {produtoEdit && (
        <div className="modal-overlay" onClick={() => setProdutoEdit(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-img-container">
              {formData.url_foto && <img src={formData.url_foto} alt={formData.nome} className="modal-img" />}
              <button className="edit-img-btn" onClick={handleEditImageUrl}>✏️</button>
            </div>

            <div className="modal-tabs">
              <button className={`btn ${activeTab === "informacoes" ? "salvar" : ""}`} onClick={() => setActiveTab("informacoes")}>Informações</button>
              <button className={`btn ${activeTab === "grupos" ? "salvar" : ""}`} onClick={() => setActiveTab("grupos")}>Grupos</button>
            </div>

            {activeTab === "informacoes" && (
              <div className="modal-form">
                <div className="form-group full">
                  <label>Nome</label>
                  <input type="text" name="nome" value={formData.nome} onChange={handleInputChange} />
                </div>
                <div className="form-group full">
                  <label>Descrição</label>
                  <textarea name="descricao" value={formData.descricao} onChange={handleInputChange}></textarea>
                </div>
                <div className="form-group">
                  <label>Preço</label>
                  <input type="number" name="preco" value={formData.preco} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>Qtd</label>
                  <input type="number" name="qtd" value={formData.qtd} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>Qtd Máx</label>
                  <input type="number" name="qtd_max" value={formData.qtd_max} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>Qtd Min</label>
                  <input type="number" name="qtd_min" value={formData.qtd_min} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>Categoria</label>
                  <select name="id_categoria" value={formData.id_categoria} onChange={handleInputChange}>
                    <option value="">Selecione...</option>
                    {categoriasList.map(c => (
                      <option key={c.id_categoria} value={c.id_categoria}>{c.descricao}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {activeTab === "grupos" && (
              <Grupos idProduto={produtoEdit?.id_produto} grupos={formData.grupos || []} setGrupos={novosGrupos => setFormData(prev => ({ ...prev, grupos: novosGrupos }))} />
            )}

            <div className="modal-actions">
              <button className="btn salvar" onClick={handleUpdateProduto}>Atualizar</button>
              <button className="btn apagar" onClick={handleDeleteProduto}>Deletar</button>
              <button className="btn fechar" onClick={() => setProdutoEdit(null)}>Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cardapio;
