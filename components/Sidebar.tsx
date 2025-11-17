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

export default function Sidebar({
  open,
  onClose,
  selectedFormulaId,
  onSelectFormula
}: SidebarProps) {
  const [isMobile, setIsMobile] = useState(false);

  // Hvilke grupper er åpne (kollapsbare seksjoner)
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    getFormulasGroupedByCategory().forEach(({ category }) => {
      initial[category.id] = true; // alle åpne som start
    });
    return initial;
  });

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

  const groups: SidebarGroupView[] = getFormulasGroupedByCategory().map(
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

  const toggleGroup = (groupId: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
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
