"use client";

import React from "react";

type SidebarProps = {
  open: boolean;
  onClose: () => void;
};

type SidebarGroup = {
  id: string;
  title: string;
  items: { id: string; label: string; hint?: string }[];
};

const GROUPS: SidebarGroup[] = [
  {
    id: "core",
    title: "Grunnleggende elkraft",
    items: [
      { id: "ohm", label: "Ohms lov", hint: "U, I, R" },
      { id: "power", label: "Effekt", hint: "P, U, I, cos φ" },
      { id: "energy", label: "Energi", hint: "E, P, t" }
    ]
  },
  {
    id: "systems",
    title: "Systemer og nett",
    items: [
      { id: "it-tn", label: "Nett-typer (IT/TN)", hint: "230 V / 400 V" },
      { id: "short-circuit", label: "Kortslutningsnivå", hint: "Ik, Zk" }
    ]
  },
  {
    id: "machines",
    title: "Motorer og generatorer",
    items: [
      { id: "synchronous", label: "Synkronmaskin", hint: "ns, p, f" },
      { id: "induction", label: "Asynkronmotor", hint: "s, M, η" }
    ]
  }
];

export default function Sidebar({ open, onClose }: SidebarProps) {
  const stopClick: React.MouseEventHandler = (e) => e.stopPropagation();

  return (
    <>
      {/* Bakgrunn for mobil når menyen er åpen */}
      {open && (
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
          <button
            className="button sidebar-close"
            onClick={onClose}
            aria-label="Lukk meny"
          >
            ✕
          </button>
        </div>

        <nav className="sidebar-nav">
          {GROUPS.map((group) => (
            <div key={group.id} className="sidebar-section">
              <div className="sidebar-section-title">{group.title}</div>
              <ul className="sidebar-list">
                {group.items.map((item) => (
                  <li key={item.id} className="sidebar-item">
                    <button
                      type="button"
                      className="sidebar-link"
                      // Fase 1: kun visuell. Senere kobles dette mot valgt formel.
                      onClick={() => {
                        // placeholder – kan senere trigge formelvisning
                        console.log("Select formula:", item.id);
                      }}
                    >
                      <span className="sidebar-item-label">{item.label}</span>
                      {item.hint && (
                        <span className="sidebar-item-hint">{item.hint}</span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
