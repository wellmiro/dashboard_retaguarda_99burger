import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUsuario } from "../../api/Usuarios";
import "./Styles.css";

function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erroEmail, setErroEmail] = useState("");
  const [erroSenha, setErroSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErroEmail("");
    setErroSenha("");
    setCarregando(true);

    if (!email) { setCarregando(false); return setErroEmail("Preencha o email"); }
    if (!senha) { setCarregando(false); return setErroSenha("Preencha a senha"); }

    try {
      const usuario = await loginUsuario(email, senha);

      if (usuario && usuario.id_usuario) {
        // --- A LINHA QUE SALVA O SISTEMA ---
        localStorage.setItem("token", usuario.token); 
        
        localStorage.setItem("id_usuario", usuario.id_usuario);
        localStorage.setItem("nome_usuario", usuario.nome);
        localStorage.setItem("email_usuario", usuario.email);
        localStorage.setItem("status_usuario", usuario.status);
        localStorage.setItem("dt_cadastro_usuario", usuario.dt_cadastro);

        if (onLoginSuccess) { onLoginSuccess(); }

        setTimeout(() => { navigate("/inicio"); }, 200);
      } else {
        throw new Error("Dados de usuário inválidos");
      }

    } catch (err) {
      setCarregando(false);
      const msg = err.response?.data?.error || err.message || "Erro ao efetuar login";
      const erroTexto = msg.toLowerCase();
      
      if (erroTexto.includes("usuário") || erroTexto.includes("senha") || erroTexto.includes("incorreto")) {
        setErroSenha("Email ou senha incorretos");
      } else {
        setErroEmail("Falha na conexão com o servidor");
      }
    }
  };

  return (
    <div className="login-container">
      <header className="login-header">
        <div className="ifood-logo">🍔</div>
        <h1>Portal do Parceiro</h1>
        <p>Gerencie seu 99Burger com segurança.</p>
      </header>

      <form className="login-form" onSubmit={handleLogin}>
        <label>
          Email:
          <input type="email" value={email} disabled={carregando} placeholder="nome@exemplo.com"
            onChange={(e) => setEmail(e.target.value)} />
          {erroEmail && <span className="input-error">{erroEmail}</span>}
        </label>

        <label>
          Senha:
          <input type="password" value={senha} disabled={carregando} placeholder="********"
            onChange={(e) => setSenha(e.target.value)} />
          {erroSenha && <span className="input-error">{erroSenha}</span>}
        </label>

        <div className="button-container">
          <button type="submit" disabled={carregando}>
            {carregando ? "Validando..." : "Entrar no Painel"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default Login;