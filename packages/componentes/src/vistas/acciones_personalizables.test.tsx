import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { QuimeraAcciones } from "../moleculas/qacciones.tsx";
import { AccionDefinida } from "../moleculas/acciones.ts";
import { ConfigVista } from "./diseño.ts";
import * as infra from "./infraestructura.ts";
import { olvidarPreferenciasVista } from "./usePreferenciasVista.ts";

vi.mock("./infraestructura.ts", () => ({
  getVistaUsuario: vi.fn(),
  guardarVistaUsuario: vi.fn(),
  restaurarVistaUsuario: vi.fn(),
}));

const getVista = vi.mocked(infra.getVistaUsuario);
const guardarVista = vi.mocked(infra.guardarVistaUsuario);

const imprimir = vi.fn();
const acciones = (): AccionDefinida[] => [
  { id: "albaranar", icono: "camion", texto: "Albarán parcial", onClick: vi.fn(), deshabilitado: true },
  { id: "imprimir", icono: "imprimir", texto: "Imprimir", onClick: imprimir },
  { id: "relacionados", icono: "relacion", texto: "Documentos relacionados", onClick: vi.fn() },
  { texto: "Sin id", onClick: vi.fn() },
  { id: "borrar", icono: "eliminar", texto: "Borrar", advertencia: true, onClick: vi.fn() },
];

const conVista = (config: ConfigVista | null) =>
  getVista.mockResolvedValue({
    pantalla: "ventas.pedido", vista: "", config, origen: config ? "usuario" : null,
  });

const montar = () =>
  render(<QuimeraAcciones acciones={acciones()} vertical pantalla="ventas.pedido" grupo="detalle" />);

/** Botones visibles (sin la copia invisible que se usa para medir). */
const botones = () =>
  screen
    .getAllByRole("button")
    .filter((b) => b.closest("quimera-acciones") && !b.closest(".acciones-medida"))
    .map((b) => b.getAttribute("aria-label") ?? b.textContent);

const abrirMenu = () => fireEvent.click(screen.getByRole("button", { name: "Más acciones" }));

const comoMovil = (movil: boolean) =>
  vi.mocked(window.matchMedia).mockImplementation(
    (query: string) =>
      ({
        matches: movil,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }) as unknown as MediaQueryList
  );

beforeEach(() => {
  vi.clearAllMocks();
  olvidarPreferenciasVista();
  guardarVista.mockResolvedValue(undefined);
  comoMovil(false);
});

