import React, { useState, useEffect, useMemo } from "react";
import { Bus, MapPin, Search, ArrowRight, Check, X, Clock, Users, Ticket, ChevronLeft } from "lucide-react";

const VILLES = ["Brazzaville", "Pointe-Noire", "Dolisie", "Nkayi", "Ouesso"];

const AGENCES = {
  ocean: { nom: "Océan du Nord", couleur: "#1F3A2E" },
  nzoko: { nom: "Nzoko Voyages", couleur: "#8A3B2E" },
  bony: { nom: "Trans Bony Voyage", couleur: "#2E5C7A" },
  stelimac: { nom: "Stelimac", couleur: "#6B4A8A" },
  dgi: { nom: "DGI Transport", couleur: "#946B1F" },
  extra: { nom: "Extra Voyage", couleur: "#2E7A5C" },
  pendo: { nom: "Maman Pendo Transport", couleur: "#A03A5B" },
};

const TRAJETS = [
  { id: "t1", agence: "ocean", depart: "Brazzaville", arrivee: "Pointe-Noire", heure: "06:00", duree: "9h", prix: 15000, places: 14 },
  { id: "t2", agence: "nzoko", depart: "Brazzaville", arrivee: "Pointe-Noire", heure: "07:30", duree: "9h30", prix: 14000, places: 6 },
  { id: "t3", agence: "ocean", depart: "Brazzaville", arrivee: "Pointe-Noire", heure: "14:00", duree: "9h", prix: 15000, places: 22 },
  { id: "t4", agence: "nzoko", depart: "Brazzaville", arrivee: "Dolisie", heure: "06:30", duree: "6h", prix: 10000, places: 18 },
  { id: "t5", agence: "ocean", depart: "Pointe-Noire", arrivee: "Brazzaville", heure: "06:00", duree: "9h", prix: 15000, places: 9 },
  { id: "t6", agence: "nzoko", depart: "Brazzaville", arrivee: "Nkayi", heure: "08:00", duree: "5h", prix: 8000, places: 20 },
  { id: "t7", agence: "ocean", depart: "Brazzaville", arrivee: "Ouesso", heure: "05:00", duree: "14h", prix: 22000, places: 11 },
  { id: "t8", agence: "bony", depart: "Brazzaville", arrivee: "Pointe-Noire", heure: "05:30", duree: "9h", prix: 14500, places: 17 },
  { id: "t9", agence: "bony", depart: "Brazzaville", arrivee: "Dolisie", heure: "07:00", duree: "6h", prix: 9500, places: 12 },
  { id: "t10", agence: "stelimac", depart: "Brazzaville", arrivee: "Pointe-Noire", heure: "09:00", duree: "9h30", prix: 14000, places: 5 },
  { id: "t11", agence: "stelimac", depart: "Pointe-Noire", arrivee: "Brazzaville", heure: "08:00", duree: "9h", prix: 15000, places: 13 },
  { id: "t12", agence: "dgi", depart: "Brazzaville", arrivee: "Nkayi", heure: "06:00", duree: "5h", prix: 7500, places: 19 },
  { id: "t13", agence: "dgi", depart: "Brazzaville", arrivee: "Dolisie", heure: "13:00", duree: "6h", prix: 9500, places: 16 },
  { id: "t14", agence: "extra", depart: "Brazzaville", arrivee: "Pointe-Noire", heure: "11:00", duree: "9h", prix: 15500, places: 8 },
  { id: "t15", agence: "extra", depart: "Brazzaville", arrivee: "Ouesso", heure: "05:30", duree: "14h", prix: 21000, places: 14 },
  { id: "t16", agence: "pendo", depart: "Brazzaville", arrivee: "Dolisie", heure: "08:30", duree: "6h", prix: 10000, places: 21 },
  { id: "t17", agence: "pendo", depart: "Pointe-Noire", arrivee: "Brazzaville", heure: "13:00", duree: "9h30", prix: 14500, places: 10 },
];

const STORAGE_KEY = "reservations:list";
const SEAT_ROWS = 8;

