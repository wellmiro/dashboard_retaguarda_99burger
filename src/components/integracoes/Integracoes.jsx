// src/components/integracoes/Integracoes.jsx
import React, { useState, useEffect } from "react";
import {
  getStatusMercadoPago,
  getLinkConexaoMercadoPago,
  desconectarMercadoPago,
} from "../../api/Integracoes";
import "./Styles.css";

const Integracoes = () => {
  const [loading, setLoading] = useState(true);
  const [conectando, setConectando] = useState(false);
  const [status, setStatus] = useState({
    conectado: false,
    via_oauth: false,
    conectado_em: null,
    expira_em: null,
    mp_user_id: null,
  });
  const [mensagem, setMensagem] = useState(null); // feedback do redirect (?mp=ok, etc.)

  // 1. Carrega o status da loja e confere se voltou do Mercado Pago
  const carregarStatus = async () => {
    try {
      setLoading(true);
      const res = await getStatusMercadoPago();
      setStatus(res.data || {});
    } catch (err) {
      console.error("Erro ao carregar status do Mercado Pago:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Confere se na URL veio o resultado da autorização (ex: /integracoes?mp=ok)
    const params = new URLSearchParams(window.location.search);
    const mpResult = params.get("mp");

    if (mpResult === "ok") {
      setMensagem({
        tipo: "sucesso",
        texto: "🎉 Conta do Mercado Pago conectada com sucesso!",
      });
    } else if (mpResult === "negado") {
      setMensagem({
        tipo: "erro",
        texto: "⚠️ Autorização cancelada ou recusada no Mercado Pago.",
      });
    } else if (mpResult === "expirado") {
      setMensagem({
        tipo: "erro",
        texto: "⏱️ O tempo de autorização expirou. Tente novamente.",
      });
    } else if (mpResult === "erro") {
      setMensagem({
        tipo: "erro",
        texto: "❌ Ocorreu um erro ao vincular a conta. Tente novamente.",
      });
    }

    // Limpa o ?mp= da barra de endereços para não ficar repetindo
    if (mpResult) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    carregarStatus();
  }, []);

  // 2. Clicou em "Conectar com Mercado Pago"
  const handleConectar = async () => {
    try {
      setConectando(true);
      const res = await getLinkConexaoMercadoPago();
      if (res.data?.url) {
        // Redireciona o lojista para a tela de autorização oficial do Mercado Pago
        window.location.href = res.data.url;
      } else {
        alert("Não foi possível gerar o link de conexão.");
        setConectando(false);
      }
    } catch (err) {
      console.error("Erro ao gerar link:", err);
      alert(err.response?.data?.error || "Erro ao conectar com Mercado Pago.");
      setConectando(false);
    }
  };

  // 3. Clicou em "Desconectar"
  const handleDesconectar = async () => {
    const confirmou = window.confirm(
      "Deseja realmente desconectar sua conta do Mercado Pago? Seus clientes não conseguirão pagar via Pix online até você reconectar."
    );
    if (!confirmou) return;

    try {
      setLoading(true);
      await desconectarMercadoPago();
      setMensagem({
        tipo: "sucesso",
        texto: "Mercado Pago desconectado com sucesso.",
      });
      await carregarStatus();
    } catch (err) {
      console.error("Erro ao desconectar:", err);
      alert("Erro ao desconectar conta.");
    } finally {
      setLoading(false);
    }
  };

  // Formata data brasileira
  const formatarData = (dataStr) => {
    if (!dataStr) return "-";
    try {
      const d = new Date(dataStr);
      return d.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dataStr;
    }
  };

  return (
    <div id="integracoesWrapper">
      <div className="integracoes-header">
        <h2>🔌 Integrações de Pagamento</h2>
        <p className="sub-title">
          Conecte sua conta do Mercado Pago para receber pagamentos via Pix direto na sua conta bancária.
        </p>
      </div>

      {/* Banner de Feedback (Sucesso / Erro) */}
      {mensagem && (
        <div className={`alerta-banner ${mensagem.tipo}`}>
          <span>{mensagem.texto}</span>
          <button
            type="button"
            className="btn-fechar-alerta"
            onClick={() => setMensagem(null)}
          >
            ✕
          </button>
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <p>Carregando informações...</p>
        </div>
      ) : (
        <div className="integracao-card">
          <div className="card-topo">
            <div className="marca-info">
              <div className="logo-mp-circulo">
                <i className="fa-solid fa-hand-holding-dollar"></i>
              </div>
              <div>
                <h3>Mercado Pago</h3>
                <span className="categoria-tag">Pix Automático</span>
              </div>
            </div>

            <span
              className={`badge-status ${
                status.conectado ? "conectado" : "desconectado"
              }`}
            >
              {status.conectado ? "● Conectado" : "○ Não Conectado"}
            </span>
          </div>

          <div className="card-corpo">
            <p className="descricao-servico">
              Permite que os pedidos pagos com Pix pelo cardápio digital caiam direto no saldo da sua conta Mercado Pago de forma automática e segura.
            </p>

            {status.conectado && (
              <div className="detalhes-conexao">
                <div className="detalhe-item">
                  <span className="label">Status:</span>
                  <span className="valor texto-verde">Ativo e Pronto</span>
                </div>
                {status.conectado_em && (
                  <div className="detalhe-item">
                    <span className="label">Conectado em:</span>
                    <span className="valor">{formatarData(status.conectado_em)}</span>
                  </div>
                )}
                {status.via_oauth && status.expira_em && (
                  <div className="detalhe-item">
                    <span className="label">Renovação do Token:</span>
                    <span className="valor">Automática até {formatarData(status.expira_em)}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="card-rodape">
            {status.conectado ? (
              <button
                type="button"
                className="btn-desconectar"
                onClick={handleDesconectar}
              >
                Desconectar Conta
              </button>
            ) : (
              <button
                type="button"
                className="btn-conectar"
                onClick={handleConectar}
                disabled={conectando}
              >
                <i className="fa-brands fa-mercadopago"></i>
                {conectando ? "Gerando link seguro..." : "Conectar com Mercado Pago"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Integracoes;