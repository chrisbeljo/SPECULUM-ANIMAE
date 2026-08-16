"use client";

import { useEffect, useState } from "react";
import "./chamalongo-cast.css";

type CastPhase = "ready" | "shaking" | "released";

type ChamalongoCastProps = {
  onCastComplete?: (faces: Array<"up" | "down">) => void;
};

const makeCast = (): Array<"up" | "down"> =>
  Array.from({ length: 4 }, () => (Math.random() >= 0.5 ? "up" : "down"));

export function ChamalongoCast({ onCastComplete }: ChamalongoCastProps) {
  const [phase, setPhase] = useState<CastPhase>("ready");
  const [faces, setFaces] = useState<Array<"up" | "down">>(() => makeCast());

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
    setFaces(makeCast());
    setPhase("shaking");
  }

  const instructions =
    phase === "ready"
      ? "Toca las manos para agitar los chamalongos"
      : phase === "shaking"
        ? "Mantén tu pregunta presente"
        : "La caída ha terminado";

  return (
    <section className={`chamalongo-cast-experience is-${phase}`} aria-live="polite">
      <button
        type="button"
        className="chamalongo-hands-stage"
        onClick={cast}
        disabled={phase === "shaking"}
        aria-label={phase === "released" ? "Volver a lanzar los chamalongos" : instructions}
      >
        <img
          className="chamalongo-hands chamalongo-hands-closed"
          src="/oracles/chamalongos/chamalongo-hands-closed.png"
          alt="Dos manos cerradas sosteniendo los chamalongos"
        />
        <img
          className="chamalongo-hands chamalongo-hands-open"
          src="/oracles/chamalongos/chamalongo-hands-open.png"
          alt="Las mismas manos abiertas después del lanzamiento"
        />
        <span className="chamalongo-fall" aria-hidden="true">
          {faces.map((face, index) => (
            <img
              key={`${face}-${index}`}
              className={`chamalongo-shell shell-${index + 1}`}
              src={`/oracles/chamalongos/tiger-cowrie-${face}.webp`}
              alt=""
            />
          ))}
        </span>
      </button>
      <p className="chamalongo-cast-instructions">{instructions}</p>
      {phase === "released" && (
        <button type="button" className="chamalongo-recast" onClick={cast}>
          Lanzar de nuevo <span aria-hidden="true">↻</span>
        </button>
      )}
    </section>
  );
}
