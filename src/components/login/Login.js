// src/components/login/Login.js
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

    // Reseta erros
    setErroEmail("");
    setErroSenha("");

    if (!email) {
      setErroEmail("Preencha o email");
      return;
    }
    if (!senha) {
      setErroSenha("Preencha a senha");
      return;
    }

    try {
      const response = await loginUsuario(email, senha);
      const usuario = response.data;

      // Salva id_usuario e nome
      localStorage.setItem("id_usuario", usuario.id_usuario);
      localStorage.setItem("nome_usuario", usuario.nome);

      // Redireciona para dashboard
      navigate("/");
    } catch (err) {
      if (err.response) {
        const msg = err.response.data.error || "Erro ao efetuar login";
        // Mensagens específicas
        if (msg.includes("Usuário ou senha inválidos")) {
          setErroEmail("Email incorreto ou não cadastrado");
          setErroSenha("Senha incorreta");
        } else if (msg.includes("Usuário ou senha inválidos")) {
          setErroSenha("Senha incorreta");
        } else {
          setErroEmail(msg);
        }
      } else {
        setErroEmail("Servidor não está disponível");
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
            name="email"
            placeholder="nome@exemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {erroEmail && <span className="input-error">{erroEmail}</span>}
        </label>

        <label>
          Senha:
          <input
            type="password"
            name="password"
            placeholder="********"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
          {erroSenha && <span className="input-error">{erroSenha}</span>}
        </label>

        <div className="button-container">
          <button type="submit">Entrar</button>
          <a href="#" className="forgot-password">Esqueci a senha</a>
        </div>
      </form>
    </div>
  );
}

export default Login;
