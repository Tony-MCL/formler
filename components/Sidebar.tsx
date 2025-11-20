"use client";

import React, { useEffect, useMemo, useState } from "react";
import { getFormulasGroupedByCategory } from "../lib/formulas";
import type { FormulaId } from "../lib/types";

const FAVORITES_STORAGE_KEY = "mcl_formula_favorites_v1";

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

export default function Sidebar({
  open,
  onClose,
  selectedFormulaId,
  onSelectFormula
}: SidebarProps) {
  const [isMobile, setIsMobile] = useState(false);

  // Favoritter (lagres i localStorage)
  const [favorites, setFavorites] = useState<FormulaId[]>([]);

  // Hvilke grupper er åpne (kollapsbare seksjoner)
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    getFormulasGroupedByCategory().forEach(({ category }) => {
      initial[category.id] = true; // alle åpne som start
    });
    return initial;
  });

  // Les favoritter fra localStorage ved første render på klient
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setFavorites(parsed as FormulaId[]);
      }
    } catch {
      // Ignorer feil – vi vil ikke krasje sidebar pga localStorage
    }
  }, []);

  // Skriv favoritter til localStorage når de endres
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(
        FAVORITES_STORAGE_KEY,
        JSON.stringify(favorites)
      );
    } catch {
      // Ignorer lagringsfeil stille
    }
  }, [favorites]);

  // Track mobil/desktop
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

  // På desktop: ikke vis sidebar i det hele tatt når den er lukket
  if (!open && !isMobile) {
    return null;
  }

  const stopClick: React.MouseEventHandler = (e) => e.stopPropagation();

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

  const favoriteSet = useMemo(() => new Set(favorites), [favorites]);

  // Flater ut alle items for å kunne bygge en "Favoritter"-gruppe
  const allItems: SidebarItemView[] = useMemo(
    () => baseGroups.flatMap((g) => g.items),
    [baseGroups]
  );

  const favoriteItems: SidebarItemView[] = useMemo(
    () => allItems.filter((item) => favoriteSet.has(item.id)),
    [allItems, favoriteSet]
  );

  // Bygg endelig liste av grupper inkludert "Favoritter" øverst
  const groups: SidebarGroupView[] = useMemo(() => {
    if (favoriteItems.length === 0) return baseGroups;

    return [
      {
        id: "favorites",
        title: "Favoritter",
        description: undefined,
        items: favoriteItems
      },
      ...baseGroups
    ];
  }, [baseGroups, favoriteItems]);

  const toggleGroup = (groupId: string) => {
    setOpenGroups((prev) => {
      const current = prev[groupId];
      // Hvis vi ikke har eksplisitt verdi ennå, tolkes den som "åpen".
      // Første klikk skal da lukke (false).
      const next = current === undefined ? false : !current;
      return {
        ...prev,
        [groupId]: next
      };
    });
  };

  const toggleFavorite = (id: FormulaId) => {
    setFavorites((prev) => {
      if (prev.includes(id)) {
        return prev.filter((x) => x !== id);
      }
      return [...prev, id];
    });
  };

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
            const stored = openGroups[group.id];
            const isOpen = stored === undefined ? true : stored;

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
                {isOpen && group.description && group.id !== "favorites" && (
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
                      const isFavorite = favoriteSet.has(item.id);

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
                          >
                            <span className="sidebar-item-label">
                              {isActive ? "• " : ""}
                              {item.label}
                            </span>
                          </button>
                          <button
                            type="button"
                            className="sidebar-favorite-button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(item.id);
                            }}
                            aria-pressed={isFavorite}
                            aria-label={
                              isFavorite
                                ? "Fjern fra favoritter"
                                : "Legg til i favoritter"
                            }
                            style={{
                              marginLeft: "0.25rem",
                              padding: "0 0.25rem",
                              border: "none",
                              background: "transparent",
                              cursor: "pointer",
                              fontSize: "0.9rem",
                              lineHeight: 1
                            }}
                          >
                            {isFavorite ? "★" : "☆"}
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
