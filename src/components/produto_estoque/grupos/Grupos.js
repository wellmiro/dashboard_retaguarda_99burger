import React, { useEffect, useState, useRef } from "react";
import {
  getOpcoesProduto,
  createOpcaoProduto, // Este é o endpoint ajustado que agora lida com criação de GRUPO e ITEM
  deleteOpcaoProduto,
} from "../../../api/Produtos";
import "./Styles.css";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";

const Grupos = ({ idProduto }) => {
  const [grupos, setGrupos] = useState([]);
  const [gruposAbertos, setGruposAbertos] = useState({});
  const [novoGrupo, setNovoGrupo] = useState("");
  const [indObrigatorio, setIndObrigatorio] = useState("N");
  const [qtdMaxEscolha, setQtdMaxEscolha] = useState(1);
  const [adicionandoItem, setAdicionandoItem] = useState({});
  const [novoItemDados, setNovoItemDados] = useState({});

  // Ref para focar no campo de nome após adicionar um item
  const itemInputRefs = useRef({});

  const carregarGrupos = async () => {
    if (!idProduto) return;
    try {
      const res = await getOpcoesProduto(idProduto);
      const dados = res.data;

      const gruposFormatados = Object.values(
        dados.reduce((acc, item) => {
          if (!acc[item.id_opcao]) {
            acc[item.id_opcao] = {
              id_opcao: item.id_opcao,
              descricao: item.descricao,
              ind_obrigatorio: item.ind_obrigatorio,
              // Garante que é um número e usa 1 como fallback
              qtd_max_escolha: item.qtd_max_escolha ? Number(item.qtd_max_escolha) : 1, 
              itens: [],
            };
          }
          if (item.id_item) {
            acc[item.id_opcao].itens.push({
              id_item: item.id_item,
              nome_item: item.nome_item,
              vl_item: item.vl_item,
              descricao_item: item.descricao_item,
            });
          }
          return acc;
        }, {})
      );

      setGrupos(gruposFormatados);
    } catch (error) {
      console.error("Erro ao buscar grupos:", error);
    }
  };

  useEffect(() => {
    carregarGrupos();
  }, [idProduto]);

  const alternarGrupo = (id) => {
    setGruposAbertos((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const criarGrupo = async () => {
    const descricao = novoGrupo.trim();
    const maxEscolhas = Number(qtdMaxEscolha);

    // Validação
    if (!descricao) {
      return alert("Por favor, insira a descrição do grupo.");
    }
    if (isNaN(maxEscolhas) || maxEscolhas < 1) {
       setQtdMaxEscolha(1);
       return alert("Máximo de escolhas deve ser um número maior ou igual a 1.");
    }
    
    try {
      // Criação de GRUPO: Não envia id_opcao, forçando o backend a CRIAR um novo grupo.
      await createOpcaoProduto({
        id_produto: idProduto,
        descricao: descricao,
        ind_obrigatorio: indObrigatorio,
        qtd_max_escolha: maxEscolhas, 
        ind_ativo: "S",
        // Não precisamos enviar itens, pois estamos apenas criando o container
        itens: [], 
      });

      // Limpa o formulário e recarrega
      setNovoGrupo("");
      setIndObrigatorio("N");
      setQtdMaxEscolha(1);
      carregarGrupos();
    } catch (err) {
      console.error("Erro ao criar grupo:", err);
      alert("Falha ao criar grupo. Verifique se o produto está ativo e a API.");
    }
  };

  const excluirGrupo = async (id_opcao) => {
    if (!window.confirm("Deseja realmente excluir este grupo e todos os seus itens?")) return;
    try {
      await deleteOpcaoProduto(id_opcao);
      carregarGrupos();
    } catch (err) {
      console.error("Erro ao excluir grupo:", err);
      alert("Falha ao excluir grupo.");
    }
  };

  const toggleAdicionarItem = (id_opcao) => {
    setAdicionandoItem((prev) => ({
      ...prev,
      [id_opcao]: !prev[id_opcao],
    }));
    // Limpa os dados do novo item ao fechar
    if (adicionandoItem[id_opcao]) {
        setNovoItemDados((prev) => {
            const newDados = { ...prev };
            delete newDados[id_opcao];
            return newDados;
        });
    } else {
        // Garante que o grupo está aberto ao tentar adicionar um item
        setGruposAbertos((prev) => ({ ...prev, [id_opcao]: true }));
    }
  };
  
  const atualizarNovoItemDados = (id_opcao, campo, valor) => {
    setNovoItemDados((prev) => ({
        ...prev,
        [id_opcao]: {
            ...prev[id_opcao],
            [campo]: valor,
        }
    }));
  };

  const salvarNovoItem = async (grupo) => {
    const dadosItem = novoItemDados[grupo.id_opcao];
    const nome = dadosItem?.nome || "";
    const valor = dadosItem?.valor;
    const valorNumerico = Number(valor);

    if (!nome.trim() || isNaN(valorNumerico) || valorNumerico < 0) {
      return alert("Preencha o nome do item e um valor válido (R$ 0.00 ou mais).");
    }

    try {
      // Adicionar ITEM: Envia o id_opcao, forçando o backend a ADICIONAR o item ao grupo existente.
      await createOpcaoProduto({ 
        id_opcao: grupo.id_opcao, // <-- CRUCIAL: Identifica o grupo pai
        id_produto: idProduto,
        descricao: grupo.descricao, // Mantém os dados do grupo (útil para o PUT da API)
        ind_obrigatorio: grupo.ind_obrigatorio,
        qtd_max_escolha: grupo.qtd_max_escolha,
        ind_ativo: "S",
        // Envia APENAS o item que será adicionado
        itens: [{ 
            nome_item: nome.trim(), 
            vl_item: valorNumerico 
        }],
      });

      // Limpa os campos para o próximo item
      setNovoItemDados((prev) => ({
          ...prev,
          [grupo.id_opcao]: { nome: "", valor: "" } 
      }));

      // Recarrega a lista para mostrar o novo item e mantém o grupo aberto
      carregarGrupos();
      setGruposAbertos((prev) => ({ ...prev, [grupo.id_opcao]: true })); 

      // Foca no campo de nome para permitir a adição rápida de outro item
      if (itemInputRefs.current[grupo.id_opcao]) {
          itemInputRefs.current[grupo.id_opcao].focus();
      }

    } catch (err) {
      console.error("Erro ao adicionar item:", err);
      alert("Erro ao adicionar item. Verifique o console.");
    }
  };

  return (
    <div className="grupos-container">
      <h2 className="titulo">Gerenciar Grupos de Opções</h2>

      {/* Criar grupo */}
      <div className="criar-grupo-wrapper">
        <input
          type="text"
          placeholder="Descrição do Grupo (Ex: Adicionais)"
          value={novoGrupo}
          onChange={(e) => setNovoGrupo(e.target.value)}
          className="input-nome-grupo"
        />
        <select
          value={indObrigatorio}
          onChange={(e) => setIndObrigatorio(e.target.value)}
          className="select-obrigatorio"
        >
          <option value="N">Opcional</option>
          <option value="S">Obrigatório</option>
        </select>
        <input
          type="number"
          min={1}
          value={qtdMaxEscolha} 
          onChange={(e) => setQtdMaxEscolha(e.target.value)}
          placeholder="Máx escolhas"
          className="input-max-escolhas"
        />
        <button className="btn-criar-grupo principal" onClick={criarGrupo}>
          Criar Grupo
        </button>
      </div>

      {grupos.length === 0 ? (
        <p className="mensagem-vazia">Nenhum grupo cadastrado.</p>
      ) : (
        grupos.map((grupo) => (
          <div key={grupo.id_opcao} className="grupo-card">
            <div className="grupo-header" onClick={() => alternarGrupo(grupo.id_opcao)}>
              <h3 title="Clique para expandir/recolher">
                {grupo.descricao}{" "}
                <span className={grupo.ind_obrigatorio === "S" ? "obrigatorio" : "opcional"}>
                  ({grupo.ind_obrigatorio === "S" ? "Obrigatório" : "Opcional"})
                </span>{" "}
                • Máx: <strong>{grupo.qtd_max_escolha}</strong>
              </h3>
              <div className="grupo-buttons">
                <button
                  className="btn-delete"
                  onClick={(e) => {
                    e.stopPropagation(); 
                    excluirGrupo(grupo.id_opcao);
                  }}
                  title="Excluir Grupo"
                >
                  <Trash2 color="#fff" size={16} />
                </button>
                <button
                  className="toggle-btn"
                  onClick={(e) => {
                    e.stopPropagation(); 
                    alternarGrupo(grupo.id_opcao);
                  }}
                  title={gruposAbertos[grupo.id_opcao] ? "Recolher" : "Expandir"}
                >
                  {gruposAbertos[grupo.id_opcao] ? <ChevronUp /> : <ChevronDown />}
                </button>
              </div>
            </div>

            {gruposAbertos[grupo.id_opcao] && (
              <div className="grupo-content">
                <ul className="itens-lista">
                  {grupo.itens.length === 0 ? (
                    <li className="item-linha mensagem-item-vazio">Nenhum item neste grupo.</li>
                  ) : (
                    grupo.itens.map((item) => (
                      <li key={item.id_item} className="item-linha">
                        <span className="item-nome">{item.nome_item}</span>
                        <div className="item-detalhes">
                            <strong className="item-valor">R$ {Number(item.vl_item).toFixed(2).replace('.', ',')}</strong>
                        </div>
                      </li>
                    ))
                  )}
                </ul>

                {/* Formulário/Botão Adicionar Item */}
                <div className="adicionar-item-wrapper">
                  <button
                    className={`btn-adicionar-item ${adicionandoItem[grupo.id_opcao] ? 'cancelar' : ''}`}
                    onClick={() => toggleAdicionarItem(grupo.id_opcao)}
                  >
                    {adicionandoItem[grupo.id_opcao] ? 'Fechar Formulário' : '+ Adicionar Item'}
                  </button>

                  {adicionandoItem[grupo.id_opcao] && (
                    <div className="form-adicionar-item">
                      <input
                        type="text"
                        placeholder="Nome do item (Ex: Ovo)"
                        value={novoItemDados[grupo.id_opcao]?.nome || ""}
                        onChange={(e) =>
                          atualizarNovoItemDados(grupo.id_opcao, "nome", e.target.value)
                        }
                        // Adiciona a ref para o foco
                        ref={(el) => itemInputRefs.current[grupo.id_opcao] = el}
                      />
                      <input
                        type="number"
                        placeholder="Valor (Ex: 3.00)"
                        step="0.01"
                        value={novoItemDados[grupo.id_opcao]?.valor || ""}
                        onChange={(e) =>
                          atualizarNovoItemDados(grupo.id_opcao, "valor", e.target.value)
                        }
                      />
                      <button
                        className="btn-salvar-item"
                        onClick={() => salvarNovoItem(grupo)}
                      >
                        Salvar e Adicionar Outro
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default Grupos;