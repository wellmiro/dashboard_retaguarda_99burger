import React, { useState, useEffect } from "react";
import * as api from "../../../../api/Despesas";
import { X } from "lucide-react";
import "./cad_despesas.css";

function CadDespesas({ isOpen, onClose, onRefresh, despesaEditar }) {
    const [categorias, setCategorias] = useState([]);
    const [form, setForm] = useState({ 
        descricao: '', 
        valor: '', 
        id_categoria: '', 
        data_vencimento: '' 
    });

    // Carrega as categorias para o select
    useEffect(() => {
        const carregarCategorias = async () => {
            try {
                const res = await api.getCategoriasDespesa();
                setCategorias(res.data || []);
            } catch (e) {
                console.error("Erro ao carregar categorias", e);
            }
        };
        if (isOpen) carregarCategorias();
    }, [isOpen]);

    // Preenche o form se for edição
    useEffect(() => {
        if (despesaEditar) {
            setForm({
                descricao: despesaEditar.descricao,
                valor: despesaEditar.valor,
                id_categoria: despesaEditar.id_categoria,
                data_vencimento: despesaEditar.data_vencimento.split('T')[0]
            });
        } else {
            setForm({ descricao: '', valor: '', id_categoria: '', data_vencimento: '' });
        }
    }, [despesaEditar, isOpen]);

    const handleSalvar = async () => {
        if (!form.descricao || !form.valor || !form.id_categoria || !form.data_vencimento) {
            return alert("Preencha todos os campos obrigatórios!");
        }

        try {
            if (despesaEditar) {
                await api.updateDespesa(despesaEditar.id_despesa, form);
            } else {
                // Adiciona o ID do usuário e status 'A' (Aberto/Pendente)
                await api.createDespesa({ 
                    ...form, 
                    id_usuario: localStorage.getItem("id_usuario"), 
                    status: 'A' 
                });
            }
            onRefresh();
            onClose();
        } catch (e) {
            alert("Erro ao salvar a despesa.");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>{despesaEditar ? "Editar Despesa" : "Nova Despesa"}</h2>
                    <button className="btn-close" onClick={onClose}><X size={20}/></button>
                </div>

                <div className="form-group">
                    <label>Descrição</label>
                    <input 
                        type="text"
                        value={form.descricao} 
                        onChange={e => setForm({...form, descricao: e.target.value})} 
                        placeholder="Ex: Aluguel, Fornecedor..."
                    />
                </div>

                <div className="form-group">
                    <label>Valor (R$)</label>
                    <input 
                        type="number" 
                        value={form.valor} 
                        onChange={e => setForm({...form, valor: e.target.value})} 
                        placeholder="0,00"
                    />
                </div>

                <div className="form-group">
                    <label>Categoria</label>
                    <select 
                        value={form.id_categoria} 
                        onChange={e => setForm({...form, id_categoria: e.target.value})}
                    >
                        <option value="">Selecione uma categoria...</option>
                        {categorias.map(c => (
                            <option key={c.id_categoria} value={c.id_categoria}>
                                {c.descricao}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>Data de Vencimento</label>
                    <input 
                        type="date" 
                        value={form.data_vencimento} 
                        onChange={e => setForm({...form, data_vencimento: e.target.value})} 
                    />
                </div>

                <button className="btn-ifood w-100" style={{marginTop: '20px'}} onClick={handleSalvar}>
                    {despesaEditar ? "Atualizar Lançamento" : "Confirmar Lançamento"}
                </button>
            </div>
        </div>
    );
}

export default CadDespesas;