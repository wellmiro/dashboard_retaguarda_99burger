// src/components/produto_estoque/produtos/CadProdutos.js
import React, { useState } from 'react';
import './Styles.css';
import { createProduto } from '../../../api/Produtos';

const CadProdutos = ({ onUpdate }) => {
  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState('');
  const [categoria, setCategoria] = useState('');
  const [urlFoto, setUrlFoto] = useState('');
  const [descricao, setDescricao] = useState('');
  const [qtdMax, setQtdMax] = useState('');
  const [qtdMin, setQtdMin] = useState('');

  const categorias = [
    'Ofertas',
    'Burgers',
    'Dogs',
    'Bebidas',
    'Pizzas',
    'Pastel',
    'Pastel Doces',
    'Pizzas Doces'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

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

      // Chama a API para cadastrar
      await createProduto(produtoData);

      // Limpar campos
      handleClear();

      // Mostrar alerta de sucesso
      alert(`Produto "${nome}" cadastrado com sucesso!`);

      // Atualizar Cardápio
      if (onUpdate) onUpdate();

    } catch (err) {
      console.error("Erro ao cadastrar produto:", err);
      alert("Erro ao cadastrar produto!");
    }
  };

  const handleClear = () => {
    setNome('');
    setPreco('');
    setCategoria('');
    setUrlFoto('');
    setDescricao('');
    setQtdMax('');
    setQtdMin('');
  };

  return (
    <div id="produtoWrapper">
      <h2 className="section-title">Cadastro de Produto</h2>

      <form className="form-produto" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Categoria*</label>
            <select
              className="form-select"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
            >
              <option value="">Selecione a categoria</option>
              {categorias.map((cat, idx) => (
                <option key={idx} value={idx + 1}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Nome do Produto*</label>
            <input
              type="text"
              className="form-control"
              placeholder="Nome do produto"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Qtd Máx</label>
            <input
              type="number"
              className="form-control"
              placeholder="Quantidade máxima"
              value={qtdMax}
              onChange={(e) => setQtdMax(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Qtd Min</label>
            <input
              type="number"
              className="form-control"
              placeholder="Quantidade mínima"
              value={qtdMin}
              onChange={(e) => setQtdMin(e.target.value)}
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
              value={preco}
              onChange={(e) => setPreco(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">URL da Foto</label>
            <input
              type="url"
              className="form-control"
              placeholder="https://..."
              value={urlFoto}
              onChange={(e) => setUrlFoto(e.target.value)}
            />
          </div>

          {urlFoto && (
            <div className="form-group preview">
              <label className="form-label">Preview</label>
              <img
                src={urlFoto}
                alt="Preview"
                className="product-image-preview"
              />
            </div>
          )}
        </div>

        <div className="form-row">
          <div className="form-group full-width">
            <label className="form-label">Descrição</label>
            <textarea
              className="form-control descricao"
              placeholder="Descrição do produto"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
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
