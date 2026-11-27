import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { Criteria } from "@olula/lib/diseño.ts";
import { MetaTabla } from "../atomos/qtablacontrolada.tsx";
import { Listado } from "../maestro/Listado.tsx";
import { QuimeraAcciones } from "../moleculas/qacciones.tsx";
import { ConfigVista } from "./diseño.ts";
import * as infra from "./infraestructura.ts";
import { reiniciarModoPersonalizar } from "./modo_personalizar.ts";
import { BotonPersonalizar } from "./PanelPersonalizar.tsx";
import { olvidarPreferenciasVista } from "./usePreferenciasVista.ts";

vi.mock("./infraestructura.ts", () => ({
  getVistaUsuario: vi.fn(),
  guardarVistaUsuario: vi.fn(),
  restaurarVistaUsuario: vi.fn(),
}));

const getVista = vi.mocked(infra.getVistaUsuario);
const guardarVista = vi.mocked(infra.guardarVistaUsuario);

type Pedido = { id: string; codigo: string; cliente: string; total: number };

const metaTabla: MetaTabla<Pedido> = [
  { id: "codigo", cabecera: "Código" },
  { id: "cliente", cabecera: "Cliente" },
  { id: "total", cabecera: "Total" },
];

const criteria: Criteria = { filtro: [], orden: ["id", "DESC"], paginacion: { pagina: 1, limite: 20 } };

const conVista = (config: ConfigVista | null) =>
  getVista.mockResolvedValue({
    pantalla: "ventas.pedido", vista: "", config, origen: config ? "usuario" : null,
  });

const Pantalla = ({ conListado = true }: { conListado?: boolean }) => (
  <>
    <BotonPersonalizar />
    {conListado && (
      <Listado<Pedido>
        metaTabla={metaTabla}
        criteria={criteria}
        criteriaInicial={criteria}
        entidades={[{ id: "p1", codigo: "PED-1", cliente: "Acme", total: 100 }]}
        totalEntidades={1}
        modoInicial="tabla"
        onSeleccion={() => {}}
        onCriteriaChanged={() => {}}
        pantalla="ventas.pedido"
      />
    )}
    <QuimeraAcciones
      acciones={[
        { id: "imprimir", icono: "imprimir", texto: "Imprimir", onClick: vi.fn() },
        { id: "borrar", icono: "eliminar", texto: "Borrar", advertencia: true, onClick: vi.fn() },
      ]}
      pantalla="ventas.pedido"
      grupo="detalle"
    />
  </>
);

const abrirPanel = async () => {
  fireEvent.click(await screen.findByRole("button", { name: "Personalizar pantalla" }));
  return screen.getByRole("complementary", { name: "Personalizar pantalla" });
};

const seccion = (panel: HTMLElement, titulo: string) =>
  within(panel).getByRole("heading", { name: titulo }).closest("section")!;

beforeEach(() => {
  vi.clearAllMocks();
  olvidarPreferenciasVista();
  reiniciarModoPersonalizar();
  guardarVista.mockResolvedValue(undefined);
});

