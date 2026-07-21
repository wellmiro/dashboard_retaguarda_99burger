import React from "react";
import "./Styles.css";
import { formatQtd, formatQtdTotal } from "../../../../utils/formatQtd";

const formatCurrency = (val) =>
  Number(val).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const Lista = ({ produtos }) => {
  const totalQuantidade = produtos.reduce((acc, p) => acc + (Number(p.qtd) || 0), 0);
  const totalValor = produtos.reduce(
    (acc, p) => acc + (Number(p.qtd) || 0) * (parseFloat(p.preco) || 0),
    0
  );

  const getStatusColor = (qtd) => {
    const quantity = Number(qtd) || 0;
    if (quantity <= 3) return "vermelho";
    if (quantity <= 10) return "laranja";
    return "verde";
  };

  return (
    <div className="lista-container">
      <table className="lista-estoque">
        <thead>
          <tr>
            <th>Produto</th>
            <th className="hide-on-mobile">Categoria</th>
            <th>Quantidade</th>
            <th>Status</th>
            <th className="hide-on-mobile">Preço Unit.</th>
            <th>Valor Total</th>
          </tr>
        </thead>
        <tbody>
          {produtos.length === 0 ? (
            <tr>
              <td colSpan="6" style={{ textAlign: "center" }}>
                Nenhum produto encontrado
              </td>
            </tr>
          ) : (
            produtos.map((p) => (
              <tr key={p.id_produto} className="mobile-card">
                {/* 1. Produto: Header do Card */}
                <td data-label="Produto" className="product-header-cell">
                  {p.url_foto ? (
                    <img className="product-img loaded" src={p.url_foto} alt={p.nome} />
                  ) : (
                    <div className="no-img">S/F</div>
                  )}
                  <span className="product-name">{p.nome}</span>
                </td>
                
                {/* 2. Categoria: Coluna de duas partes no mobile */}
                <td data-label="Categoria" className="grid-cell category-cell hide-on-mobile">
                  {p.categoria || "—"}
                </td>
                
                {/* 3. Quantidade: Coluna de duas partes no mobile */}
                <td data-label="Quantidade" className="grid-cell quantity-cell">
                  <span>{formatQtd(p.qtd, p.unidade_medida)}</span>
                </td>
                
                {/* 4. Status: Coluna de duas partes no mobile (reintegrada) */}
                <td data-label="Status" className="status-cell grid-cell"> 
                  <span
                    className={`status-dot ${getStatusColor(p.qtd)}`}
                    title={`Estoque: ${formatQtd(p.qtd, p.unidade_medida)}`}
                  ></span>
                </td>
                
                {/* 5. Preço Unit.: Coluna de duas partes no mobile */}
                <td data-label="Preço Unit." className="grid-cell price-cell hide-on-mobile">
                  <span>{formatCurrency(p.preco)}</span>
                </td>
                
                {/* 6. Valor Total: Coluna de duas partes no mobile (destaque) */}
                <td data-label="Valor Total" className="grid-cell total-value total-value-cell">
                  <span>{formatCurrency((Number(p.qtd) || 0) * (parseFloat(p.preco) || 0))}</span>
                </td>
              </tr>
            ))
          )}
        </tbody>
        <tfoot>
          <tr className="total-row mobile-card">
            {/* Células de texto para Desktop: Categoria e Preço Unit estão escondidas, então o colSpan é 2 */}
            <td className="hide-on-mobile"></td>
            <td className="hide-on-mobile"></td>
            <td colSpan="2" className="total-label-cell hide-on-mobile" style={{textAlign: "right", fontWeight: 700}}>
              TOTAL
            </td>
            
            {/* Total Quantidade — soma "crua" pode misturar unidades diferentes (UN + KG etc),
                por isso mostramos só o número total limpo, sem concatenar uma unidade única */}
            <td data-label="Total Quantidade" className="grid-cell total-quantity-cell">
              <span>{formatQtdTotal(totalQuantidade)}</span>
            </td>
            
            {/* Total Geral */}
            <td data-label="Total Geral" className="grid-cell final-total-value-cell">
              <span>{formatCurrency(totalValor)}</span>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default Lista;