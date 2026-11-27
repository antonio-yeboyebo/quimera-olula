import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { Criteria } from "@olula/lib/diseño.ts";
import { MetaTabla } from "../atomos/qtablacontrolada.tsx";
import { Listado } from "../maestro/Listado.tsx";
import { ConfigVista, VistaGuardada } from "./diseño.ts";
import * as infra from "./infraestructura.ts";
import { olvidarPreferenciasVista } from "./usePreferenciasVista.ts";

vi.mock("./infraestructura.ts", () => ({
  getVistaUsuario: vi.fn(),
  guardarVistaUsuario: vi.fn(),
  restaurarVistaUsuario: vi.fn(),
  getVistasGuardadas: vi.fn(),
}));

const getVista = vi.mocked(infra.getVistaUsuario);
const guardarVista = vi.mocked(infra.guardarVistaUsuario);
const restaurarVista = vi.mocked(infra.restaurarVistaUsuario);
const getVistas = vi.mocked(infra.getVistasGuardadas);

type Pedido = { id: string; codigo: string; cliente: string };

const metaTabla: MetaTabla<Pedido> = [
  { id: "codigo", cabecera: "Código" },
  { id: "cliente", cabecera: "Cliente" },
];

const criteriaInicial: Criteria = {
  filtro: [],
  orden: ["id", "DESC"],
  paginacion: { pagina: 1, limite: 20 },
};

/** Configuración de cada vista ('' = por defecto) que devuelve el servidor. */
const conVistas = (
  configs: Record<string, ConfigVista | null>,
  vistas: VistaGuardada[],
  bloqueada = false
) => {
  getVista.mockImplementation(async (pantalla, vista = "") => ({
    pantalla,
    vista,
    config: configs[vista] ?? null,
    origen: configs[vista] ? "usuario" : null,
    bloqueada,
  }));
  getVistas.mockResolvedValue(vistas);
};

const montar = (criteria = criteriaInicial) => {
  const onCriteriaChanged = vi.fn();
  render(
    <Listado<Pedido>
      metaTabla={metaTabla}
      criteria={criteria}
      criteriaInicial={criteriaInicial}
      entidades={[{ id: "p1", codigo: "PED-1", cliente: "Acme" }]}
      totalEntidades={1}
      modoInicial="tabla"
      onSeleccion={() => {}}
      onCriteriaChanged={onCriteriaChanged}
      pantalla="ventas.pedido"
    />
  );
  return onCriteriaChanged;
};

const abrirVistas = async () => {
  fireEvent.click(await screen.findByRole("button", { name: /^Vista: / }));
  return screen.findByRole("menu", { name: "Vistas" });
};

beforeEach(() => {
  vi.clearAllMocks();
  olvidarPreferenciasVista();
  guardarVista.mockResolvedValue(undefined);
  restaurarVista.mockResolvedValue(undefined);
});