describe("modo personalizar", () => {
  test("sin nada personalizable en la pantalla no hay botón", async () => {
    getVista.mockRejectedValue({ estado: 500 });
    render(<Pantalla />);
    await waitFor(() => expect(getVista).toHaveBeenCalled());

    expect(screen.queryByRole("button", { name: "Personalizar pantalla" })).toBeNull();
  });

  test("el panel tiene una sección por componente y marca lo personalizable", async () => {
    conVista(null);
    const { container } = render(<Pantalla />);
    const panel = await abrirPanel();

    expect(within(panel).getAllByRole("heading", { level: 3 }).map((h) => h.textContent)).toEqual([
      "Listado",
      "Botones del documento",
    ]);
    expect(container.querySelector(".Listado")).toHaveAttribute("data-personalizable");

    fireEvent.mouseEnter(seccion(panel, "Listado"));
    expect(container.querySelector(".Listado")).toHaveAttribute("data-personalizable-resaltado");
  });

  test("columnas y botones se cambian desde el panel sin pisarse", async () => {
    conVista({ acciones: { detalle: ["imprimir"] } });
    render(<Pantalla />);
    const panel = await abrirPanel();

    fireEvent.click(within(seccion(panel, "Listado")).getByRole("checkbox", { name: "Total" }));
    expect(guardarVista).toHaveBeenLastCalledWith(
      "ventas.pedido",
      expect.objectContaining({
        acciones: { detalle: ["imprimir"] },
        tabla: expect.objectContaining({ columnas: ["codigo", "cliente"] }),
      }),
      ""
    );

    fireEvent.click(
      within(seccion(panel, "Botones del documento")).getByRole("checkbox", { name: "Borrar" })
    );
    expect(guardarVista).toHaveBeenLastCalledWith(
      "ventas.pedido",
      expect.objectContaining({
        acciones: { detalle: ["imprimir", "borrar"] },
        tabla: expect.objectContaining({ columnas: ["codigo", "cliente"] }),
      }),
      ""
    );
  });

  test("la plantilla de tarjeta se elige desde el panel, en modo tarjetas", async () => {
    conVista(null);
    render(<Pantalla />);
    const listado = seccion(await abrirPanel(), "Listado");

    // En modo tabla la tarjeta no se ve: se avisa y se ofrece cambiar.
    expect(within(listado).queryByRole("combobox", { name: "Título" })).toBeNull();
    fireEvent.click(within(listado).getByRole("button", { name: "Ver como tarjetas" }));

    fireEvent.change(within(listado).getByRole("combobox", { name: "Título" }), {
      target: { value: "cliente" },
    });
    expect(guardarVista).toHaveBeenLastCalledWith(
      "ventas.pedido",
      expect.objectContaining({ tarjeta: { titulo: "cliente", campos: [] } }),
      ""
    );
    // Los campos aparecen de uno en uno: el segundo cuando hay primero.
    expect(within(listado).getByRole("combobox", { name: "Campo 1" })).toBeInTheDocument();
    expect(within(listado).queryByRole("combobox", { name: "Campo 2" })).toBeNull();
  });

  test("pasar por otra sección no le quita el foco al control", async () => {
    conVista(null);
    render(<Pantalla />);
    const panel = await abrirPanel();

    const casilla = within(seccion(panel, "Botones del documento")).getByRole("checkbox", {
      name: "Imprimir",
    });
    act(() => casilla.focus());
    fireEvent.mouseEnter(seccion(panel, "Listado"));
    fireEvent.mouseLeave(seccion(panel, "Listado"));

    expect(casilla).toHaveFocus();
  });

  test("Escape con un diálogo abierto no cierra el panel", async () => {
    conVista(null);
    render(<Pantalla />);
    await abrirPanel();

    const dialogo = document.createElement("dialog");
    dialogo.setAttribute("open", "");
    document.body.appendChild(dialogo);
    try {
      act(() => {
        fireEvent.keyDown(document, { key: "Escape" });
      });
      expect(screen.getByRole("complementary")).toBeInTheDocument();
    } finally {
      dialogo.remove();
    }
  });

  test("al abrir el menú de usuario u otro panel lateral, el panel se cierra", async () => {
    conVista(null);
    render(<Pantalla />);
    await abrirPanel();

    act(() => {
      window.dispatchEvent(
        new CustomEvent("quimera:panel-lateral-abierto", { detail: "usuario" })
      );
    });
    expect(screen.queryByRole("complementary")).toBeNull();
  });

  test("Escape cierra el panel y devuelve el foco al botón", async () => {
    conVista(null);
    render(<Pantalla />);
    await abrirPanel();

    act(() => {
      fireEvent.keyDown(document, { key: "Escape" });
    });
    expect(screen.queryByRole("complementary")).toBeNull();
    expect(screen.getByRole("button", { name: "Personalizar pantalla" })).toHaveFocus();
  });

  test("al salir de la pantalla se va su sección", async () => {
    conVista(null);
    const { rerender } = render(<Pantalla />);
    const panel = await abrirPanel();
    expect(within(panel).getByRole("heading", { name: "Listado" })).toBeInTheDocument();

    rerender(<Pantalla conListado={false} />);
    expect(within(panel).queryByRole("heading", { name: "Listado" })).toBeNull();
  });
});
