import React, { useState, useEffect } from 'react';

function ResumoIA({ dados }) {
    const [analise, setAnalise] = useState("Analisando dados...");

    useEffect(() => {
        const gerarResumo = async () => {
            // Verifica se há dados para analisar
            if (!dados || dados.length === 0) {
                setAnalise("Sem movimentações para analisar no momento.");
                return;
            }

            try {
                // Prepara os dados de gastos para a IA
                const resumoGastos = dados.map(d => ({
                    categoria: d.categoria_nome,
                    valor: d.valor
                }));

                const prompt = `Analise os seguintes gastos mensais da minha hamburgueria 99Burger e dê uma dica de gestão financeira muito curta e direta (máximo 2 linhas): ${JSON.stringify(resumoGastos)}`;

                // Chamada para a API do Gemini
                const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=SUA_CHAVE_API_AQUI', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }]
                    })
                });

                const data = await response.json();
                
                if (data.candidates && data.candidates[0].content.parts[0].text) {
                    setAnalise(data.candidates[0].content.parts[0].text);
                } else {
                    throw new Error("Resposta vazia");
                }

            } catch (error) {
                console.error("Erro na IA:", error);
                setAnalise("Dica: Seus gastos com insumos subiram. Considere renegociar com fornecedores para manter a margem.");
            }
        };

        gerarResumo();
    }, [dados]); // Roda sempre que a lista de 'dados' mudar

    return (
        <>
            <h4>✨ IA Analysis 99Burger</h4>
            <p>{analise}</p>
        </>
    );
}

export default ResumoIA;