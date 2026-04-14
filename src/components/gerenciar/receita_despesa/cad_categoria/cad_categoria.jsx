import React, { useState, useEffect } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import api from "../../../../api/Despesas";
import "./cad_categoria.css";

function CadCategoria({ isOpen, onClose, onRefresh }) {
    const [categorias, setCategorias] = useState([]);
    const [novaCat, setNovaCat] = useState("");

    const carregarCategorias = async () => {
        try {
            const res = await api.getCategoriasDespesa();
            setCategorias(res.data || []);
        } catch (e) {
            console.error("Erro ao carregar categorias", e);
        }
    };

    useEffect(() => {
        if (isOpen) carregarCategorias();
    }, [isOpen]);

    const handleSalvar = async () => {
        if (!novaCat.trim()) return;
        try {
            await api.createCategoriaDespesa({ descricao: novaCat });
            setNovaCat("");
            carregarCategorias();
            if (onRefresh) onRefresh(); 
        } catch (e) {
            alert("Erro ao salvar categoria");
        }
    };

    const handleExcluir = async (id) => {
        if (window.confirm("Deseja realmente excluir esta categoria?")) {
            try {
                await api.deleteCategoriaDespesa(id);
                carregarCategorias();
                if (onRefresh) onRefresh();
            } catch (e) {
                alert("Erro ao excluir. Verifique se existem despesas vinculadas.");
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay-cat">
            <div className="modal-content-cat">
                <header className="modal-header-cat">
                    <h2>Gestão de Categorias</h2>
                    <button className="btn-close-cat" onClick={onClose}>
                        <X size={24} />
                    </button>
                </header>

                <div className="form-input-cat">
                    <input
                        type="text"
                        value={novaCat}
                        onChange={(e) => setNovaCat(e.target.value)}
                        placeholder="Nova categoria..."
                    />
                    <button className="btn-add-cat" onClick={handleSalvar}>
                        <Plus size={20} />
                    </button>
                </div>

                <div className="lista-categorias-cat">
                    {categorias.map((c) => (
                        <div key={c.id_categoria} className="item-categoria-cat">
                            <span>{c.descricao}</span>
                            <button 
                                className="btn-del-cat" 
                                onClick={() => handleExcluir(c.id_categoria)}
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default CadCategoria;