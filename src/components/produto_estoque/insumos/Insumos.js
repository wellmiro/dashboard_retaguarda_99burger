import React, { useState, useEffect } from 'react';
import { getInsumos, postInsumo, putInsumo, deleteInsumo } from '../../../api/Insumos';
import './Styles.css';

// Remove os zeros extras do MySQL/PT-BR ("60.000000" -> "60" | "1,50" -> "1.5")
const limparNumero = (val) => {
  if (val === null || val === undefined || val === '') return '0';
  const str = String(val).replace(',', '.');
  const n = parseFloat(str);
  return isNaN(n) ? '0' : String(n);
};

// Formata moeda brasileira R$ 0,00
const formatarMoeda = (val) => {
  if (val === null || val === undefined || val === '') return '0,00';
  const str = String(val).replace(',', '.');
  const n = parseFloat(str);
  return isNaN(n)
    ? '0,00'
    : n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const Insumos = () => {
  const [insumos, setInsumos] = useState([]);
  const [busca, setBusca] = useState('');

  // Formulário Principal
  const [nome, setNome] = useState('');
  const [unidadeMedida, setUnidadeMedida] = useState('UN');
  const [qtdAtual, setQtdAtual] = useState('');
  const [qtdMinima, setQtdMinima] = useState('0');
  const [custoUnitario, setCustoUnitario] = useState('0.00');

  // Modais
  const [insumoParaEditar, setInsumoParaEditar] = useState(null);
  const [insumoParaExcluir, setInsumoParaExcluir] = useState(null);

  // Carregar Insumos da API
  const carregarInsumos = async () => {
    try {
      const res = await getInsumos();
      setInsumos(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Erro ao carregar insumos:", err);
    }
  };

  useEffect(() => {
    carregarInsumos();
  }, []);

  // Cadastrar Novo Insumo
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nome || qtdAtual === '') return alert("Preencha o nome e a quantidade!");

    try {
      await postInsumo({
        nome,
        unidade_medida: unidadeMedida,
        qtd_atual: Number(String(qtdAtual).replace(',', '.')),
        qtd_minima: Number(String(qtdMinima).replace(',', '.')) || 0,
        custo_unitario: Number(String(custoUnitario).replace(',', '.')) || 0
      });

      setNome('');
      setQtdAtual('');
      setQtdMinima('0');
      setCustoUnitario('0.00');
      setUnidadeMedida('UN');

      carregarInsumos();
    } catch (err) {
      console.error("Erro ao salvar insumo:", err);
      alert("Erro ao salvar insumo.");
    }
  };

  // Confirmar Exclusão
  const handleConfirmarExclusao = async () => {
    if (!insumoParaExcluir) return;
    try {
      const id = insumoParaExcluir.id_insumo || insumoParaExcluir.id;
      await deleteInsumo(id);
      setInsumos(prev => prev.filter(i => (i.id_insumo || i.id) !== id));
      setInsumoParaExcluir(null);
    } catch (err) {
      console.error("Erro ao excluir:", err);
      alert("Erro ao excluir o insumo.");
    }
  };

  // Abrir Modal de Edição
  const abrirModalEdicao = (item) => {
    setInsumoParaEditar({
      ...item,
      nome: item.nome || '',
      unidade_medida: item.unidade_medida || item.unidade || 'UN',
      qtd_atual: limparNumero(item.qtd_atual ?? item.quantidade),
      qtd_minima: limparNumero(item.qtd_minima),
      custo_unitario: limparNumero(item.custo_unitario)
    });
  };

  // Salvar Edição
  const handleSalvarEdicao = async (e) => {
    e.preventDefault();
    if (!insumoParaEditar) return;

    try {
      const id = insumoParaEditar.id_insumo || insumoParaEditar.id;
      await putInsumo(id, {
        ...insumoParaEditar,
        qtd_atual: Number(String(insumoParaEditar.qtd_atual).replace(',', '.')) || 0,
        qtd_minima: Number(String(insumoParaEditar.qtd_minima).replace(',', '.')) || 0,
        custo_unitario: Number(String(insumoParaEditar.custo_unitario).replace(',', '.')) || 0
      });
      setInsumoParaEditar(null);
      carregarInsumos();
    } catch (err) {
      console.error("Erro ao atualizar:", err);
      alert("Erro ao atualizar insumo.");
    }
  };

  // Filtro de busca
  const insumosFiltrados = insumos.filter(item =>
    item.nome?.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div id="insumosWrapper">
      <div className="insumos-header">
        <h2>📦 Gestão de Insumos & Estoque</h2>
        <p className="sub-title">Cadastre e controle os ingredientes da sua cozinha</p>
      </div>

      {/* Form de Cadastro */}
      <form className="form-insumo" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group flex-2">
            <label className="form-label">Nome do Insumo</label>
            <input
              type="text"
              className="form-control"
              placeholder="ex: Pão Brioche, Carne Smash, Queijo Prato"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Unidade</label>
            <select className="form-select" value={unidadeMedida} onChange={(e) => setUnidadeMedida(e.target.value)}>
              <option value="UN">UN</option>
              <option value="KG">KG</option>
              <option value="G">G</option>
              <option value="L">L</option>
              <option value="ML">ML</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Qtd. Atual</label>
            <input
              type="number"
              step="any"
              className="form-control"
              placeholder="0"
              value={qtdAtual}
              onChange={(e) => setQtdAtual(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Qtd. Mínima</label>
            <input
              type="number"
              step="any"
              className="form-control"
              placeholder="0"
              value={qtdMinima}
              onChange={(e) => setQtdMinima(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Custo Unit. (R$)</label>
            <input
              type="number"
              step="0.01"
              className="form-control"
              placeholder="0.00"
              value={custoUnitario}
              onChange={(e) => setCustoUnitario(e.target.value)}
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary">+ Cadastrar Insumo</button>
        </div>
      </form>

      {/* Busca */}
      <div className="busca-wrapper">
        <input
          type="text"
          className="form-control busca-input"
          placeholder="🔍 Pesquisar insumo pelo nome..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      {/* Grid de Cards dos Insumos */}
      <div className="insumos-grid">
        {insumosFiltrados.length === 0 ? (
          <div className="mensagem-vazia">
            {busca ? "Nenhum insumo encontrado para essa busca." : "Nenhum insumo cadastrado ainda."}
          </div>
        ) : (
          insumosFiltrados.map((item) => {
            const qtdAtualNum = Number(String(item.qtd_atual ?? item.quantidade ?? 0).replace(',', '.'));
            const qtdMinNum = Number(String(item.qtd_minima ?? 0).replace(',', '.'));
            const estaEmAlerta = qtdMinNum > 0 && qtdAtualNum <= qtdMinNum;
            const unidade = item.unidade_medida || item.unidade || 'UN';

            return (
              <div key={item.id_insumo || item.id} className={`insumo-card ${estaEmAlerta ? 'em-alerta' : ''}`}>
                <div className="card-top">
                  <h3 className="insumo-titulo" title={item.nome}>{item.nome}</h3>
                  <div className="card-actions">
                    <button
                      type="button"
                      className="btn-card-action btn-edit"
                      title="Editar Insumo"
                      onClick={() => abrirModalEdicao(item)}
                    >
                      ✏️
                    </button>
                    <button
                      type="button"
                      className="btn-card-action btn-delete"
                      title="Excluir Insumo"
                      onClick={() => setInsumoParaExcluir(item)}
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <div className="card-body">
                  <div className="qtd-container">
                    <span className="card-label">Estoque Atual</span>
                    <span className="qtd-destaque">
                      {limparNumero(qtdAtualNum)} <small>{unidade}</small>
                    </span>
                  </div>
                  {estaEmAlerta && <span className="badge-alerta">⚠️ Estoque Baixo</span>}
                </div>

                <div className="card-footer">
                  <div className="info-item">
                    <span className="card-label">Custo Unit.</span>
                    <span className="card-val">R$ {formatarMoeda(item.custo_unitario)}</span>
                  </div>
                  <div className="info-item align-right">
                    <span className="card-label">Estoque Mín.</span>
                    <span className="card-val">{limparNumero(qtdMinNum)} {unidade}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal - CONFIRMAR EXCLUSÃO */}
      {insumoParaExcluir && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>⚠️ Confirmar Exclusão</h3>
            <p>Deseja realmente excluir o insumo <strong>"{insumoParaExcluir.nome}"</strong>?</p>
            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={() => setInsumoParaExcluir(null)}>
                Cancelar
              </button>
              <button type="button" className="btn-danger" onClick={handleConfirmarExclusao}>
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal - EDITAR INSUMO */}
      {insumoParaEditar && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <h3>✏️ Editar Insumo</h3>
              <button type="button" className="btn-close" onClick={() => setInsumoParaEditar(null)}>✕</button>
            </div>

            <form onSubmit={handleSalvarEdicao} className="modal-form">
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label">Nome do Insumo</label>
                <input
                  type="text"
                  className="form-control"
                  value={insumoParaEditar.nome}
                  onChange={(e) => setInsumoParaEditar({ ...insumoParaEditar, nome: e.target.value })}
                  required
                />
              </div>

              <div className="form-row" style={{ marginBottom: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Unidade</label>
                  <select
                    className="form-select"
                    value={insumoParaEditar.unidade_medida}
                    onChange={(e) => setInsumoParaEditar({ ...insumoParaEditar, unidade_medida: e.target.value })}
                  >
                    <option value="UN">UN</option>
                    <option value="KG">KG</option>
                    <option value="G">G</option>
                    <option value="L">L</option>
                    <option value="ML">ML</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Qtd. Atual</label>
                  <input
                    type="number"
                    step="any"
                    className="form-control"
                    value={insumoParaEditar.qtd_atual}
                    onChange={(e) => setInsumoParaEditar({ ...insumoParaEditar, qtd_atual: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Qtd. Mínima</label>
                  <input
                    type="number"
                    step="any"
                    className="form-control"
                    value={insumoParaEditar.qtd_minima}
                    onChange={(e) => setInsumoParaEditar({ ...insumoParaEditar, qtd_minima: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Custo Unit. (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    value={insumoParaEditar.custo_unitario}
                    onChange={(e) => setInsumoParaEditar({ ...insumoParaEditar, custo_unitario: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-actions" style={{ marginTop: '20px' }}>
                <button type="button" className="btn-secondary" onClick={() => setInsumoParaEditar(null)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Insumos;