// src/components/inicio/header/Header.js
import React, { useState, useEffect } from "react";
import { getUsuario } from "../../../api/Usuarios"; // caminho corrigido
import "./Styles.css";

function Header() {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    const id_usuario = localStorage.getItem("id_usuario"); // pega o ID do usuário logado
    if (!id_usuario) {
      setErro("Usuário não logado");
      setLoading(false);
      return;
    }

    getUsuario(id_usuario)
      .then((usuarioData) => {
        setUsuario(usuarioData || null);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erro ao buscar usuário:", err);
        setErro(err.message || "Servidor não está disponível");
        setLoading(false);
      });
  }, []);

  return (
    <header className="dashboard-header">
      <div className="store-info">
        {loading && <p>Carregando dados...</p>}
        {erro && <p style={{ color: "red" }}>{erro}</p>}
        {!loading && usuario && (
          <>
            <img
              src={usuario.logo_empresa || usuario.logo_empresa}
              alt={usuario.nome_empresa || usuario.nome}
              className="store-logo"
            />
            <div className="store-text">
              <h2>{usuario.nome_empresa || usuario.nome}</h2>
              <p>
                {usuario.rua}, {usuario.numero} - {usuario.cidade}, {usuario.estado} - {usuario.cep}
              </p>
            </div>
          </>
        )}
      </div>
      <div className="edit-button">
        <button>Editar dados</button>
      </div>
    </header>
  );
}

export default Header;
