import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { Criteria } from "@olula/lib/diseño.ts";
import { MetaTabla } from "../atomos/qtablacontrolada.tsx";
import * as infra from "../vistas/infraestructura.ts";
import { ConfigVista } from "../vistas/diseño.ts";
import { olvidarPreferenciasVista } from "../vistas/usePreferenciasVista.ts";
import { Listado } from "./Listado.tsx";

vi.mock("../vistas/infraestructura.ts", () => ({
  getVistaUsuario: vi.fn(),
  guardarVistaUsuario: vi.fn(),
  restaurarVistaUsuario: vi.fn(),
}));

const getVista = vi.mocked(infra.getVistaUsuario);
const guardarVista = vi.mocked(infra.guardarVistaUsuario);
const restaurarVista = vi.mocked(infra.restaurarVistaUsuario);

type Pedido = { id: string; codigo: string; cliente: string; total: number; notas: string };

const metaTabla: MetaTabla<Pedido> = [
  { id: "codigo", cabecera: "Código" },
  { id: "cliente", cabecera: "Cliente" },
  { id: "total", cabecera: "Total" },
  { id: "notas", cabecera: "Notas", oculta: true },
];

const pedidos: Pedido[] = [{ id: "p1", codigo: "PED-1", cliente: "Acme", total: 100, notas: "x" }];

const criteriaBase: Criteria = {
  filtro: [],
  orden: ["id", "DESC"],
  paginacion: { pagina: 1, limite: 20 },
};

const conVista = (config: ConfigVista | null, origen: "usuario" | "empresa" | null = "usuario") =>
  getVista.mockResolvedValue({ pantalla: "ventas.pedido", vista: "", config, origen });

const montar = (props: { pantalla?: string; criteria?: Criteria; onCriteriaChanged?: () => void } = {}) =>
  render(
    <Listado<Pedido>
      metaTabla={metaTabla}
      criteria={props.criteria ?? criteriaBase}
      criteriaInicial={criteriaBase}
      entidades={pedidos}
      totalEntidades={1}
      modoInicial="tabla"
      onSeleccion={() => {}}
      onCriteriaChanged={props.onCriteriaChanged ?? (() => {})}
      pantalla={props.pantalla}
    />
  );

const cabeceras = () =>
  screen
    .getAllByRole("columnheader")
    .filter((th) => th.getAttribute("data-modo") === "columna")
    .map((th) => th.firstChild?.textContent);

beforeEach(() => {
  vi.clearAllMocks();
  olvidarPreferenciasVista();
  guardarVista.mockResolvedValue(undefined);
  restaurarVista.mockResolvedValue(undefined);
});

describe("Listado sin pantalla", () => {
  test("la vista es fija: todas las columnas del código y sin selector", () => {
    montar();

    expect(getVista).not.toHaveBeenCalled();
    expect(cabeceras()).toEqual(["Código", "Cliente", "Total", "Notas"]);
    expect(screen.queryByRole("button", { name: /^Columnas/ })).toBeNull();
    expect(screen.queryByRole("button", { name: /Opciones de la columna/ })).toBeNull();
  });
});

