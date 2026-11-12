import { describe, expect, test } from "vitest";
import { cabecerasMultinivel } from "./cabeceras_multinivel.ts";

const textos = (filas: ReturnType<typeof cabecerasMultinivel>) =>
  filas.map((fila) => fila.map((c) => [c.texto, c.colSpan, c.rowSpan]));

describe("cabecerasMultinivel", () => {
  test("sin grupos, una sola fila de cabecera", () => {
    const filas = cabecerasMultinivel([
      { id: "importe", cabecera: "Importe" },
      { id: "cantidad", cabecera: "Cantidad" },
    ]);

    expect(textos(filas)).toEqual([
      [
        ["Importe", 1, 1],
        ["Cantidad", 1, 1],
      ],
    ]);
    expect(filas[0][0].columnaId).toBe("importe");
  });

  test("columnas consecutivas del mismo grupo se unen", () => {
    const filas = cabecerasMultinivel([
      { id: "2025.importe", cabecera: "Importe", grupo: ["2025"] },
      { id: "2025.cantidad", cabecera: "Cantidad", grupo: ["2025"] },
      { id: "2026.importe", cabecera: "Importe", grupo: ["2026"] },
    ]);

    expect(textos(filas)).toEqual([
      [
        ["2025", 2, 1],
        ["2026", 1, 1],
      ],
      [
        ["Importe", 1, 1],
        ["Cantidad", 1, 1],
        ["Importe", 1, 1],
      ],
    ]);
    expect(filas[0][0].columnaId).toBeUndefined();
  });

  test("una columna con menos grupos ocupa las filas que le faltan", () => {
    const filas = cabecerasMultinivel([
      { id: "total.importe", cabecera: "Total", grupo: [] },
      { id: "2025", cabecera: "Total 2025", grupo: ["2025"] },
      { id: "2025.T1", cabecera: "T1", grupo: ["2025", "T1"] },
      { id: "2025.T2", cabecera: "T2", grupo: ["2025", "T2"] },
    ]);

    expect(textos(filas)).toEqual([
      [
        ["Total", 1, 3],
        ["2025", 3, 1],
      ],
      [
        ["Total 2025", 1, 2],
        ["T1", 1, 1],
        ["T2", 1, 1],
      ],
      [
        ["T1", 1, 1],
        ["T2", 1, 1],
      ],
    ]);
  });

  test("un grupo interrumpido no se une con su repetición posterior", () => {
    const filas = cabecerasMultinivel([
      { id: "a1", cabecera: "x", grupo: ["A"] },
      { id: "b", cabecera: "y" },
      { id: "a2", cabecera: "z", grupo: ["A"] },
    ]);

    expect(textos(filas)[0]).toEqual([
      ["A", 1, 1],
      ["y", 1, 2],
      ["A", 1, 1],
    ]);
  });

  test("el mismo texto bajo padres distintos no se une", () => {
    const filas = cabecerasMultinivel([
      { id: "1", cabecera: "Importe", grupo: ["2025", "T4"] },
      { id: "2", cabecera: "Importe", grupo: ["2026", "T4"] },
    ]);

    expect(textos(filas)[1]).toEqual([
      ["T4", 1, 1],
      ["T4", 1, 1],
    ]);
  });
});
