import React, { useEffect, useState } from "react";
import "./Styles.css";

const Header = ({ setFiltroCategoria, pesquisa, setPesquisa, categorias, produtos }) => {
  const [timestamp, setTimestamp] = useState("");
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("all");

  // Atualiza o horário
  useEffect(() => {
    const now = new Date();
    setTimestamp(now.toLocaleString("pt-BR"));
  }, []);

  const handleCategoriaChange = (e) => {
    const categoria = e.target.value;
    setCategoriaSelecionada(categoria);
    setFiltroCategoria(categoria);
  };

  const handlePesquisaChange = (e) => {
    const valor = e.target.value;
    setPesquisa(valor);

    // Se apagar pesquisa, habilita combo
    if (valor.trim() === "") {
      setCategoriaSelecionada("all");
      setFiltroCategoria("all");
    }
  };

  // Função para exportar CSV
  const exportCSV = (produtos) => {
    if (!produtos || produtos.length === 0) return;

    const headers = ["Produto", "Categoria", "Quantidade", "Preço Unit.", "Valor Total"];
    const rows = produtos.map(p => [
      p.nome,
      p.categoria,
      p.qtd,
      Number(p.preco).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
      (Number(p.preco) * Number(p.qtd)).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "relatorio_estoque.csv");
    link.click();
  };

  // Função para imprimir / gerar PDF
  const printPDF = (produtos) => {
    if (!produtos || produtos.length === 0) return;

    const printWindow = window.open("", "PRINT", "height=600,width=800");
    printWindow.document.write(`<html><head><title>Relatório de Estoque</title>`);
    printWindow.document.write(`<style>
      table { width: 100%; border-collapse: collapse; font-family: Arial, sans-serif; }
      th, td { border: 1px solid #ddd; padding: 8px; text-align: center; }
      th { background-color: #3b82f6; color: white; }
      .status-dot.verde { background-color: #10b981; border-radius: 50%; width: 16px; height: 16px; display: inline-block; }
      .status-dot.laranja { background-color: #f59e0b; border-radius: 50%; width: 16px; height: 16px; display: inline-block; }
      .status-dot.vermelho { background-color: #ef4444; border-radius: 50%; width: 16px; height: 16px; display: inline-block; }
      tfoot td { font-weight: bold; }
    </style>`);
    printWindow.document.write(`</head><body>`);
    printWindow.document.write(`<h2>Relatório de Estoque</h2>`);
    printWindow.document.write(`<table><thead><tr>
      <th>Produto</th><th>Categoria</th><th>Quantidade</th><th>Status</th><th>Preço Unit.</th><th>Valor Total</th>
    </tr></thead><tbody>`);

    produtos.forEach(p => {
      const statusClass = p.qtd <= 3 ? "vermelho" : p.qtd <= 10 ? "laranja" : "verde";
      printWindow.document.write(`<tr>
        <td>${p.nome}</td>
        <td>${p.categoria}</td>
        <td>${p.qtd}</td>
        <td><span class="status-dot ${statusClass}"></span></td>
        <td>${Number(p.preco).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
        <td>${(Number(p.preco) * Number(p.qtd)).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
      </tr>`);
    });

    const totalQtd = produtos.reduce((acc, p) => acc + Number(p.qtd), 0);
    const totalValor = produtos.reduce((acc, p) => acc + Number(p.qtd) * Number(p.preco), 0);

    printWindow.document.write(`<tfoot><tr>
      <td colspan="2">Total Geral</td>
      <td>${totalQtd}</td>
      <td></td>
      <td></td>
      <td>${totalValor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
    </tr></tfoot>`);

    printWindow.document.write(`</tbody></table></body></html>`);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  // Remover duplicados para o select
  const categoriasUnicas = Array.from(new Set(categorias));

  return (
    <header className="header">
      <div className="header-top">
        <div className="header-left">
          <h1 className="title">Relatório de Estoque</h1>
          <p className="sub">
            Resumo de produtos, quantidades e valor total em estoque
          </p>
        </div>
        <div className="timestamp">Atualizado em: {timestamp}</div>
      </div>

      <div className="controls">
        <label htmlFor="categoriaSelect">Categoria</label>
        <select
          id="categoriaSelect"
          value={categoriaSelecionada}
          onChange={handleCategoriaChange}
          disabled={pesquisa.trim() !== ""}
        >
          <option value="all">Todas</option>
          {categoriasUnicas.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <label htmlFor="searchInput">Pesquisar</label>
        <input
          type="search"
          id="searchInput"
          placeholder="nome do produto..."
          value={pesquisa}
          onChange={handlePesquisaChange}
        />

        <button
          title="Exportar CSV"
          style={{ marginLeft: "8px" }}
          onClick={() => exportCSV(produtos)}
        >
          Exportar CSV
        </button>

        <button
          title="Imprimir/Salvar PDF"
          style={{ marginLeft: "4px" }}
          onClick={() => printPDF(produtos)}
        >
          Imprimir / PDF
        </button>
      </div>
    </header>
  );
};

export default Header;