function fmtPrix(n) {
  return n.toLocaleString("fr-FR") + " FCFA";
}

function seatId(i) {
  return `S${i + 1}`;
}

export default function SiteReservation() {
  const [depart, setDepart] = useState("Brazzaville");
  const [arrivee, setArrivee] = useState("Pointe-Noire");
  const [selected, setSelected] = useState(null);
  const [seats, setSeats] = useState([]);
  const [nom, setNom] = useState("");
  const [tel, setTel] = useState("");
  const [step, setStep] = useState("recherche");
  const [reservations, setReservations] = useState(null);
  const [showMine, setShowMine] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await window.storage.get(STORAGE_KEY, false);
        setReservations(res ? JSON.parse(res.value) : []);
      } catch {
        setReservations([]);
      }
    })();
  }, []);

  const resultats = useMemo(
    () => TRAJETS.filter((t) => t.depart === depart && t.arrivee === arrivee),
    [depart, arrivee]
  );

  function ouvrirReservation(trajet) {
    setSelected(trajet);
    setSeats([]);
    setStep("sieges");
  }

  function toggleSeat(id) {
    setSeats((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : prev.length < 4 ? [...prev, id] : prev));
  }

  async function confirmer() {
    const nouvelle = {
      id: Math.random().toString(36).slice(2, 9),
      trajetId: selected.id,
      agence: AGENCES[selected.agence].nom,
      depart: selected.depart,
      arrivee: selected.arrivee,
      heure: selected.heure,
      places: seats,
      nom,
      tel,
      prixTotal: selected.prix * seats.length,
      date: Date.now(),
    };
    const next = [nouvelle, ...(reservations || [])];
    setReservations(next);
    try {
      await window.storage.set(STORAGE_KEY, JSON.stringify(next), false);
    } catch {}
    setStep("confirme");
  }

  function reinitialiser() {
    setSelected(null);
    setSeats([]);
    setNom("");
    setTel("");
    setStep("recherche");
  }

  if (reservations === null) return null;

  return (
    <div style={s.page}>
      <div style={s.roadLine} aria-hidden="true" />
      <header style={s.header}>
        <div style={s.headerInner}>
          <div style={s.brand}>
            <div style={s.brandIcon}>
              <Bus size={18} color="#F7F3E8" />
            </div>
            <span style={s.brandText}>Voyage Congo</span>
          </div>
          <button style={s.mesResaBtn} onClick={() => setShowMine(true)}>
            <Ticket size={15} />
            Mes billets{reservations.length > 0 ? ` (${reservations.length})` : ""}
          </button>
        </div>
      </header>

      {step === "recherche" && (
        <>
          <section style={s.hero}>
            <div style={s.eyebrow}>Réservation de bus — Congo-Brazzaville</div>
            <h1 style={s.h1}>
              Un billet de bus,
              <br />
              réservé en 2 minutes.
            </h1>
            <p style={s.heroSub}>
              Océan du Nord, Nzoko Voyages et d'autres agences, toutes vos routes en un seul endroit.
            </p>

            <div style={s.searchBox}>
              <div style={s.searchField}>
                <MapPin size={16} color="#8A3B2E" />
                <select style={s.select} value={depart} onChange={(e) => setDepart(e.target.value)}>
                  {VILLES.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
              <ArrowRight size={18} color="#B7AE9E" style={{ flexShrink: 0 }} />
              <div style={s.searchField}>
                <MapPin size={16} color="#1F3A2E" />
                <select style={s.select} value={arrivee} onChange={(e) => setArrivee(e.target.value)}>
                  {VILLES.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
              <button style={s.searchBtn} onClick={() => {}}>
                <Search size={16} />
                Chercher
              </button>
            </div>
          </section>

          <section style={s.results}>
            {depart === arrivee ? (
              <div style={s.emptyState}>Choisis deux villes différentes pour voir les trajets.</div>
            ) : resultats.length === 0 ? (
              <div style={s.emptyState}>Aucun trajet {depart} → {arrivee} pour le moment.</div>
            ) : (
              resultats.map((t) => {
                const ag = AGENCES[t.agence];
                return (
                  <div key={t.id} style={s.card}>
                    <div style={{ ...s.agenceTag, background: ag.couleur }}>{ag.nom}</div>
                    <div style={s.cardRow}>
                      <div style={s.routeLine}>
                        <span>{t.depart}</span>
                        <span style={s.routeDash}>
                          <span style={s.routeDot} />
                          <span style={s.routeDashLine} />
                          <span style={s.routeDot} />
                        </span>
                        <span>{t.arrivee}</span>
                      </div>
                      <div style={s.meta}>
                        <span style={s.metaItem}>
                          <Clock size={13} /> {t.heure} · {t.duree}
                        </span>
                        <span style={s.metaItem}>
                          <Users size={13} /> {t.places} places
                        </span>
                      </div>
                    </div>
                    <div style={s.cardFooter}>
                      <span style={s.prix}>{fmtPrix(t.prix)}</span>
                      <button style={s.reserverBtn} onClick={() => ouvrirReservation(t)}>
                        Réserver
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </section>
        </>
      )}

      {step === "sieges" && selected && (
        <section style={s.panel}>
          <button style={s.backBtn} onClick={reinitialiser}>
            <ChevronLeft size={16} /> Retour aux trajets
          </button>
          <h2 style={s.panelTitle}>
            {selected.depart} → {selected.arrivee}
          </h2>
          <p style={s.panelSub}>
            {AGENCES[selected.agence].nom} · départ {selected.heure} · choisis jusqu'à 4 sièges
          </p>
          <div style={s.seatGrid}>
            {Array.from({ length: SEAT_ROWS }).map((_, row) => (
              <div key={row} style={s.seatRow}>
                {[0, 1].map((c) => {
                  const idx = row * 4 + c;
                  const id = seatId(idx);
                  const taken = idx >= selected.places;
                  const isSel = seats.includes(id);
                  return (
                    <button
                      key={id}
                      disabled={taken}
                      onClick={() => toggleSeat(id)}
                      style={{
                        ...s.seat,
                        background: taken ? "#E4DCC9" : isSel ? "#1F3A2E" : "#FFFDF9",
                        color: isSel ? "#F7F3E8" : "#332D22",
                        cursor: taken ? "not-allowed" : "pointer",
                      }}
                    >
                      {id}
                    </button>
                  );
                })}
                <div style={s.aisle} />
                {[2, 3].map((c) => {
                  const idx = row * 4 + c;
                  const id = seatId(idx);
                  const taken = idx >= selected.places;
                  const isSel = seats.includes(id);
                  return (
                    <button
                      key={id}
                      disabled={taken}
                      onClick={() => toggleSeat(id)}
                      style={{
                        ...s.seat,
                        background: taken ? "#E4DCC9" : isSel ? "#1F3A2E" : "#FFFDF9",
                        color: isSel ? "#F7F3E8" : "#332D22",
                        cursor: taken ? "not-allowed" : "pointer",
                      }}
                    >
                      {id}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
          <div style={s.panelFooter}>
            <span style={s.totalText}>
              {seats.length} siège{seats.length !== 1 ? "s" : ""} · {fmtPrix(selected.prix * seats.length)}
            </span>
            <button style={s.nextBtn} disabled={seats.length === 0} onClick={() => setStep("infos")}>
              Continuer
            </button>
          </div>
        </section>
      )}

      {step === "infos" && selected && (
        <section style={s.panel}>
          <button style={s.backBtn} onClick={() => setStep("sieges")}>
            <ChevronLeft size={16} /> Retour aux sièges
          </button>
          <h2 style={s.panelTitle}>Tes informations</h2>
          <p style={s.panelSub}>Pour recevoir la confirmation de ton billet.</p>
          <div style={s.form}>
            <label style={s.label}>Nom complet</label>
            <input style={s.input} value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Ex. Jean Mabiala" />
            <label style={s.label}>Numéro de téléphone</label>
            <input style={s.input} value={tel} onChange={(e) => setTel(e.target.value)} placeholder="Ex. 06 xxx xx xx" />
          </div>
          <div style={s.panelFooter}>
            <span style={s.totalText}>{fmtPrix(selected.prix * seats.length)}</span>
            <button style={s.nextBtn} disabled={!nom.trim() || !tel.trim()} onClick={confirmer}>
              Confirmer la réservation
            </button>
          </div>
        </section>
      )}

      {step === "confirme" && selected && (
        <section style={s.panel}>
          <div style={s.confirmIcon}>
            <Check size={26} color="#F7F3E8" />
          </div>
          <h2 style={{ ...s.panelTitle, textAlign: "center" }}>Réservation confirmée</h2>
          <p style={{ ...s.panelSub, textAlign: "center" }}>
            {seats.length} place{seats.length !== 1 ? "s" : ""} pour {selected.depart} → {selected.arrivee}, avec{" "}
            {AGENCES[selected.agence].nom}.
          </p>
          <button style={s.nextBtn} onClick={reinitialiser}>
            Réserver un autre trajet
          </button>
        </section>
      )}

      {showMine && (
        <div style={s.overlay} onClick={() => setShowMine(false)}>
          <div style={s.modal} onClick={(e) => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <h3 style={s.panelTitle}>Mes billets</h3>
              <button style={s.closeBtn} onClick={() => setShowMine(false)}>
                <X size={18} />
              </button>
            </div>
            {reservations.length === 0 ? (
              <div style={s.emptyState}>Aucune réservation pour l'instant.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {reservations.map((r) => (
                  <div key={r.id} style={s.ticketCard}>
                    <div style={s.cardRow}>
                      <strong>{r.depart} → {r.arrivee}</strong>
                      <span>{fmtPrix(r.prixTotal)}</span>
                    </div>
                    <div style={s.metaItem}>
                      {r.agence} · {r.heure} · sièges {r.places.join(", ")}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const s = {
  page: {
    minHeight: "100vh",
    background: "#F7F3E8",
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    color: "#332D22",
    paddingBottom: 40,
  },
  roadLine: {
    height: 5,
    background: "repeating-linear-gradient(90deg, #E0A458 0 24px, transparent 24px 40px)",
    backgroundColor: "#8A3B2E",
  },
  header: { padding: "16px 20px", borderBottom: "1px solid #E4DCC9" },
  headerInner: { display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: 640, margin: "0 auto" },
  brand: { display: "flex", alignItems: "center", gap: 8 },
  brandIcon: { width: 30, height: 30, borderRadius: 8, background: "#1F3A2E", display: "flex", alignItems: "center", justifyContent: "center" },
  brandText: { fontWeight: 700, fontSize: 16, letterSpacing: "-0.01em" },
  mesResaBtn: { display: "flex", alignItems: "center", gap: 6, background: "transparent", border: "1.5px solid #1F3A2E", color: "#1F3A2E", borderRadius: 999, padding: "7px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer" },
  hero: { maxWidth: 640, margin: "0 auto", padding: "36px 20px 16px", textAlign: "center" },
  eyebrow: { fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "#8A3B2E", fontWeight: 700, marginBottom: 10 },
  h1: { fontSize: 32, lineHeight: 1.15, margin: "0 0 12px", fontWeight: 800, letterSpacing: "-0.01em" },
  heroSub: { color: "#71695A", fontSize: 15, margin: "0 0 24px" },
  searchBox: { display: "flex", alignItems: "center", gap: 8, background: "#FFFDF9", border: "1.5px solid #E4DCC9", borderRadius: 14, padding: 10, flexWrap: "wrap", boxShadow: "0 8px 20px rgba(60,50,30,0.08)" },
  searchField: { display: "flex", alignItems: "center", gap: 6, background: "#F7F3E8", borderRadius: 9, padding: "8px 10px", flex: 1, minWidth: 130 },
  select: { border: "none", background: "transparent", fontSize: 14, fontWeight: 600, color: "#332D22", outline: "none", width: "100%" },
  searchBtn: { display: "flex", alignItems: "center", gap: 6, background: "#1F3A2E", color: "#F7F3E8", border: "none", borderRadius: 9, padding: "10px 16px", fontSize: 14, fontWeight: 700, cursor: "pointer", flexShrink: 0 },
  results: { maxWidth: 640, margin: "0 auto", padding: "20px 20px 0", display: "flex", flexDirection: "column", gap: 12 },
  emptyState: { textAlign: "center", color: "#B7AE9E", fontSize: 14, padding: "30px 0" },
  card: { background: "#FFFDF9", border: "1px solid #E4DCC9", borderRadius: 14, padding: 16, position: "relative" },
  agenceTag: { display: "inline-block", color: "#F7F3E8", fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 999, marginBottom: 10 },
  cardRow: { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 },
  routeLine: { display: "flex", alignItems: "center", gap: 6, fontWeight: 700, fontSize: 15 },
  routeDash: { display: "flex", alignItems: "center", width: 44 },
  routeDot: { width: 5, height: 5, borderRadius: "50%", background: "#B7AE9E", flexShrink: 0 },
  routeDashLine: { flex: 1, height: 1.5, background: "#B7AE9E" },
  meta: { display: "flex", gap: 12, fontSize: 12.5, color: "#71695A" },
  metaItem: { display: "flex", alignItems: "center", gap: 4 },
  cardFooter: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14, paddingTop: 12, borderTop: "1px dashed #E4DCC9" },
  prix: { fontWeight: 800, fontSize: 17, color: "#8A3B2E" },
  reserverBtn: { background: "#332D22", color: "#F7F3E8", border: "none", borderRadius: 9, padding: "9px 18px", fontSize: 13.5, fontWeight: 700, cursor: "pointer" },
  panel: { maxWidth: 480, margin: "24px auto 0", padding: "0 20px" },
  backBtn: { display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", color: "#71695A", fontSize: 13, cursor: "pointer", marginBottom: 14, padding: 0 },
  panelTitle: { fontSize: 21, fontWeight: 800, margin: "0 0 4px" },
  panelSub: { color: "#71695A", fontSize: 13.5, margin: "0 0 20px" },
  seatGrid: { display: "flex", flexDirection: "column", gap: 8, background: "#FFFDF9", border: "1px solid #E4DCC9", borderRadius: 14, padding: 18 },
  seatRow: { display: "flex", alignItems: "center", gap: 8 },
  seat: { flex: 1, height: 40, borderRadius: 8, border: "1px solid #E4DCC9", fontSize: 12, fontWeight: 700 },
  aisle: { width: 18, flexShrink: 0 },
  panelFooter: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 18 },
  totalText: { fontWeight: 800, fontSize: 16 },
  nextBtn: { background: "#1F3A2E", color: "#F7F3E8", border: "none", borderRadius: 9, padding: "11px 20px", fontSize: 14, fontWeight: 700, cursor: "pointer" },
  form: { display: "flex", flexDirection: "column", gap: 6, background: "#FFFDF9", border: "1px solid #E4DCC9", borderRadius: 14, padding: 18 },
  label: { fontSize: 12.5, fontWeight: 700, color: "#71695A", marginTop: 8 },
  input: { border: "1.5px solid #E4DCC9", borderRadius: 8, padding: "9px 11px", fontSize: 14, outline: "none", fontFamily: "inherit" },
  confirmIcon: { width: 54, height: 54, borderRadius: "50%", background: "#1F3A2E", display: "flex", alignItems: "center", justifyContent: "center", margin: "10px auto 16px" },
  overlay: { position: "fixed", inset: 0, background: "rgba(30,25,15,0.4)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 10 },
  modal: { background: "#F7F3E8", borderRadius: 16, padding: 20, maxWidth: 440, width: "100%", maxHeight: "80vh", overflowY: "auto" },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
  closeBtn: { background: "none", border: "none", cursor: "pointer", color: "#71695A" },
  ticketCard: { background: "#FFFDF9", border: "1px solid #E4DCC9", borderRadius: 12, padding: 12, fontSize: 13.5 },
};
