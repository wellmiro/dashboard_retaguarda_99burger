import React, { useState, useEffect } from "react";
import Header from "./header/Header";
import Cards from "./cards/Cards";
import Lista from "./lista/Lista";
import Grafico from "./grafico/Grafico";
import { getProdutos } from "../../../api/Produtos";
import "./Styles.css";

function Estoque() {
  const [produtos, setProdutos] = useState([]);
  const [filtroCategoria, setFiltroCategoria] = useState("all");
  const [pesquisa, setPesquisa] = useState("");

  // Buscar produtos da API
  useEffect(() => {
    const fetchProdutos = async () => {
      try {
        const res = await getProdutos();
        setProdutos(res.data || []);
      } catch (error) {
        console.error("Erro ao buscar produtos:", error);
      }
    };
    fetchProdutos();
  }, []);

  // Filtrar produtos por categoria e pesquisa
  const produtosFiltrados = produtos
    .filter((p) => (p.nome || "").toLowerCase().includes(pesquisa.toLowerCase()))
    .filter((p) => filtroCategoria === "all" || p.categoria === filtroCategoria);

  // Lista de categorias únicas
  const categoriasUnicas = Array.from(new Set(produtos.map((p) => p.categoria)));

  return (
    <div className="main">
      <Header
        setFiltroCategoria={setFiltroCategoria}
        pesquisa={pesquisa}
        setPesquisa={setPesquisa}
        categorias={categoriasUnicas} // passa só categorias únicas
        produtos={produtosFiltrados}  // passa produtos filtrados para CSV/PDF
      />
      <Cards filtroCategoria={filtroCategoria} produtos={produtosFiltrados} />
      <Lista produtos={produtosFiltrados} />
      <div style={{ marginTop: "30px" }}>
        <h3>Top 5 Produtos por Valor Total</h3>
        <Grafico produtos={produtosFiltrados} />
      </div>
    </div>
  );
}

export default Estoque;
