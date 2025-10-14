// src/components/gerenciar/faturas/lista/Lista.js
import React from 'react';
import './Styles.css';

const Lista = () => {
  // Dados de exemplo das faturas
  const faturas = [
    { descricao: 'Plano Mensal - Agosto', valor: '150,00', vencimento: '10/08/2025', status: 'pago' },
    { descricao: 'Plano Mensal - Setembro', valor: '150,00', vencimento: '10/09/2025', status: 'pago' },
    { descricao: 'Multa de atraso', valor: '60,00', vencimento: '01/09/2025', status: 'pago' },
    { descricao: 'Plano Mensal - Outubro', valor: '150,00', vencimento: '01/10/2025', status: 'pago' },
  ];

  return (
    <div className="lista-container">
      <table>
        <thead>
          <tr>
            <th>Descrição</th>
            <th>Valor (R$)</th>
            <th>Vencimento</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {faturas.map((fatura, index) => (
            <tr key={index}>
              <td>{fatura.descricao}</td>
              <td>{fatura.valor}</td>
              <td>{fatura.vencimento}</td>
              <td className="status-cell">
                <span className={`status ${fatura.status}`}>
                  {fatura.status === 'pago'
                    ? 'Pago'
                    : fatura.status === 'pendente'
                    ? 'Pendente'
                    : 'Atrasado'}
                </span>
              </td>
              <td>
                {fatura.status !== 'pago' && (
                  <button className="btn-pagar">Pagar Agora</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Lista;
