import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";

const getProvincias = vi.fn(async (_filtro: unknown, _orden: unknown) => [
  { id: "29", nombre: "MÁLAGA", paisId: "ES" },
]);

vi.mock("#/comun/componentes/provincia/infraestructura.ts", () => ({
  getProvincias: (filtro: unknown, orden: unknown) => getProvincias(filtro, orden),
}));

const { Provincia } = await import("#/comun/componentes/provincia/provincia.tsx");

describe("Provincia con una provincia ya seleccionada", () => {
  beforeEach(() => getProvincias.mockClear());

  test("resuelve el nombre a partir del id y lo muestra", async () => {
    render(<Provincia valor="29" onChange={() => {}} />);

    await waitFor(() => expect(getProvincias).toHaveBeenCalled());

    expect(getProvincias.mock.calls[0][0]).toEqual([["id", "=", "29"]]);
    await waitFor(() =>
      expect(screen.getByDisplayValue("MÁLAGA")).toBeTruthy()
    );
  });
});
