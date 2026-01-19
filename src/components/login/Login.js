// src/pages/Login/Login.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUsuario } from "../../api/Usuarios";
import "./Styles.css";

function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erroEmail, setErroEmail] = useState("");
  const [erroSenha, setErroSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    // Limpa estados de erro e ativa carregamento
    setErroEmail("");
    setErroSenha("");
    setCarregando(true);

    // Validações simples de formulário
    if (!email) {
      setCarregando(false);
      return setErroEmail("Preencha o email");
    }
    if (!senha) {
      setCarregando(false);
      return setErroSenha("Preencha a senha");
    }

    try {
      // Chama a API de login
      const usuario = await loginUsuario(email, senha);

      // Verifica se a API retornou o usuário corretamente antes de salvar
      if (usuario && usuario.id_usuario) {
        // Salva os dados do usuário no localStorage
        localStorage.setItem("id_usuario", usuario.id_usuario);
        localStorage.setItem("nome_usuario", usuario.nome);
        localStorage.setItem("email_usuario", usuario.email);
        localStorage.setItem("status_usuario", usuario.status);
        localStorage.setItem("dt_cadastro_usuario", usuario.dt_cadastro);

        // O setTimeout ajuda a garantir que o localStorage foi gravado 
        // antes do redirecionamento para evitar bugs de rotas protegidas
        setTimeout(() => {
          navigate("/inicio");
        }, 200);
      } else {
        throw new Error("Dados de usuário inválidos");
      }

    } catch (err) {
      setCarregando(false);
      // Pega a mensagem de erro vinda do servidor ou da exceção
      const msg = err.response?.data?.error || err.message || "Erro ao efetuar login";

      // Verifica se o erro é de credenciais para exibir na tela
      const erroTexto = msg.toLowerCase();
      if (erroTexto.includes("usuário") || erroTexto.includes("senha") || erroTexto.includes("incorreto") || erroTexto.includes("inválido")) {
        setErroEmail("Verifique suas credenciais");
        setErroSenha("Email ou senha incorretos");
      } else {
        // Para erros técnicos (ex: servidor fora do ar)
        setErroEmail("Falha na conexão com o servidor");
        console.error("Erro no login:", msg);
      }
    }
  };

  return (
    <div className="login-container">
      <header className="login-header">
        <div className="ifood-logo">🍔</div>
        <h1>Portal do Parceiro</h1>
        <p>Faça login para gerenciar seu negócio.</p>
      </header>

      <form className="login-form" onSubmit={handleLogin}>
        <label>
          Email:
          <input
            type="email"
            value={email}
            disabled={carregando}
            onChange={(e) => {
              setEmail(e.target.value);
              setErroEmail("");
            }}
            placeholder="nome@exemplo.com"
            autoComplete="email"
          />
          {erroEmail && <span className="input-error">{erroEmail}</span>}
        </label>

        <label>
          Senha:
          <input
            type="password"
            value={senha}
            disabled={carregando}
            onChange={(e) => {
              setSenha(e.target.value);
              setErroSenha("");
            }}
            placeholder="********"
            autoComplete="current-password"
          />
          {erroSenha && <span className="input-error">{erroSenha}</span>}
        </label>

        <div className="button-container">
          <button type="submit" disabled={carregando}>
            {carregando ? "Entrando..." : "Entrar"}
          </button>
          <a href="#" onClick={(e) => e.preventDefault()} className="forgot-password">
            Esqueci a senha
          </a>
        </div>
      </form>
    </div>
  );
}

export default Login;