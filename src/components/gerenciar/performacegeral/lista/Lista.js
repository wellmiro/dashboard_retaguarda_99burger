import React, { useEffect, useState } from 'react';
import { getPedidos } from '../../../../api/Pedidos';
import './Styles.css';

const Lista = () => {
  const [maisVendidos, setMaisVendidos] = useState([]);
  const [menosVendidos, setMenosVendidos] = useState([]);

  useEffect(() => {
    getPedidos().then(res => {
      const pedidos = res.data;
      const contagemProdutos = {};

      // Conta quantidade e valor de cada produto
      pedidos.forEach(pedido => {
        pedido.itens.forEach(item => {
          if (contagemProdutos[item.nome_produto]) {
            contagemProdutos[item.nome_produto].quantidade += parseInt(item.qtd);
            contagemProdutos[item.nome_produto].valor += parseFloat(item.vl_unitario) * parseInt(item.qtd);
          } else {
            contagemProdutos[item.nome_produto] = {
              quantidade: parseInt(item.qtd),
              valor: parseFloat(item.vl_unitario) * parseInt(item.qtd)
            };
          }
        });
      });

      // transforma em array
      const produtosArray = Object.keys(contagemProdutos).map(nome => ({
        nome,
        quantidade: contagemProdutos[nome].quantidade,
        valor: contagemProdutos[nome].valor
      }));

      // Ordena
      const mais = [...produtosArray].sort((a, b) => b.quantidade - a.quantidade).slice(0, 5);
      const menos = [...produtosArray].sort((a, b) => a.quantidade - b.quantidade).slice(0, 5);

      setMaisVendidos(mais);
      setMenosVendidos(menos);
    });
  }, []);

  const formatarValor = (valor) => valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="produtos-cards">
      <div className="produto-card">
        <h5>🔥 Mais Vendidos</h5>
        <table>
          <thead>
            <tr>
              <th>Produto</th>
              <th>Quantidade</th>
              <th>Valor Vendido</th>
            </tr>
          </thead>
          <tbody>
            {maisVendidos.map((produto, index) => (
              <tr key={index}>
                <td>{produto.nome}</td>
                <td>{produto.quantidade}</td>
                <td>{formatarValor(produto.valor)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="produto-card">
        <h5>❄️ Menos Vendidos</h5>
        <table>
          <thead>
            <tr>
              <th>Produto</th>
              <th>Quantidade</th>
              <th>Valor Vendido</th>
            </tr>
          </thead>
          <tbody>
            {menosVendidos.map((produto, index) => (
              <tr key={index}>
                <td>{produto.nome}</td>
                <td>{produto.quantidade}</td>
                <td>{formatarValor(produto.valor)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Lista;
