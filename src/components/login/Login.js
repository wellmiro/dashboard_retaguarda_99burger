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
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    // Limpa erros antigos
    setErroEmail("");
    setErroSenha("");

    // Validações simples
    if (!email) return setErroEmail("Preencha o email");
    if (!senha) return setErroSenha("Preencha a senha");

    try {
      // Chama a API de login
      const usuario = await loginUsuario(email, senha);

      // Salva os dados do usuário no localStorage
      localStorage.setItem("id_usuario", usuario.id_usuario);
      localStorage.setItem("nome_usuario", usuario.nome);
      localStorage.setItem("email_usuario", usuario.email);
      localStorage.setItem("status_usuario", usuario.status);
      localStorage.setItem("dt_cadastro_usuario", usuario.dt_cadastro);

      // Redireciona para a página inicial
      navigate("/inicio");
    } catch (err) {
      const msg = err.message || "Erro ao efetuar login";

      // Erros de credenciais
      if (msg.toLowerCase().includes("usuário") || msg.toLowerCase().includes("senha")) {
        setErroEmail("Email ou usuário incorreto");
        setErroSenha("Senha incorreta");
      } else {
        setErroEmail(msg);
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
            onChange={(e) => {
              setEmail(e.target.value);
              setErroEmail("");
            }}
            placeholder="nome@exemplo.com"
          />
          {erroEmail && <span className="input-error">{erroEmail}</span>}
        </label>

        <label>
          Senha:
          <input
            type="password"
            value={senha}
            onChange={(e) => {
              setSenha(e.target.value);
              setErroSenha("");
            }}
            placeholder="********"
          />
          {erroSenha && <span className="input-error">{erroSenha}</span>}
        </label>

        <div className="button-container">
          <button type="submit">Entrar</button>
          <a href="#" onClick={(e) => e.preventDefault()} className="forgot-password">
            Esqueci a senha
          </a>
        </div>
      </form>
    </div>
  );
}

export default Login;
