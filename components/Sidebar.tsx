"use client";

import React, { useEffect, useState } from "react";
import { getFormulasGroupedByCategory } from "../lib/formulas";
import type { FormulaId } from "../lib/types";

type SidebarProps = {
  open: boolean;
  onClose: () => void;
  selectedFormulaId: FormulaId;
  onSelectFormula: (id: FormulaId) => void;
};

type SidebarItemView = {
  id: FormulaId;
  label: string;
};

type SidebarGroupView = {
  id: string;
  title: string;
  description?: string;
  items: SidebarItemView[];
};

// Intern id for favoritt-gruppen
const FAVORITES_GROUP_ID = "__favorites__";
// Samme nøkkel som FormelVisning bruker
const DEFAULT_FAVORITES_KEY = "mcl_formula_favorites_v1";
// Felles event-navn for sync med FormelVisning
const FAVORITES_EVENT_NAME = "mcl:favorites-updated";

function broadcastFavoritesUpdated() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(FAVORITES_EVENT_NAME));
}

export default function Sidebar({
  open,
  onClose,
  selectedFormulaId,
  onSelectFormula
}: SidebarProps) {
  // === Hooks ALLTID først ===

  const [isMobile, setIsMobile] = useState(false);

  // Nøkkel vi bruker mot localStorage – settes på første render / effekt
  const [favoritesStorageKey, setFavoritesStorageKey] = useState<string>(
    DEFAULT_FAVORITES_KEY
  );

  // Liste over favoritt-formler (id’er)
  const [favorites, setFavorites] = useState<FormulaId[]>([]);

  // Hvilke grupper er åpne (kollapsbare seksjoner)
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    getFormulasGroupedByCategory().forEach(({ category }) => {
      initial[category.id] = true; // alle åpne som start
    });
    // Favoritter-gruppen er også åpen når den finnes
    initial[FAVORITES_GROUP_ID] = true;
    return initial;
  });

  // Oppdater isMobile
  useEffect(() => {
    const update = () => {
      if (typeof window !== "undefined") {
        setIsMobile(window.innerWidth <= 768);
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Hjelper: les favoritter fra localStorage for gitt nøkkel
  const loadFavoritesFromStorage = (key: string): FormulaId[] => {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as FormulaId[]) : [];
    } catch {
      return [];
    }
  };

  // Første init: finn nøkkel og last favoritter
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      // Let etter en eventuell eksisterende nøkkel som inneholder "favorite"
      const keys = Object.keys(window.localStorage);
      const candidateKey =
        keys.find((k) => k.toLowerCase().includes("favorite")) ??
        DEFAULT_FAVORITES_KEY;

      setFavoritesStorageKey(candidateKey);

      const favs = loadFavoritesFromStorage(candidateKey);
      if (favs.length > 0) {
        setFavorites(favs);
      }
    } catch {
      // Ignorer feil – start uten favoritter
    }
  }, []);

  // Lagre favoritter når de endres + informer FormelVisning
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(
        favoritesStorageKey,
        JSON.stringify(favorites)
      );
      // Gi FormelVisning beskjed om at lista er endret
      broadcastFavoritesUpdated();
    } catch {
      // Ignorer lagringsfeil (f.eks. quota)
    }
  }, [favorites, favoritesStorageKey]);

  // 🔁 Hold Sidebar i sync når FormelVisning endrer favoritter
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleUpdate = () => {
      const favs = loadFavoritesFromStorage(favoritesStorageKey);
      setFavorites(favs);
    };

    window.addEventListener(FAVORITES_EVENT_NAME, handleUpdate);
    return () => {
      window.removeEventListener(FAVORITES_EVENT_NAME, handleUpdate);
    };
  }, [favoritesStorageKey]);

  // === Vanlig logikk (ingen hooks under her) ===

  const isVisible = open || isMobile;
  const stopClick: React.MouseEventHandler = (e) => e.stopPropagation();

  // Grunn-grupper fra formel-lista
  const baseGroups: SidebarGroupView[] = getFormulasGroupedByCategory().map(
    ({ category, formulas }) => ({
      id: category.id,
      title: category.title,
      description: category.description,
      items: formulas.map((formula) => ({
        id: formula.id,
        label: formula.name
      }))
    })
  );

  // Bygg favoritt-gruppe øverst
  const favoriteSet = new Set<FormulaId>(favorites);
  const favoriteItems: SidebarItemView[] = [];

  baseGroups.forEach((group) => {
    group.items.forEach((item) => {
      if (favoriteSet.has(item.id)) {
        favoriteItems.push(item);
      }
    });
  });

  const groups: SidebarGroupView[] = [];

  if (favoriteItems.length > 0) {
    groups.push({
      id: FAVORITES_GROUP_ID,
      title: "Favoritter",
      description: undefined,
      items: favoriteItems
    });
  }

  groups.push(...baseGroups);

  const toggleGroup = (groupId: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  const toggleFavorite = (id: FormulaId) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
    );
  };

  if (!isVisible) {
    // NB: ingen hooks under her – trygg tidlig return
    return null;
  }

  return (
    <>
      {/* Backdrop kun på mobil */}
      {open && isMobile && (
        <button
          className="sidebar-backdrop"
          aria-label="Lukk meny"
          onClick={onClose}
        />
      )}

      <aside
        className={`sidebar ${open ? "is-open" : ""}`}
        onClick={stopClick}
        aria-label="Formelkategorier"
      >
        <div className="sidebar-header">
          <div className="sidebar-title">Formler</div>
          {isMobile && (
            <button
              className="button sidebar-close"
              onClick={onClose}
              aria-label="Lukk meny"
            >
              ✕
            </button>
          )}
        </div>

        <nav className="sidebar-nav">
          {groups.map((group) => {
            const isOpen = openGroups[group.id] ?? true;

            return (
              <div key={group.id} className="sidebar-section">
                {/* Klikkbar seksjonstittel med pil */}
                <button
                  type="button"
                  onClick={() => toggleGroup(group.id)}
                  aria-expanded={isOpen}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                    padding: 0,
                    margin: 0,
                    background: "none",
                    border: "none",
                    cursor: "pointer"
                  }}
                >
                  <div className="sidebar-section-title">{group.title}</div>
                  <span
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--mcl-muted)"
                    }}
                  >
                    {isOpen ? "▾" : "▸"}
                  </span>
                </button>

                {/* Beskrivelse + liste kun når gruppen er åpen */}
                {isOpen && group.description && (
                  <p
                    style={{
                      margin: "0.1rem 0 0.3rem",
                      fontSize: "0.75rem",
                      color: "var(--mcl-muted)"
                    }}
                  >
                    {group.description}
                  </p>
                )}

                {isOpen && (
                  <ul className="sidebar-list">
                    {group.items.map((item) => {
                      const isActive = item.id === selectedFormulaId;
                      const isFav = favorites.includes(item.id);

                      return (
                        <li
                          key={item.id}
                          className="sidebar-item"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: "0.4rem"
                          }}
                        >
                          {/* Selve formel-linja */}
                          <button
                            type="button"
                            className="sidebar-link"
                            onClick={() => {
                              onSelectFormula(item.id);
                              if (isMobile) {
                                onClose();
                              }
                            }}
                            style={{
                              flex: 1,
                              textAlign: "left"
                            }}
                          >
                            <span className="sidebar-item-label">
                              {isActive ? "• " : ""}
                              {item.label}
                            </span>
                          </button>

                          {/* Favoritt-stjerne – egen knapp på samme linje */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(item.id);
                            }}
                            aria-label={
                              isFav
                                ? "Fjern fra favoritter"
                                : "Legg til i favoritter"
                            }
                            style={{
                              padding: 0,
                              border: "none",
                              background: "transparent",
                              cursor: "pointer",
                              fontSize: "0.9rem",
                              lineHeight: 1,
                              color: isFav
                                ? "#f4b400" // gul utfylt
                                : "var(--mcl-muted, #999)" // hul/grå
                            }}
                          >
                            {isFav ? "★" : "☆"}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
