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
// Default-nøkkel for localStorage (vi forsøker å gjenbruke eksisterende nøkkel hvis vi finner en)
const DEFAULT_FAVORITES_KEY = "mcl-formula-favorites";

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

  // Last inn favoritter fra localStorage (prøver å gjenbruke eksisterende nøkkel om mulig)
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      // Let etter en eventuell eksisterende nøkkel som inneholder "favorite"
      const keys = Object.keys(window.localStorage);
      const candidateKey =
        keys.find((k) => k.toLowerCase().includes("favorite")) ??
        DEFAULT_FAVORITES_KEY;

      setFavoritesStorageKey(candidateKey);

      const raw = window.localStorage.getItem(candidateKey);
      if (!raw) return;

      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setFavorites(parsed as FormulaId[]);
      }
    } catch {
      // Ignorer parsing-feil – vi starter bare uten favoritter
    }
  }, []);

  // Lagre favoritter når de endres
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(
        favoritesStorageKey,
        JSON.stringify(favorites)
      );
    } catch {
      // Ignorer lagringsfeil (f.eks. quota)
    }
  }, [favorites, favoritesStorageKey]);

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
                        <li key={item.id} className="sidebar-item">
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
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              width: "100%"
                            }}
                          >
                            <span className="sidebar-item-label">
                              {isActive ? "• " : ""}
                              {item.label}
                            </span>

                            {/* Favoritt-stjerne */}
                            <span
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                toggleFavorite(item.id);
                              }}
                              aria-label={
                                isFav
                                  ? "Fjern fra favoritter"
                                  : "Legg til i favoritter"
                              }
                              style={{
                                marginLeft: "0.5rem",
                                fontSize: "0.9rem",
                                cursor: "pointer",
                                lineHeight: 1,
                                // Gul når aktiv, ellers dempet
                                color: isFav
                                  ? "#f4b400"
                                  : "var(--mcl-muted, #999)"
                              }}
                            >
                              ★
                            </span>
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
