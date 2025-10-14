import React from "react";
import "./Styles.css";

const formatCurrency = (val) =>
  Number(val).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const Lista = ({ produtos }) => {
  const totalQuantidade = produtos.reduce((acc, p) => acc + Number(p.qtd), 0);
  const totalValor = produtos.reduce(
    (acc, p) => acc + Number(p.qtd) * parseFloat(p.preco),
    0
  );

  const getStatusColor = (qtd) => {
    if (qtd <= 3) return "vermelho";
    if (qtd <= 10) return "laranja";
    return "verde";
  };

  return (
    <div className="lista-container">
      <table className="lista-estoque">
        <thead>
          <tr>
            <th>Produto</th>
            <th>Categoria</th>
            <th>Quantidade</th>
            <th>Status</th>
            <th>Preço Unit.</th>
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
              <tr key={p.id_produto}>
                <td>
                  {p.url_foto ? (
                    <img className="product-img" src={p.url_foto} alt={p.nome} />
                  ) : (
                    <div className="no-img">Sem Foto</div>
                  )}{" "}
                  {p.nome}
                </td>
                <td>{p.categoria}</td>
                <td className="quantity">{p.qtd}</td>
                <td className="status">
                  <span
                    className={`status-dot ${getStatusColor(p.qtd)}`}
                    title={`Estoque: ${p.qtd}`}
                  ></span>
                </td>
                <td className="price">{formatCurrency(p.preco)}</td>
                <td className="total-value">
                  {formatCurrency(p.qtd * parseFloat(p.preco))}
                </td>
              </tr>
            ))
          )}
        </tbody>
        <tfoot>
          <tr className="total-row">
            <td colSpan="3" className="bold">Total Geral</td>
            <td className="quantity bold">{totalQuantidade}</td>
            <td></td>
            <td className="total-value bold">{formatCurrency(totalValor)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default Lista;
