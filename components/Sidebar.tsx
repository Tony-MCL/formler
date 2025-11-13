"use client";

import React, { useEffect, useState } from "react";

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
  const [isMobile, setIsMobile] = useState(false);

  // Sjekk skjermbredde én gang og ved resize
  useEffect(() => {
    const check = () => {
      if (typeof window !== "undefined") {
        setIsMobile(window.innerWidth <= 768);
      }
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // På desktop: skjul sidebar helt når den er lukket
  if (!open && !isMobile) {
    return null;
  }

  const stopClick: React.MouseEventHandler = (e) => e.stopPropagation();

  return (
    <>
      {/* Backdrop kun på mobil når menyen er åpen */}
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
          {GROUPS.map((group) => (
            <div key={group.id} className="sidebar-section">
              <div className="sidebar-section-title">{group.title}</div>
              <ul className="sidebar-list">
                {group.items.map((item) => (
                  <li key={item.id} className="sidebar-item">
                    <button
                      type="button"
                      className="sidebar-link"
                      onClick={() => {
                        // Fase 1: bare visuell feedback
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