describe("acciones personalizables", () => {
  test("sin configuración: la principal del código como botón y el resto en el menú", async () => {
    conVista(null);
    montar();
    await waitFor(() => expect(getVista).toHaveBeenCalled());

    // Albarán parcial está deshabilitada: la principal es Imprimir.
    expect(botones()).toEqual(["Imprimir", "Más acciones"]);

    abrirMenu();
    const menu = await screen.findByRole("menu", { name: "Más acciones" });
    expect(within(menu).getAllByRole("menuitem").map((o) => o.textContent)).toEqual([
      "Albarán parcial",
      "Documentos relacionados",
      "Sin id",
      "Borrar",
      "Personalizar botones…",
    ]);
    // Deshabilitada pero enfocable, como pide el patrón de menú.
    const deshabilitada = within(menu).getByRole("menuitem", { name: "Albarán parcial" });
    expect(deshabilitada).toHaveAttribute("aria-disabled", "true");
    fireEvent.click(deshabilitada);
    expect(screen.getByRole("menu")).toBeInTheDocument();
  });

  test("con destacadas: esas en su orden, aunque estén deshabilitadas", async () => {
    conVista({ acciones: { detalle: ["borrar", "albaranar"] } });
    montar();

    await waitFor(() => expect(botones()).toEqual(["Borrar", "Albarán parcial", "Más acciones"]));
  });

  test("una destacada deshabilitada no se ejecuta (tampoco con teclado)", async () => {
    const albaranar = vi.fn();
    getVista.mockResolvedValue({
      pantalla: "ventas.pedido", vista: "", config: { acciones: { detalle: ["albaranar"] } }, origen: "usuario",
    });
    render(
      <QuimeraAcciones
        acciones={[{ id: "albaranar", texto: "Albarán parcial", onClick: albaranar, deshabilitado: true }]}
        pantalla="ventas.pedido"
        grupo="detalle"
      />
    );
    const boton = await screen.findByRole("button", { name: "Albarán parcial" });
    expect(boton).toHaveAttribute("aria-disabled", "true");
    // Enter/Espacio en un botón disparan click aunque pointer-events lo bloquee.
    fireEvent.click(boton);
    expect(albaranar).not.toHaveBeenCalled();
  });

  test("guardar conserva las destacadas que ahora no están", async () => {
    conVista({ acciones: { detalle: ["imprimir", "facturar"] } });
    montar();
    await waitFor(() => expect(botones()).toEqual(["Imprimir", "Más acciones"]));

    abrirMenu();
    fireEvent.click(await screen.findByRole("menuitem", { name: "Personalizar botones…" }));
    const panel = await screen.findByRole("dialog", { name: "Botones destacados" });
    fireEvent.click(within(panel).getByRole("checkbox", { name: "Borrar" }));

    expect(guardarVista).toHaveBeenLastCalledWith(
      "ventas.pedido",
      { acciones: { detalle: ["imprimir", "borrar", "facturar"] } },
      ""
    );
  });

  test("el tabulador cierra el menú y devuelve el foco a «Más acciones»", async () => {
    conVista(null);
    montar();
    await waitFor(() => expect(getVista).toHaveBeenCalled());

    abrirMenu();
    const menu = await screen.findByRole("menu");
    fireEvent.keyDown(within(menu).getAllByRole("menuitem")[0], { key: "Tab" });

    expect(screen.queryByRole("menu")).toBeNull();
    expect(screen.getByRole("button", { name: "Más acciones" })).toHaveFocus();
  });

  test("una acción del menú se ejecuta y el menú se cierra", async () => {
    conVista({ acciones: { detalle: [] } });
    montar();
    await waitFor(() => expect(botones()).toEqual(["Más acciones"]));

    abrirMenu();
    fireEvent.click(await screen.findByRole("menuitem", { name: "Imprimir" }));

    expect(imprimir).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("menu")).toBeNull();
  });

  test("personalizar: destacar una acción guarda sin perder el resto de la vista", async () => {
    conVista({ tabla: { columnas: ["codigo"] }, acciones: { detalle: ["imprimir"] } });
    montar();
    await waitFor(() => expect(botones()).toEqual(["Imprimir", "Más acciones"]));

    abrirMenu();
    fireEvent.click(await screen.findByRole("menuitem", { name: "Personalizar botones…" }));
    const panel = await screen.findByRole("dialog", { name: "Botones destacados" });
    // Solo las acciones con id.
    expect(within(panel).getAllByRole("checkbox")).toHaveLength(4);

    fireEvent.click(within(panel).getByRole("checkbox", { name: "Documentos relacionados" }));
    await waitFor(() =>
      expect(botones()).toEqual(["Imprimir", "Documentos relacionados", "Más acciones"])
    );
    expect(guardarVista).toHaveBeenLastCalledWith(
      "ventas.pedido",
      { tabla: { columnas: ["codigo"] }, acciones: { detalle: ["imprimir", "relacionados"] } },
      ""
    );

    fireEvent.click(within(panel).getByRole("button", { name: "Subir Documentos relacionados" }));
    await waitFor(() =>
      expect(botones()).toEqual(["Documentos relacionados", "Imprimir", "Más acciones"])
    );
  });

  test("restaurar quita solo la configuración de este grupo", async () => {
    conVista({ tabla: { columnas: ["codigo"] }, acciones: { detalle: ["borrar"], otro: ["x"] } });
    montar();
    await waitFor(() => expect(botones()).toEqual(["Borrar", "Más acciones"]));

    abrirMenu();
    fireEvent.click(await screen.findByRole("menuitem", { name: "Personalizar botones…" }));
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Restaurar botones por defecto" }));
    });

    expect(guardarVista).toHaveBeenLastCalledWith(
      "ventas.pedido",
      { tabla: { columnas: ["codigo"] }, acciones: { otro: ["x"] } },
      ""
    );
    await waitFor(() => expect(botones()).toEqual(["Imprimir", "Más acciones"]));
  });

  test("en móvil, los botones solo con icono y nombre accesible", async () => {
    comoMovil(true);
    conVista({ acciones: { detalle: ["imprimir", "borrar"] } });
    montar();

    const boton = await screen.findByRole("button", { name: "Imprimir" });
    expect(boton.textContent).toBe("");
    expect(boton).toHaveAttribute("title", "Imprimir");
  });

  test("sin servidor no se ofrece personalizar", async () => {
    getVista.mockRejectedValue({ estado: 500 });
    montar();
    await waitFor(() => expect(getVista).toHaveBeenCalled());

    abrirMenu();
    const menu = await screen.findByRole("menu");
    expect(within(menu).queryByRole("menuitem", { name: "Personalizar botones…" })).toBeNull();
  });

  test("lo que no cabe pasa al menú", async () => {
    // Contenedor de 250 px y cada botón de 100 px (hueco 0): caben dos con el «más».
    let avisar: ResizeObserverCallback = () => undefined;
    vi.stubGlobal(
      "ResizeObserver",
      class {
        constructor(cb: ResizeObserverCallback) {
          avisar = cb;
        }
        observe() {}
        disconnect() {}
      }
    );
    const ancho = vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockReturnValue(100);
    try {
      conVista({ acciones: { detalle: ["imprimir", "relacionados", "borrar"] } });
      montar();
      await waitFor(() => expect(botones()).toHaveLength(4));

      act(() =>
        avisar(
          [{ contentRect: { width: 250 } } as ResizeObserverEntry],
          {} as ResizeObserver
        )
      );

      await waitFor(() => expect(botones()).toEqual(["Imprimir", "Más acciones"]));
      abrirMenu();
      const menu = await screen.findByRole("menu");
      expect(within(menu).getAllByRole("menuitem")[0]).toHaveTextContent("Documentos relacionados");
    } finally {
      ancho.mockRestore();
      vi.unstubAllGlobals();
    }
  });

  test("avisa en desarrollo de una acción con id sin icono", async () => {
    const aviso = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    conVista(null);
    render(
      <QuimeraAcciones
        acciones={[{ id: "rara", texto: "Rara", onClick: vi.fn() }]}
        pantalla="ventas.pedido"
        grupo="detalle"
      />
    );
    await waitFor(() => expect(getVista).toHaveBeenCalled());

    expect(aviso).toHaveBeenCalledWith(expect.stringContaining("«rara»"));
    aviso.mockRestore();
  });
});