describe("Listado con pantalla", () => {
  test("sin configuración, oculta las columnas ocultas por defecto", async () => {
    conVista(null, null);
    montar({ pantalla: "ventas.pedido" });

    await screen.findByRole("button", { name: "Columnas" });
    expect(cabeceras()).toEqual(["Código", "Cliente", "Total"]);
  });

  test("aplica las columnas y el orden guardados y marca la vista personalizada", async () => {
    conVista({ tabla: { columnas: ["total", "notas", "codigo"], ocultas: ["cliente"] } });
    montar({ pantalla: "ventas.pedido" });

    await screen.findByRole("button", { name: "Columnas (vista personalizada)" });
    expect(cabeceras()).toEqual(["Total", "Notas", "Código"]);
  });

  test("ocultar desde el menú de la columna guarda y la quita al momento", async () => {
    conVista(null, null);
    montar({ pantalla: "ventas.pedido" });
    await screen.findByRole("button", { name: "Columnas" });

    fireEvent.click(screen.getByRole("button", { name: "Opciones de la columna Cliente" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Ocultar columna" }));

    await waitFor(() => expect(cabeceras()).toEqual(["Código", "Total"]));
    expect(guardarVista).toHaveBeenCalledWith(
      "ventas.pedido",
      { tabla: { columnas: ["codigo", "total"], ocultas: ["cliente", "notas"] } },
      ""
    );
  });

  test("ordenar desde el menú de la columna no guarda nada", async () => {
    conVista(null, null);
    const onCriteriaChanged = vi.fn();
    montar({ pantalla: "ventas.pedido", onCriteriaChanged });
    await screen.findByRole("button", { name: "Columnas" });

    fireEvent.click(screen.getByRole("button", { name: "Opciones de la columna Total" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Orden descendente" }));

    // Una sola vez: el clic del menú (en un portal) no llega al th.
    expect(onCriteriaChanged).toHaveBeenCalledTimes(1);
    expect(onCriteriaChanged).toHaveBeenCalledWith(
      expect.objectContaining({ orden: ["total", "DESC"] })
    );
    expect(guardarVista).not.toHaveBeenCalled();
  });

  test("ocultar desde el menú no cambia la ordenación", async () => {
    conVista(null, null);
    const onCriteriaChanged = vi.fn();
    montar({ pantalla: "ventas.pedido", onCriteriaChanged });
    await screen.findByRole("button", { name: "Columnas" });

    fireEvent.click(screen.getByRole("button", { name: "Opciones de la columna Cliente" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Ocultar columna" }));

    await waitFor(() => expect(guardarVista).toHaveBeenCalled());
    expect(onCriteriaChanged).not.toHaveBeenCalled();
  });

  test("el menú se maneja con teclado y Escape devuelve el foco", async () => {
    conVista(null, null);
    montar({ pantalla: "ventas.pedido" });
    await screen.findByRole("button", { name: "Columnas" });
    const boton = screen.getByRole("button", { name: "Opciones de la columna Total" });

    fireEvent.click(boton);
    const menu = screen.getByRole("menu", { name: "Columna Total" });
    await waitFor(() =>
      expect(document.activeElement).toBe(
        within(menu).getByRole("menuitem", { name: "Orden ascendente" })
      )
    );
    fireEvent.keyDown(menu, { key: "ArrowDown" });
    expect(document.activeElement).toBe(
      within(menu).getByRole("menuitem", { name: "Orden descendente" })
    );

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("menu")).toBeNull();
    expect(document.activeElement).toBe(boton);
  });

  test("la cabecera conserva su nombre accesible", async () => {
    conVista(null, null);
    montar({ pantalla: "ventas.pedido" });
    await screen.findByRole("button", { name: "Columnas" });

    expect(screen.getByRole("columnheader", { name: "Cliente" })).toBeTruthy();
  });

  test("el selector añade una columna oculta y la mueve", async () => {
    conVista(null, null);
    montar({ pantalla: "ventas.pedido" });
    fireEvent.click(await screen.findByRole("button", { name: "Columnas" }));

    const panel = screen.getByRole("dialog", { name: "Columnas" });
    fireEvent.click(within(panel).getByRole("checkbox", { name: "Notas" }));
    await waitFor(() => expect(cabeceras()).toEqual(["Código", "Cliente", "Total", "Notas"]));

    fireEvent.click(within(panel).getByRole("button", { name: "Subir Notas" }));
    await waitFor(() => expect(cabeceras()).toEqual(["Código", "Cliente", "Notas", "Total"]));
    expect(guardarVista).toHaveBeenLastCalledWith(
      "ventas.pedido",
      { tabla: { columnas: ["codigo", "cliente", "notas", "total"], ocultas: [] } },
      ""
    );
  });

  test("la última columna visible no se puede ocultar", async () => {
    conVista({ tabla: { columnas: ["codigo"], ocultas: ["cliente", "total", "notas"] } });
    montar({ pantalla: "ventas.pedido" });
    fireEvent.click(await screen.findByRole("button", { name: /^Columnas/ }));

    expect(screen.getByRole("checkbox", { name: "Código" })).toBeDisabled();
  });

  test("la ordenación guardada se aplica al cargar si no se llegó con otra", async () => {
    conVista({ tabla: { columnas: ["codigo", "total"], orden: ["total", "DESC"] } });
    const onCriteriaChanged = vi.fn();
    montar({ pantalla: "ventas.pedido", onCriteriaChanged });

    await waitFor(() =>
      expect(onCriteriaChanged).toHaveBeenCalledWith(
        expect.objectContaining({ orden: ["total", "DESC"] })
      )
    );
  });

  test("con otra ordenación de entrada (URL) no se pisa", async () => {
    conVista({ tabla: { columnas: ["codigo", "total"], orden: ["total", "DESC"] } });
    const onCriteriaChanged = vi.fn();
    montar({
      pantalla: "ventas.pedido",
      criteria: { ...criteriaBase, orden: ["codigo", "ASC"] },
      onCriteriaChanged,
    });

    await screen.findByRole("button", { name: /^Columnas/ });
    expect(onCriteriaChanged).not.toHaveBeenCalled();
  });

  test("guardar la ordenación actual como predeterminada", async () => {
    conVista(null, null);
    montar({ pantalla: "ventas.pedido", criteria: { ...criteriaBase, orden: ["total", "ASC"] } });
    fireEvent.click(await screen.findByRole("button", { name: "Columnas" }));

    fireEvent.click(
      screen.getByRole("button", { name: "Guardar ordenación actual como predeterminada" })
    );

    await waitFor(() =>
      expect(guardarVista).toHaveBeenCalledWith(
        "ventas.pedido",
        {
          tabla: {
            columnas: ["codigo", "cliente", "total"],
            ocultas: ["notas"],
            orden: ["total", "ASC"],
          },
        },
        ""
      )
    );
  });

  test("restaurar borra la configuración del usuario", async () => {
    conVista({ tabla: { columnas: ["total"], ocultas: ["codigo", "cliente", "notas"] } });
    montar({ pantalla: "ventas.pedido" });
    fireEvent.click(await screen.findByRole("button", { name: /vista personalizada/ }));

    conVista(null, null);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Restaurar vista por defecto" }));
    });

    expect(restaurarVista).toHaveBeenCalledWith("ventas.pedido", "");
    await waitFor(() => expect(cabeceras()).toEqual(["Código", "Cliente", "Total"]));
  });

  test("restaurar el listado conserva los botones del detalle (misma fila)", async () => {
    conVista({
      tabla: { columnas: ["total"], ocultas: ["codigo", "cliente", "notas"] },
      modo: "tabla",
      acciones: { detalle: ["imprimir"] },
    });
    montar({ pantalla: "ventas.pedido" });
    fireEvent.click(await screen.findByRole("button", { name: /vista personalizada/ }));

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Restaurar vista por defecto" }));
    });

    expect(restaurarVista).not.toHaveBeenCalled();
    expect(guardarVista).toHaveBeenLastCalledWith(
      "ventas.pedido",
      { acciones: { detalle: ["imprimir"] } },
      ""
    );
    await waitFor(() => expect(cabeceras()).toEqual(["Código", "Cliente", "Total"]));
    // Solo con botones guardados el listado no se marca como personalizado.
    expect(screen.getByRole("button", { name: "Columnas" })).toBeInTheDocument();
  });

  test("la plantilla de tarjeta del usuario manda sobre la tarjeta del código", async () => {
    conVista({ tarjeta: { titulo: "cliente", subtitulo: "codigo", campos: ["total", "notas"] } });
    render(
      <Listado<Pedido>
        metaTabla={metaTabla}
        criteria={criteriaBase}
        criteriaInicial={criteriaBase}
        entidades={pedidos}
        totalEntidades={1}
        modoInicial="tarjetas"
        tarjeta={(p) => <span>Tarjeta del código {p.codigo}</span>}
        onSeleccion={() => {}}
        onCriteriaChanged={() => {}}
        pantalla="ventas.pedido"
      />
    );

    const titulo = await screen.findByText("Acme", { selector: ".tarjeta-plantilla-titulo" });
    const tarjeta = titulo.closest("article")!;
    expect(within(tarjeta).getByText("PED-1")).toBeInTheDocument();
    // Una columna oculta en la tabla también puede ir en la tarjeta.
    expect(within(tarjeta).getByText("Notas")).toBeInTheDocument();
    expect(screen.queryByText(/Tarjeta del código/)).toBeNull();
  });

  test("si el servidor no responde, la vista del código sin personalizar", async () => {
    getVista.mockRejectedValue({ estado: 500 });
    montar({ pantalla: "ventas.pedido" });

    await waitFor(() => expect(getVista).toHaveBeenCalled());
    expect(cabeceras()).toEqual(["Código", "Cliente", "Total"]);
    expect(screen.queryByRole("button", { name: /^Columnas/ })).toBeNull();
  });
});
