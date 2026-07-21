// src/utils/formatQtd.js
// Helper único para formatar quantidade + unidade de medida em toda a tela de estoque.
// Ex: formatQtd(43, "UN")    -> "43 UN"
//     formatQtd(1.5, "KG")   -> "1,5 KG"
//     formatQtd(250, "G")    -> "250 G"
//     formatQtd(0.25, "L")   -> "0,25 L"

export const UNIDADES_MEDIDA = ["UN", "KG", "G", "L", "ML"];

export const isFracionado = (unidade) => unidade && unidade !== "UN";

// Passo do input number de acordo com a unidade (regra pedida: UN = inteiro, resto = até 3 casas)
export const stepPorUnidade = (unidade) => (isFracionado(unidade) ? "0.001" : "1");

export const formatQtd = (qtd, unidade = "UN") => {
  const num = Number(qtd) || 0;
  const unidadeSegura = unidade || "UN";

  if (!isFracionado(unidadeSegura)) {
    return `${Math.round(num)} ${unidadeSegura}`;
  }

  const valorFormatado = num.toLocaleString("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  });

  return `${valorFormatado} ${unidadeSegura}`;
};

// Soma "limpa" para os cards de métrica (não força zeros à direita, mas mantém até 3 casas)
export const formatQtdTotal = (total) => {
  const num = Number(total) || 0;
  return num.toLocaleString("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  });
};