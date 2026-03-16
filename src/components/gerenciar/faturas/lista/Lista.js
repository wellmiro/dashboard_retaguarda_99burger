import React from 'react';
import './Styles.css';

const Lista = () => {
  const faturas = [
    { descricao: 'Plano Mensal - Março', valor: '150,00', vencimento: '16/03/2026', status: 'pago' },
    { descricao: 'Plano Mensal - Fevereiro', valor: '150,00', vencimento: '13/02/2026', status: 'pago' },
    { descricao: 'Plano Mensal - Janeiro', valor: '150,00', vencimento: '11/01/2026', status: 'pago' },
    { descricao: 'Plano Mensal - Dezembro', valor: '100,00', vencimento: '10/12/2025', status: 'pago' },
    { descricao: 'Plano Mensal - Outubro', valor: '150,00', vencimento: '01/10/2025', status: 'pago' },
    { descricao: 'Plano Mensal - Setembro', valor: '150,00', vencimento: '10/09/2025', status: 'pago' },
    { descricao: 'Multa de atraso', valor: '60,00', vencimento: '01/09/2025', status: 'pago' },
    { descricao: 'Plano Mensal - Agosto', valor: '150,00', vencimento: '10/08/2025', status: 'pago' },
  ];

  return (
    <div className="lista-container">
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {/* minWidth garante que a descrição não aperte o texto */}
            <th style={{ textAlign: 'left', padding: '12px', minWidth: '250px' }}>Descrição</th>
            <th style={{ textAlign: 'center', padding: '12px', whiteSpace: 'nowrap' }}>Valor (R$)</th>
            <th style={{ textAlign: 'center', padding: '12px', whiteSpace: 'nowrap' }}>Vencimento</th>
            <th style={{ textAlign: 'center', padding: '12px' }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {faturas.map((fatura, index) => (
            <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '12px', whiteSpace: 'nowrap' }}>{fatura.descricao}</td>
              <td style={{ textAlign: 'center', padding: '12px', whiteSpace: 'nowrap' }}>{fatura.valor}</td>
              <td style={{ textAlign: 'center', padding: '12px', whiteSpace: 'nowrap' }}>{fatura.vencimento}</td>
              <td className="status-cell" style={{ textAlign: 'center', padding: '12px' }}>
                <span className={`status ${fatura.status}`}>Pago</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Lista;