describe("vistas con nombre", () => {
  test("elegir una vista aplica su filtro y su orden", async () => {
    conVistas(
      {
        "": null,
        pendientes: {
          nombre: "Pendientes",
          filtro: [["servido", "eq", "No"]],
          tabla: { columnas: ["cliente"], orden: ["fecha", "DESC"] },
        },
      },
      [
        { vista: "pendientes", nombre: "Pendientes", origen: "usuario" },
        { vista: "grandes", nombre: "Grandes", origen: "empresa" },
      ]
    );
    const onCriteriaChanged = montar();

    const menu = await abrirVistas();
    expect(within(menu).getByRole("menuitemradio", { name: /Grandes · de la empresa/ })).toBeInTheDocument();
    // La vista activa se anuncia como marcada.
    expect(within(menu).getByRole("menuitemradio", { name: "Vista por defecto" })).toHaveAttribute(
      "aria-checked",
      "true"
    );
    fireEvent.click(within(menu).getByRole("menuitemradio", { name: "Pendientes" }));

    await waitFor(() =>
      expect(onCriteriaChanged).toHaveBeenLastCalledWith(
        expect.objectContaining({
          filtro: [["servido", "eq", "No"]],
          orden: ["fecha", "DESC"],
          paginacion: { pagina: 1, limite: 20 },
        })
      )
    );
    expect(getVista).toHaveBeenCalledWith("ventas.pedido", "pendientes");
    // (El listado del test no se vuelve a pintar con el filtro: sale «con cambios».)
    expect(screen.getByRole("button", { name: /^Vista: Pendientes/ })).toHaveAttribute(
      "data-activa"
    );
  });

  test("guardar como vista nueva guarda filtro, columnas y orden de ahora", async () => {
    conVistas({ "": null }, []);
    montar({ ...criteriaInicial, filtro: [["cliente", "eq", "Acme"]], orden: ["codigo", "ASC"] });

    const menu = await abrirVistas();
    fireEvent.click(within(menu).getByRole("menuitem", { name: "Guardar como vista nueva…" }));
    const dialogo = await screen.findByRole("dialog", { name: "Guardar como vista nueva" });
    fireEvent.change(within(dialogo).getByRole("textbox", { name: /Nombre de la vista/ }), {
      target: { value: "Clientes Acme" },
    });
    await act(async () => {
      fireEvent.click(within(dialogo).getByRole("button", { name: "Guardar" }));
    });

    expect(guardarVista).toHaveBeenCalledWith(
      "ventas.pedido",
      {
        nombre: "Clientes Acme",
        filtro: [["cliente", "eq", "Acme"]],
        tabla: { columnas: ["codigo", "cliente"], ocultas: [], orden: ["codigo", "ASC"] },
        modo: "tabla",
      },
      "clientes_acme"
    );
    expect(getVistas).toHaveBeenCalledTimes(2);
  });

  test("si el servidor rechaza la vista nueva, se avisa", async () => {
    conVistas({ "": null }, []);
    guardarVista.mockRejectedValue({ estado: 400 });
    montar({ ...criteriaInicial, filtro: [["servido", "in", ["No", "Parcial"] as unknown as string]] });

    fireEvent.click(
      within(await abrirVistas()).getByRole("menuitem", { name: "Guardar como vista nueva…" })
    );
    const dialogo = await screen.findByRole("dialog", { name: "Guardar como vista nueva" });
    fireEvent.change(within(dialogo).getByRole("textbox", { name: /Nombre de la vista/ }), {
      target: { value: "Pendientes" },
    });
    await act(async () => {
      fireEvent.click(within(dialogo).getByRole("button", { name: "Guardar" }));
    });

    expect(await screen.findByRole("alert")).toHaveTextContent("No se ha podido guardar la vista.");
    expect(screen.getByRole("button", { name: "Vista: Vista por defecto" })).toBeInTheDocument();
  });

  test("borrar una vista propia pide confirmación y vuelve a la de por defecto", async () => {
    conVistas(
      { "": null, mia: { nombre: "Mía", filtro: [] } },
      [{ vista: "mia", nombre: "Mía", origen: "usuario" }]
    );
    montar();

    fireEvent.click(within(await abrirVistas()).getByRole("menuitemradio", { name: "Mía" }));
    fireEvent.click(await screen.findByRole("button", { name: "Vista: Mía" }));
    const menu = await screen.findByRole("menu", { name: "Vistas" });
    fireEvent.click(within(menu).getByRole("menuitem", { name: "Borrar la vista «Mía»…" }));

    const confirmar = await screen.findByRole("dialog", { name: "Borrar la vista «Mía»" });
    // El foco empieza en Cancelar: borrar es irreversible.
    expect(within(confirmar).getByRole("button", { name: "Cancelar" })).toHaveFocus();
    expect(restaurarVista).not.toHaveBeenCalled();
    await act(async () => {
      fireEvent.click(within(confirmar).getByRole("button", { name: "Borrar" }));
    });

    expect(restaurarVista).toHaveBeenCalledWith("ventas.pedido", "mia");
    await screen.findByRole("button", { name: "Vista: Vista por defecto" });
  });

  test("una vista de la empresa no se puede borrar ni cambiar su filtro", async () => {
    conVistas(
      { "": null, grandes: { nombre: "Grandes" } },
      [{ vista: "grandes", nombre: "Grandes", origen: "empresa" }]
    );
    montar();

    fireEvent.click(within(await abrirVistas()).getByRole("menuitemradio", { name: /Grandes/ }));
    fireEvent.click(await screen.findByRole("button", { name: "Vista: Grandes" }));
    const menu = await screen.findByRole("menu", { name: "Vistas" });
    expect(within(menu).queryByRole("menuitem", { name: /Borrar/ })).toBeNull();
    expect(within(menu).queryByRole("menuitem", { name: /Guardar el filtro/ })).toBeNull();
  });

  test("con la pantalla bloqueada se ven las vistas pero no se personaliza", async () => {
    conVistas(
      { "": { tabla: { columnas: ["cliente"] } } },
      [{ vista: "grandes", nombre: "Grandes", origen: "empresa" }],
      true
    );
    montar();

    const menu = await abrirVistas();
    expect(within(menu).getByRole("menuitemradio", { name: /Grandes/ })).toBeInTheDocument();
    expect(within(menu).queryByRole("menuitem", { name: /Guardar como/ })).toBeNull();
    // Se aplican las columnas fijadas, pero sin selector de columnas.
    expect(screen.queryByRole("button", { name: /^Columnas/ })).toBeNull();
  });
});
