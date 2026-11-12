import { beforeEach, describe, expect, test, vi } from "vitest";
import { Cubo, FilaPivot, Miembro } from "../../diseño.ts";
import { arbolDesdePivot, expandirNodo, peticionInicial } from "../../dominio.ts";
import { getCatalogo, postPivot } from "../../infraestructura.ts";
import { ContextoNavegador } from "./diseño.ts";
import { cargaTerminada, contextoNavegadorInicial } from "./navegador.ts";

vi.mock("../../infraestructura.ts", () => ({
  getCatalogo: vi.fn(),
  postPivot: vi.fn(),
  exportarPivot: vi.fn(),
  postRecarga: vi.fn(),
}));

const m = (codigo: string): Miembro => ({ codigo, etiqueta: codigo });
const fila = (filas: (Miembro | null)[], importe: number): FilaPivot => ({ filas, columnas: [null], medidas: { importe } });

const cubo = (id: string): Cubo => ({
  id,
  descripcion: id,
  dimensiones: [],
  medidas: [{ id: "importe", descripcion: "Importe", agregacion: "suma", formato: "moneda" }],
  ultimaCarga: null,
  estadoCarga: null,
});

const ventas = cubo("ventas");
const peticion = { ...peticionInicial(ventas), filas: ["articulo.familia", "articulo.articulo"] };
const raiz = [fila([null], 10), fila([m("F1")], 10)];
const hijos = [fila([m("F1"), m("A1")], 10)];

const ctx: ContextoNavegador = {
  ...contextoNavegadorInicial,
  estado: "NAVEGANDO",
  cubos: [ventas],
  cubo: ventas,
  peticion,
  arbol: expandirNodo(arbolDesdePivot(raiz), [m("F1")], hijos),
};

const terminada = (cuboId: string, estado: "ok" | "error") => ({ cargaId: 1, cuboId, estado, filas: 1, mensaje: null });

describe("cargaTerminada", () => {
  beforeEach(() => {
    vi.mocked(getCatalogo).mockReset().mockResolvedValue([ventas, cubo("compras")]);
    vi.mocked(postPivot).mockReset().mockImplementation(async (_, p) => ({
      filas: p.filas.length === 1 ? raiz : hijos,
      truncado: false,
    }));
  });

  test("del cubo actual y correcta: refresca el catálogo y vuelve a pedir el pivot con los nodos expandidos", async () => {
    const resultado = (await cargaTerminada(ctx, terminada("ventas", "ok"))) as ContextoNavegador;
    expect(getCatalogo).toHaveBeenCalledTimes(1);
    expect(postPivot).toHaveBeenCalledTimes(2);
    expect(resultado.cubos).toHaveLength(2);
    expect(resultado.arbol?.nodos[0].expandido).toBe(true);
    expect(resultado.arbol?.nodos[0].hijos).toHaveLength(1);
  });

  test("de otro cubo: solo refresca el catálogo", async () => {
    await cargaTerminada(ctx, terminada("compras", "ok"));
    expect(getCatalogo).toHaveBeenCalledTimes(1);
    expect(postPivot).not.toHaveBeenCalled();
  });

  test("con error: solo refresca el catálogo", async () => {
    await cargaTerminada(ctx, terminada("ventas", "error"));
    expect(getCatalogo).toHaveBeenCalledTimes(1);
    expect(postPivot).not.toHaveBeenCalled();
  });
});
