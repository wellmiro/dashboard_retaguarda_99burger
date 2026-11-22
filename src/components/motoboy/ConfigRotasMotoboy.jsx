import React, { useEffect, useMemo, useState, useCallback } from "react";
import { MapContainer, TileLayer, Circle, Marker, Tooltip, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  getConfigMotoboy, salvarConfigMotoboy, criarZona, atualizarZona, excluirZona,
} from "../../api/Motoboy";
import "./Style.css";

const CORES = ["#e63946", "#2a9d8f", "#f4a261", "#6a4c93", "#1d7874", "#e76f51", "#3a86ff", "#8d6b00"];
const MIN_VALOR = 1;
const RAIO_MIN = 200;
const RAIO_MAX = 15000;
const CENTRO_PADRAO = [-23.8113, -47.7134]; // Pilar do Sul, caso o estabelecimento não tenha lat/lng

const iconeLoja = L.divIcon({
  className: "cfg-pin-loja",
  html: "<span>🍔</span>",
  iconSize: [38, 38],
  iconAnchor: [19, 38],
});
const iconeTeste = L.divIcon({
  className: "cfg-pin-teste",
  html: "<span>📍</span>",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

const brl = (n) => Number(n || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const toNum = (v) => {
  if (v === "" || v === null || v === undefined) return null;
  const n = Number(String(v).replace(",", "."));
  return isNaN(n) ? null : n;
};

function haversineMetros(lat1, lng1, lat2, lng2) {
  const R = 6371000, rad = (d) => (d * Math.PI) / 180;
  const dLat = rad(lat2 - lat1), dLng = rad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(a));
}

// Mesma regra do backend (calcularFrete)
function simularFrete(cfg, zonas, loja, ponto) {
  const distKm = haversineMetros(loja[0], loja[1], ponto[0], ponto[1]) / 1000;
  const porKm = (v) => Math.round(distKm * Number(v || 0) * 100) / 100;
  if (cfg.usa_zonas) {
    const hit = zonas
      .filter((z) => haversineMetros(Number(z.latitude), Number(z.longitude), ponto[0], ponto[1]) <= z.raio_metros)
      .sort((a, b) => a.raio_metros - b.raio_metros || a.valor - b.valor)[0];
    if (hit) return { valor: Number(hit.valor), origem: `Zona "${hit.nome_zona || "#" + hit.id_zona}"`, distKm };
    return cfg.fallback_modo === "KM"
      ? { valor: porKm(toNum(cfg.fallback_valor)), origem: "Fora das zonas (contingência por km)", distKm }
      : { valor: toNum(cfg.fallback_valor) || 0, origem: "Fora das zonas (contingência fixa)", distKm };
  }
  return cfg.modo_cobranca === "FIXO"
    ? { valor: toNum(cfg.valor_fixo) || 0, origem: "Valor fixo", distKm }
    : { valor: porKm(toNum(cfg.valor_km)), origem: "Cálculo por km", distKm };
}

/* ---------- componentes auxiliares do mapa ---------- */
function MapClicks({ onClick }) {
  useMapEvents({ click: (e) => onClick([e.latlng.lat, e.latlng.lng]) });
  return null;
}
function Recentralizar({ centro }) {
  const map = useMap();
  useEffect(() => { map.setView(centro, map.getZoom() < 11 ? 13 : map.getZoom()); }, [centro, map]);
  return null;
}

export default function ConfigRotasMotoboy() {
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [toast, setToast] = useState(null);
  const [loja, setLoja] = useState(null); // {nome, centro:[lat,lng], semCoordenada}
  const [cfg, setCfg] = useState({
    modo_cobranca: "KM", valor_km: "", valor_fixo: "",
    usa_zonas: false, fallback_modo: "FIXO", fallback_valor: "",
  });
  const [zonas, setZonas] = useState([]);
  const [rascunho, setRascunho] = useState({ ponto: null, raio: 1500, valor: "", nome: "" });
  const [editandoId, setEditandoId] = useState(null);
  const [modoTeste, setModoTeste] = useState(false);
  const [pontoTeste, setPontoTeste] = useState(null);
  const [dicasAbertas, setDicasAbertas] = useState(false);

  const mostrarToast = useCallback((msg, tipo = "ok") => {
    setToast({ msg, tipo });
    setTimeout(() => setToast(null), 3200);
  }, []);

  /* ---------- carga inicial ---------- */
  const carregar = useCallback(async () => {
    try {
      const { data } = await getConfigMotoboy();
      const lat = parseFloat(data.estabelecimento?.latitude);
      const lng = parseFloat(data.estabelecimento?.longitude);
      const semCoord = isNaN(lat) || isNaN(lng);
      setLoja({
        nome: data.estabelecimento?.nome || "Lanchonete",
        centro: semCoord ? CENTRO_PADRAO : [lat, lng],
        semCoordenada: semCoord,
      });
      setCfg({
        modo_cobranca: data.config.modo_cobranca || "KM",
        valor_km: data.config.valor_km ?? "",
        valor_fixo: data.config.valor_fixo ?? "",
        usa_zonas: !!data.config.usa_zonas,
        fallback_modo: data.config.fallback_modo || "FIXO",
        fallback_valor: data.config.fallback_valor ?? "",
      });
      setZonas(data.zonas || []);
    } catch (e) {
      mostrarToast(e.response?.data?.error || "Não foi possível carregar suas configurações.", "erro");
    } finally {
      setCarregando(false);
    }
  }, [mostrarToast]);

  useEffect(() => { carregar(); }, [carregar]);

  /* ---------- validações inteligentes ---------- */
  const sobreposicoes = useMemo(() => {
    if (!rascunho.ponto) return [];
    return zonas
      .filter((z) => z.id_zona !== editandoId)
      .filter((z) => haversineMetros(Number(z.latitude), Number(z.longitude), rascunho.ponto[0], rascunho.ponto[1]) < z.raio_metros + rascunho.raio)
      .map((z) => z.nome_zona || `Zona #${z.id_zona}`);
  }, [zonas, rascunho.ponto, rascunho.raio, editandoId]);

  const resultadoTeste = useMemo(() => {
    if (!pontoTeste || !loja) return null;
    return simularFrete(cfg, zonas, loja.centro, pontoTeste);
  }, [pontoTeste, cfg, zonas, loja]);

  const setCampo = (campo, valor) => setCfg((c) => ({ ...c, [campo]: valor }));

  /* ---------- ações de zona ---------- */
  const limparRascunho = () => {
    setRascunho({ ponto: null, raio: 1500, valor: "", nome: "" });
    setEditandoId(null);
  };

  const aoClicarMapa = (ponto) => {
    if (modoTeste) return setPontoTeste(ponto);
    if (!cfg.usa_zonas) return;
    setRascunho((r) => ({ ...r, ponto }));
  };

  const salvarZona = async () => {
    const valor = toNum(rascunho.valor);
    if (!rascunho.ponto) return mostrarToast("Toque no mapa para marcar o centro da zona.", "erro");
    if (valor === null || valor < MIN_VALOR) return mostrarToast(`Valor mínimo por zona: ${brl(MIN_VALOR)}.`, "erro");

    const payload = {
      nome_zona: rascunho.nome.trim(),
      latitude: rascunho.ponto[0],
      longitude: rascunho.ponto[1],
      raio_metros: rascunho.raio,
      valor,
    };
    try {
      setSalvando(true);
      if (editandoId) await atualizarZona(editandoId, payload);
      else await criarZona(payload);
      await carregar();
      limparRascunho();
      mostrarToast(editandoId ? "Zona atualizada!" : "Zona adicionada!");
    } catch (e) {
      mostrarToast(e.response?.data?.error || "Erro ao salvar a zona.", "erro");
    } finally {
      setSalvando(false);
    }
  };

  const editarZona = (z) => {
    setEditandoId(z.id_zona);
    setRascunho({
      ponto: [Number(z.latitude), Number(z.longitude)],
      raio: z.raio_metros, valor: String(z.valor), nome: z.nome_zona || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const removerZona = async (z) => {
    if (!window.confirm(`Excluir a zona "${z.nome_zona || "#" + z.id_zona}"?`)) return;
    try {
      await excluirZona(z.id_zona);
      if (editandoId === z.id_zona) limparRascunho();
      await carregar();
      mostrarToast("Zona removida.");
    } catch (e) {
      mostrarToast(e.response?.data?.error || "Erro ao excluir.", "erro");
    }
  };

  /* ---------- salvar configuração geral ---------- */
  const salvarConfig = async () => {
    if (cfg.usa_zonas) {
      if (zonas.length === 0) return mostrarToast("Adicione ao menos uma zona ou desligue o modo por zonas.", "erro");
      const fb = toNum(cfg.fallback_valor);
      if (fb === null || fb <= 0) return mostrarToast("Informe o valor de contingência (fora das zonas).", "erro");
      if (cfg.fallback_modo === "FIXO" && fb < MIN_VALOR) return mostrarToast(`Contingência fixa mínima: ${brl(MIN_VALOR)}.`, "erro");
    } else if (cfg.modo_cobranca === "KM") {
      if (!(toNum(cfg.valor_km) > 0)) return mostrarToast("Informe o valor por km (ex: 1,50).", "erro");
    } else if (!(toNum(cfg.valor_fixo) >= MIN_VALOR)) {
      return mostrarToast(`Valor fixo mínimo: ${brl(MIN_VALOR)}.`, "erro");
    }

    try {
      setSalvando(true);
      await salvarConfigMotoboy({
        modo_cobranca: cfg.modo_cobranca,
        valor_km: toNum(cfg.valor_km),
        valor_fixo: toNum(cfg.valor_fixo),
        usa_zonas: cfg.usa_zonas,
        fallback_modo: cfg.fallback_modo,
        fallback_valor: toNum(cfg.fallback_valor),
      });
      mostrarToast("Configurações salvas com sucesso! ✅");
    } catch (e) {
      mostrarToast(e.response?.data?.error || "Erro ao salvar.", "erro");
    } finally {
      setSalvando(false);
    }
  };

  if (carregando) return <div className="cfg-page"><p className="cfg-loading">Carregando…</p></div>;
  if (!loja) return <div className="cfg-page"><p className="cfg-loading">Sem dados do estabelecimento.</p></div>;

  return (
    <div className="cfg-page">
      <header className="cfg-header">
        <h1>🛵 Minhas taxas de entrega</h1>
        <p>Defina como você cobra o frete. Essas regras aparecem para o cliente no cardápio digital.</p>
        <button type="button" className="cfg-link" onClick={() => setDicasAbertas((v) => !v)}>
          {dicasAbertas ? "Esconder dicas" : "💡 Ver dicas de uso"}
        </button>
        {dicasAbertas && (
          <ul className="cfg-dicas">
            <li>Toque no mapa para marcar o centro do bairro; use o controle de raio para cobrir a região.</li>
            <li>Use dois dedos para dar zoom e um dedo para arrastar o mapa.</li>
            <li>Zonas menores dentro de zonas maiores têm prioridade (ex: "Centro" dentro de "Cidade").</li>
            <li>Use "Testar endereço" para conferir quanto você ganharia antes de salvar.</li>
            <li>Lembre de tocar em <b>Salvar configurações</b> no final da página.</li>
          </ul>
        )}
      </header>

      {loja.semCoordenada && (
        <div className="cfg-alerta aviso">
          ⚠️ O endereço da lanchonete ainda não tem latitude/longitude cadastradas. O mapa está centralizado numa
          posição padrão e o cálculo por km ficará impreciso. Peça ao responsável para completar o cadastro.
        </div>
      )}

      {/* ---------- MODO BASE ---------- */}
      {!cfg.usa_zonas && (
        <section className="cfg-card">
          <h2>Como você cobra?</h2>

          <label className={`cfg-opcao ${cfg.modo_cobranca === "KM" ? "ativa" : ""}`}>
            <input type="radio" name="modo" checked={cfg.modo_cobranca === "KM"} onChange={() => setCampo("modo_cobranca", "KM")} />
            <div>
              <strong>Por quilômetro</strong>
              <small>Valor × distância entre a lanchonete e o cliente.</small>
              {cfg.modo_cobranca === "KM" && (
                <div className="cfg-input-moeda">
                  <span>R$</span>
                  <input inputMode="decimal" placeholder="1,50" value={cfg.valor_km}
                    onChange={(e) => setCampo("valor_km", e.target.value)} />
                  <span>/km</span>
                </div>
              )}
            </div>
          </label>

          <label className={`cfg-opcao ${cfg.modo_cobranca === "FIXO" ? "ativa" : ""}`}>
            <input type="radio" name="modo" checked={cfg.modo_cobranca === "FIXO"} onChange={() => setCampo("modo_cobranca", "FIXO")} />
            <div>
              <strong>Valor fixo</strong>
              <small>Mesma taxa para qualquer entrega.</small>
              {cfg.modo_cobranca === "FIXO" && (
                <div className="cfg-input-moeda">
                  <span>R$</span>
                  <input inputMode="decimal" placeholder="8,00" value={cfg.valor_fixo}
                    onChange={(e) => setCampo("valor_fixo", e.target.value)} />
                </div>
              )}
            </div>
          </label>
        </section>
      )}

      {/* ---------- SWITCH ZONAS ---------- */}
      <section className="cfg-card">
        <div className="cfg-switch-linha">
          <div>
            <h2>Cobrar por zonas no mapa</h2>
            <small>Desenhe bairros/regiões e defina um valor para cada uma.</small>
          </div>
          <label className="cfg-switch">
            <input type="checkbox" checked={cfg.usa_zonas} onChange={(e) => setCampo("usa_zonas", e.target.checked)} />
            <span className="slider" />
          </label>
        </div>
      </section>

      {/* ---------- MAPA (sempre visível quando zonas ativas ou em modo teste) ---------- */}
      {(cfg.usa_zonas || modoTeste) && (
        <section className="cfg-card">
          <div className="cfg-mapa-topo">
            <h2>{modoTeste ? "Toque no mapa para testar" : "Toque no mapa para marcar a zona"}</h2>
            <button type="button" className={`cfg-btn-peq ${modoTeste ? "ativo" : ""}`}
              onClick={() => { setModoTeste((v) => !v); setPontoTeste(null); }}>
              {modoTeste ? "Voltar a editar zonas" : "🧪 Testar endereço"}
            </button>
          </div>

          <div className="cfg-mapa">
            <MapContainer center={loja.centro} zoom={13} scrollWheelZoom style={{ height: "100%", width: "100%" }}>
              <TileLayer attribution="&copy; OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Recentralizar centro={loja.centro} />
              <MapClicks onClick={aoClicarMapa} />

              <Marker position={loja.centro} icon={iconeLoja}>
                <Tooltip direction="top" offset={[0, -34]}>{loja.nome}</Tooltip>
              </Marker>

              {cfg.usa_zonas && zonas.map((z, i) => (
                <Circle key={z.id_zona}
                  center={[Number(z.latitude), Number(z.longitude)]} radius={z.raio_metros}
                  pathOptions={{ color: CORES[i % CORES.length], fillColor: CORES[i % CORES.length], fillOpacity: z.id_zona === editandoId ? 0.08 : 0.22, weight: 2 }}>
                  <Tooltip sticky>{(z.nome_zona || `Zona #${z.id_zona}`)} · {brl(z.valor)}</Tooltip>
                </Circle>
              ))}

              {cfg.usa_zonas && !modoTeste && rascunho.ponto && (
                <Circle center={rascunho.ponto} radius={rascunho.raio}
                  pathOptions={{ color: sobreposicoes.length ? "#d00000" : "#111", dashArray: "6 6", fillOpacity: 0.12, weight: 2 }} />
              )}

              {pontoTeste && <Marker position={pontoTeste} icon={iconeTeste} />}
            </MapContainer>
          </div>

          {/* resultado do simulador */}
          {modoTeste && (
            <div className="cfg-teste">
              {resultadoTeste ? (
                <>
                  <div className="valor">{brl(resultadoTeste.valor)}</div>
                  <div>{resultadoTeste.origem} · {resultadoTeste.distKm.toFixed(1).replace(".", ",")} km da lanchonete</div>
                </>
              ) : <div>Toque em um ponto do mapa para ver quanto você ganharia.</div>}
            </div>
          )}

          {/* formulário de zona */}
          {cfg.usa_zonas && !modoTeste && (
            <div className="cfg-form-zona">
              <label>
                Raio: <b>{rascunho.raio >= 1000 ? (rascunho.raio / 1000).toFixed(1).replace(".", ",") + " km" : rascunho.raio + " m"}</b>
                <input type="range" min={RAIO_MIN} max={RAIO_MAX} step={100} value={rascunho.raio}
                  onChange={(e) => setRascunho((r) => ({ ...r, raio: Number(e.target.value) }))} />
              </label>

              <div className="cfg-linha">
                <label>
                  Nome da zona (opcional)
                  <input type="text" maxLength={60} placeholder="Centro, Bairro Alto…" value={rascunho.nome}
                    onChange={(e) => setRascunho((r) => ({ ...r, nome: e.target.value }))} />
                </label>
                <label>
                  Valor do frete
                  <div className="cfg-input-moeda">
                    <span>R$</span>
                    <input inputMode="decimal" placeholder="8,00" value={rascunho.valor}
                      onChange={(e) => setRascunho((r) => ({ ...r, valor: e.target.value }))} />
                  </div>
                </label>
              </div>

              {!rascunho.ponto && <div className="cfg-alerta dica">👆 Toque no mapa para escolher o centro da zona.</div>}
              {sobreposicoes.length > 0 && (
                <div className="cfg-alerta aviso">
                  ⚠️ Esta zona se sobrepõe a: <b>{sobreposicoes.join(", ")}</b>. Nas áreas em comum vale a zona de
                  <b> menor raio</b>. Se não era isso que queria, ajuste o raio ou o centro.
                </div>
              )}

              <div className="cfg-linha botoes">
                <button type="button" className="cfg-btn primario" disabled={salvando} onClick={salvarZona}>
                  {editandoId ? "Salvar alterações da zona" : "➕ Adicionar rota"}
                </button>
                {(editandoId || rascunho.ponto) && (
                  <button type="button" className="cfg-btn" onClick={limparRascunho}>Cancelar</button>
                )}
              </div>
            </div>
          )}
        </section>
      )}

      {/* ---------- LISTA DE ZONAS ---------- */}
      {cfg.usa_zonas && (
        <section className="cfg-card">
          <h2>Minhas zonas ({zonas.length})</h2>
          {zonas.length === 0 && <p className="cfg-vazio">Nenhuma zona ainda. Toque no mapa para criar a primeira.</p>}
          <ul className="cfg-lista">
            {zonas.map((z, i) => (
              <li key={z.id_zona}>
                <span className="cor" style={{ background: CORES[i % CORES.length] }} />
                <div className="info">
                  <strong>{z.nome_zona || `Zona #${z.id_zona}`}</strong>
                  <small>{brl(z.valor)} · raio {z.raio_metros >= 1000 ? (z.raio_metros / 1000).toFixed(1).replace(".", ",") + " km" : z.raio_metros + " m"}</small>
                </div>
                <button type="button" className="cfg-btn-peq" onClick={() => editarZona(z)}>Editar</button>
                <button type="button" className="cfg-btn-peq perigo" onClick={() => removerZona(z)}>Excluir</button>
              </li>
            ))}
          </ul>

          {/* ---------- FALLBACK ---------- */}
          <div className="cfg-fallback">
            <h3>Fora das zonas desenhadas</h3>
            <small>Se o endereço do cliente não cair em nenhuma zona, cobrar:</small>

            <label className={`cfg-opcao ${cfg.fallback_modo === "FIXO" ? "ativa" : ""}`}>
              <input type="radio" name="fb" checked={cfg.fallback_modo === "FIXO"} onChange={() => setCampo("fallback_modo", "FIXO")} />
              <div><strong>Valor fixo</strong></div>
            </label>
            <label className={`cfg-opcao ${cfg.fallback_modo === "KM" ? "ativa" : ""}`}>
              <input type="radio" name="fb" checked={cfg.fallback_modo === "KM"} onChange={() => setCampo("fallback_modo", "KM")} />
              <div><strong>Por quilômetro</strong></div>
            </label>

            <div className="cfg-input-moeda">
              <span>R$</span>
              <input inputMode="decimal" placeholder={cfg.fallback_modo === "KM" ? "1,50" : "15,00"} value={cfg.fallback_valor}
                onChange={(e) => setCampo("fallback_valor", e.target.value)} />
              <span>{cfg.fallback_modo === "KM" ? "/km" : ""}</span>
            </div>
          </div>
        </section>
      )}

      {/* ---------- simulador também no modo sem zonas ---------- */}
      {!cfg.usa_zonas && !modoTeste && (
        <section className="cfg-card">
          <button type="button" className="cfg-btn" onClick={() => setModoTeste(true)}>🧪 Testar endereço no mapa</button>
        </section>
      )}

      {/* ---------- barra de salvar fixa ---------- */}
      <div className="cfg-barra-salvar">
        <button type="button" className="cfg-btn primario grande" disabled={salvando} onClick={salvarConfig}>
          {salvando ? "Salvando…" : "💾 Salvar configurações"}
        </button>
      </div>

      {toast && <div className={`cfg-toast ${toast.tipo}`}>{toast.msg}</div>}
    </div>
  );
}