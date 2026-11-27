import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { Criteria } from "@olula/lib/diseño.ts";
import { MetaTabla } from "../atomos/qtablacontrolada.tsx";
import { Listado } from "../maestro/Listado.tsx";
import { QuimeraAcciones } from "../moleculas/qacciones.tsx";
import * as infra from "./infraestructura.ts";
import {
  accionesDePlugins,
  columnasDePlugins,
  olvidarRegistrosPlugins,
  registrarAcciones,
  registrarColumnas,
} from "./registro_plugins.ts";
import { olvidarPreferenciasVista } from "./usePreferenciasVista.ts";

vi.mock("./infraestructura.ts", () => ({
  getVistaUsuario: vi.fn(),
  guardarVistaUsuario: vi.fn(),
  restaurarVistaUsuario: vi.fn(),
}));

const getVista = vi.mocked(infra.getVistaUsuario);

type Pedido = { id: string; codigo: string; ubicacion: string; bultos: number };

const conPlugins = (plugins: Record<string, string>) =>
  localStorage.setItem("whoami", JSON.stringify({ plugins }));

beforeEach(() => {
  vi.clearAllMocks();
  olvidarRegistrosPlugins();
  olvidarPreferenciasVista();
  localStorage.clear();
  getVista.mockResolvedValue({ pantalla: "ventas.pedido", vista: "", config: null, origen: null });
});

describe("registro de plugins", () => {
  test("solo las de plugins activos, con id prefijado y ocultas por defecto", () => {
    registrarColumnas<Pedido>("ventas.pedido", "sga", [
      { id: "ubicacion", cabecera: "Ubicación" },
      { id: "bultos", cabecera: "Bultos", oculta: false },
    ]);
    registrarColumnas<Pedido>("ventas.pedido", "crm", [{ id: "zona", cabecera: "Zona" }]);
    conPlugins({ sga: "activo", crm: "inactivo" });

    expect(
      columnasDePlugins("ventas.pedido").map(({ id, oculta }) => ({ id, oculta }))
    ).toEqual([
      { id: "plugin.sga.ubicacion", oculta: true },
      { id: "plugin.sga.bultos", oculta: false },
    ]);
    expect(columnasDePlugins("ventas.factura")).toEqual([]);
  });

  test("registrar otra vez el mismo plugin sustituye, no duplica", () => {
    registrarColumnas("ventas.pedido", "sga", [{ id: "a", cabecera: "A" }]);
    registrarColumnas("ventas.pedido", "sga", [{ id: "b", cabecera: "B" }]);
    conPlugins({ sga: "activo" });

    expect(columnasDePlugins("ventas.pedido").map((c) => c.id)).toEqual(["plugin.sga.b"]);
  });

  test("las acciones reciben el contexto del grupo", () => {
    const fabrica = vi.fn((pedido: { codigo: string }) => [
      { id: "etiquetas", texto: `Etiquetas ${pedido.codigo}`, onClick: vi.fn() },
    ]);
    registrarAcciones("ventas.pedido", "detalle", "sga", fabrica);
    conPlugins({ sga: "activo" });

    const acciones = accionesDePlugins("ventas.pedido", "detalle", { codigo: "PED-1" });
    expect(acciones.map(({ id, texto }) => ({ id, texto }))).toEqual([
      { id: "plugin.sga.etiquetas", texto: "Etiquetas PED-1" },
    ]);
    expect(accionesDePlugins("ventas.pedido", "otro", {})).toEqual([]);
  });
});

describe("plugins en las pantallas", () => {
  const metaTabla: MetaTabla<Pedido> = [{ id: "codigo", cabecera: "Código" }];
  const criteria: Criteria = {
    filtro: [],
    orden: ["id", "DESC"],
    paginacion: { pagina: 1, limite: 20 },
  };

  test("el listado ofrece las columnas del plugin y pinta su valor", async () => {
    registrarColumnas<Pedido>("ventas.pedido", "sga", [
      { id: "ubicacion", cabecera: "Ubicación" },
      { id: "bultos", cabecera: "Bultos", oculta: false, tipo: "numero" },
    ]);
    conPlugins({ sga: "activo" });
    render(
      <Listado<Pedido>
        metaTabla={metaTabla}
        criteria={criteria}
        criteriaInicial={criteria}
        entidades={[{ id: "p1", codigo: "PED-1", ubicacion: "A-01", bultos: 12000 }]}
        totalEntidades={1}
        modoInicial="tabla"
        onSeleccion={() => {}}
        onCriteriaChanged={() => {}}
        pantalla="ventas.pedido"
      />
    );

    // Bultos se ve (con el formato de su tipo); Ubicación está oculta pero en el selector.
    expect(await screen.findByText("12.000")).toBeInTheDocument();
    expect(screen.queryByText("A-01")).toBeNull();
    fireEvent.click(await screen.findByRole("button", { name: "Columnas" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "Ubicación" }));
    await waitFor(() => expect(screen.getByText("A-01")).toBeInTheDocument());
  });

  test("las acciones del plugin entran en el grupo y se pueden destacar", async () => {
    const etiquetas = vi.fn();
    registrarAcciones("ventas.pedido", "detalle", "sga", (pedido: { codigo: string }) => [
      { id: "etiquetas", texto: "Etiquetas", icono: "imprimir", onClick: () => etiquetas(pedido.codigo) },
    ]);
    conPlugins({ sga: "activo" });
    render(
      <QuimeraAcciones
        acciones={[{ id: "imprimir", texto: "Imprimir", onClick: vi.fn() }]}
        pantalla="ventas.pedido"
        grupo="detalle"
        contexto={{ codigo: "PED-7" }}
      />
    );

    fireEvent.click(await screen.findByRole("button", { name: "Más acciones" }));
    const menu = await screen.findByRole("menu");
    fireEvent.click(within(menu).getByRole("menuitem", { name: "Etiquetas" }));
    expect(etiquetas).toHaveBeenCalledWith("PED-7");
  });
});
