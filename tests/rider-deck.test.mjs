import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { riderDeck } from "../app/rider-deck.ts";
import { tarotCatalog } from "../app/library-data.ts";

const requiredTextFields = ["id", "name", "en", "arcana", "general", "love", "work", "money", "growth", "advice", "symbols", "reversed", "image"];

test("la baraja Rider activa contiene las 78 cartas", () => {
  assert.equal(riderDeck.length, 78);
  assert.equal(riderDeck.filter((card) => card.arcana === "Mayor").length, 22);
  assert.equal(riderDeck.filter((card) => card.arcana === "Menor").length, 56);
  for (const suit of ["Bastos", "Copas", "Espadas", "Oros"]) {
    assert.equal(riderDeck.filter((card) => card.suit === suit).length, 14);
  }
});

test("cada carta tiene identidad, interpretación e imagen completas", () => {
  assert.equal(new Set(riderDeck.map((card) => card.id)).size, 78);
  assert.equal(new Set(riderDeck.map((card) => card.name)).size, 78);
  assert.equal(new Set(riderDeck.map((card) => card.image)).size, 78);

  for (const card of riderDeck) {
    for (const field of requiredTextFields) assert.ok(card[field]?.toString().trim(), `${card.name}: falta ${field}`);
    assert.ok(card.keys.length >= 3, `${card.name}: faltan palabras clave`);
    const imagePath = fileURLToPath(new URL(`../public${card.image}`, import.meta.url));
    assert.ok(existsSync(imagePath), `${card.name}: no existe ${card.image}`);
  }
});

test("la biblioteca y el mazo de lectura utilizan las mismas 78 cartas", () => {
  assert.deepEqual(new Set(riderDeck.map((card) => card.id)), new Set(tarotCatalog.map((card) => card.id)));
  for (const catalogCard of tarotCatalog) {
    const activeCard = riderDeck.find((card) => card.id === catalogCard.id);
    assert.equal(activeCard?.name, catalogCard.name);
    assert.equal(activeCard?.image, catalogCard.image);
  }
});
