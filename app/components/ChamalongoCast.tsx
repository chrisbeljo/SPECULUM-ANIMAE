"use client";

import { useEffect, useState, type CSSProperties } from "react";
import type { ReactNode } from "react";
import "./chamalongo-cast.css";

type CastPhase = "ready" | "shaking" | "released";

type ChamalongoCastProps = {
  onCastComplete?: (faces: Array<"up" | "down">) => void;
  onCastStart?: () => void;
  readyLabel: string;
  shakingLabel: string;
  recastLabel: string;
  resultContent?: ReactNode;
};

const makeCast = (): Array<"up" | "down"> =>
  Array.from({ length: 4 }, () => (Math.random() >= 0.5 ? "up" : "down"));

type Landing = {
  left: number;
  top: number;
  turn: number;
  delay: number;
};

const defaultLandings: Landing[] = [
  { left: 42, top: 44, turn: -310, delay: 0.04 },
  { left: 57, top: 45, turn: 390, delay: 0.11 },
  { left: 44, top: 58, turn: -430, delay: 0.18 },
  { left: 58, top: 59, turn: 340, delay: 0.25 },
];

const makeLandings = (): Landing[] => {
  const rotation = Math.random() * Math.PI * 2;

  return Array.from({ length: 4 }, (_, index) => {
    const angle = rotation + index * (Math.PI / 2) + (Math.random() - 0.5) * 0.5;
    const radius = 11 + Math.random() * 8;

    return {
      left: 50 + Math.cos(angle) * radius,
      top: 50 + Math.sin(angle) * radius,
      turn: (Math.random() >= 0.5 ? 1 : -1) * (260 + Math.random() * 220),
      delay: 0.04 + index * 0.07,
    };
  });
};

export function ChamalongoCast({ onCastComplete, onCastStart, readyLabel, shakingLabel, recastLabel, resultContent }: ChamalongoCastProps) {
  const [phase, setPhase] = useState<CastPhase>("ready");
  const [faces, setFaces] = useState<Array<"up" | "down">>(() => makeCast());
  const [landings, setLandings] = useState<Landing[]>(defaultLandings);

  useEffect(() => {
    if (phase !== "shaking") return;

    const releaseTimer = window.setTimeout(() => setPhase("released"), 2550);
    return () => window.clearTimeout(releaseTimer);
  }, [phase]);

  useEffect(() => {
    if (phase !== "released") return;

    const completeTimer = window.setTimeout(() => onCastComplete?.(faces), 1550);
    return () => window.clearTimeout(completeTimer);
  }, [faces, onCastComplete, phase]);

  function cast() {
    if (phase === "shaking") return;
    onCastStart?.();
    setFaces(makeCast());
    setLandings(makeLandings());
    setPhase("shaking");
  }

  const instructions =
    phase === "ready"
      ? readyLabel
      : phase === "shaking"
        ? shakingLabel
        : "";

  return (
    <section className={`chamalongo-cast-experience is-${phase}`} aria-live="polite">
      <button
        type="button"
        className="chamalongo-hands-stage"
        onClick={cast}
        disabled={phase === "shaking"}
        aria-label={phase === "released" ? recastLabel : instructions}
      >
        <img
          className="chamalongo-board"
          src="/oracles/chamalongos/chamalongo-casting-board.png"
          alt="Tablero ceremonial para la tirada de chamalongos"
        />
        <img
          className="chamalongo-hands chamalongo-hands-closed"
          src="/oracles/chamalongos/chamalongo-hands-closed.png"
          alt="Dos manos cerradas sosteniendo los chamalongos"
        />
        <img
          className="chamalongo-hands chamalongo-hands-open"
          src="/oracles/chamalongos/chamalongo-hands-open.png"
          alt="Las mismas manos abiertas con las palmas hacia el tablero"
        />
        <span className="chamalongo-fall" aria-hidden="true">
          {faces.map((face, index) => {
            const landing = landings[index];
            const style = {
              "--landing-left": `${landing.left}%`,
              "--landing-top": `${landing.top}%`,
              "--turn": `${landing.turn}deg`,
              "--drop-delay": `${landing.delay}s`,
            } as CSSProperties;

            return (
              <img
                key={`${face}-${index}`}
                className="chamalongo-shell"
                src={`/oracles/chamalongos/tiger-cowrie-${face}.webp`}
                alt=""
                style={style}
              />
            );
          })}
        </span>
      </button>
      {instructions && <p className="chamalongo-cast-instructions">{instructions}</p>}
      {phase === "released" && resultContent}
      {phase === "released" && (
        <button type="button" className="chamalongo-recast" onClick={cast}>
          {recastLabel} <span aria-hidden="true">↻</span>
        </button>
      )}
    </section>
  );
}
