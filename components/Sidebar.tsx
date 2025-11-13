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
  hint?: string;
};

type SidebarGroupView = {
  id: string;
  title: string;
  items: SidebarItemView[];
};

export default function Sidebar({
  open,
  onClose,
  selectedFormulaId,
  onSelectFormula
}: SidebarProps) {
  const [isMobile, setIsMobile] = useState(false);

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
      items: formulas.map((formula) => ({
        id: formula.id,
        label: formula.name,
        hint: formula.tags && formula.tags.length > 0 ? formula.tags[0] : undefined
      }))
    })
  );

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
          <div className="sidebar-title">Kategorier</div>
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
          {groups.map((group) => (
            <div key={group.id} className="sidebar-section">
              <div className="sidebar-section-title">{group.title}</div>
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
                        {item.hint && (
                          <span className="sidebar-item-hint">{item.hint}</span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
