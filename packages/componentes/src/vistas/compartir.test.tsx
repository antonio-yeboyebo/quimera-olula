import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { Criteria } from "@olula/lib/diseño.ts";
import { MetaTabla } from "../atomos/qtablacontrolada.tsx";
import { Listado } from "../maestro/Listado.tsx";
import { VistaCompartida } from "./diseño.ts";
import * as infra from "./infraestructura.ts";
import { reiniciarModoPersonalizar } from "./modo_personalizar.ts";
import { BotonPersonalizar } from "./PanelPersonalizar.tsx";
import { olvidarPreferenciasVista } from "./usePreferenciasVista.ts";

vi.mock("./infraestructura.ts", () => ({
  getVistaUsuario: vi.fn(),
  guardarVistaUsuario: vi.fn(),
  restaurarVistaUsuario: vi.fn(),
  getVistasGuardadas: vi.fn(),
  getVistasCompartidas: vi.fn(),
  guardarVistaCompartida: vi.fn(),
  borrarVistaCompartida: vi.fn(),
  getGrupos: vi.fn(),
}));

const m = vi.mocked(infra);

type Pedido = { id: string; codigo: string; cliente: string };
const metaTabla: MetaTabla<Pedido> = [
  { id: "codigo", cabecera: "Código" },
  { id: "cliente", cabecera: "Cliente" },
];
const criteria: Criteria = { filtro: [], orden: ["id", "DESC"], paginacion: { pagina: 1, limite: 20 } };

const montar = async () => {
  render(
    <>
      <BotonPersonalizar />
      <Listado<Pedido>
        metaTabla={metaTabla}
        criteria={criteria}
        criteriaInicial={criteria}
        entidades={[{ id: "p1", codigo: "PED-1", cliente: "Acme" }]}
        totalEntidades={1}
        modoInicial="tabla"
        onSeleccion={() => {}}
        onCriteriaChanged={() => {}}
        pantalla="ventas.pedido"
      />
    </>
  );
  fireEvent.click(await screen.findByRole("button", { name: "Personalizar pantalla" }));
  return screen.getByRole("complementary", { name: "Personalizar pantalla" });
};

const conCompartidas = (compartidas: VistaCompartida[]) =>
  m.getVistasCompartidas.mockResolvedValue(compartidas);

beforeEach(() => {
  vi.clearAllMocks();
  olvidarPreferenciasVista();
  reiniciarModoPersonalizar();
  m.getVistaUsuario.mockResolvedValue({
    pantalla: "ventas.pedido",
    vista: "",
    config: { tabla: { columnas: ["cliente"] } },
    origen: "usuario",
  });
  m.getVistasGuardadas.mockResolvedValue([]);
  m.guardarVistaCompartida.mockResolvedValue(undefined);
  m.borrarVistaCompartida.mockResolvedValue(undefined);
  m.getGrupos.mockResolvedValue([{ id: "comercial", nombre: "Comercial" }]);
});

describe("compartir vistas", () => {
  test("sin la regla (el servidor no deja leer lo compartido) no aparece", async () => {
    m.getVistasCompartidas.mockRejectedValue({ estado: 403 });
    const panel = await montar();

    await waitFor(() => expect(m.getVistasCompartidas).toHaveBeenCalled());
    expect(within(panel).queryByRole("heading", { name: "Compartir" })).toBeNull();
  });

  test("comparte la vista de ahora con un grupo", async () => {
    conCompartidas([]);
    const panel = await montar();

    await within(panel).findByRole("heading", { name: "Compartir" });
    // Sin elegir con quién no se puede compartir.
    expect(within(panel).getByRole("button", { name: "Compartir" })).toBeDisabled();
    fireEvent.change(within(panel).getByRole("combobox", { name: "Compartir con" }), {
      target: { value: "comercial" },
    });
    await act(async () => {
      fireEvent.click(
        within(panel).getByRole("button", { name: "Compartir con el grupo Comercial" })
      );
    });

    expect(m.guardarVistaCompartida).toHaveBeenCalledWith("ventas.pedido", {
      vista: "",
      grupo_id: "comercial",
      config: expect.objectContaining({
        tabla: expect.objectContaining({ columnas: ["cliente"], orden: ["id", "DESC"] }),
      }),
    });
    // Tras compartir se vuelve a leer lo compartido y lo que ve el usuario.
    expect(m.getVistasCompartidas).toHaveBeenCalledTimes(2);
    await waitFor(() => expect(m.getVistaUsuario).toHaveBeenCalledTimes(2));
    expect(within(panel).getByRole("status")).toHaveTextContent(
      "«Vista por defecto» compartida con el grupo Comercial."
    );
  });

  test("bloquear guarda la fila de empresa de la vista por defecto con bloqueada", async () => {
    conCompartidas([
      { vista: "", grupo_id: null, nombre: null, bloqueada: false, config: { modo: "tabla" } },
    ]);
    const panel = await montar();

    const casilla = await within(panel).findByRole("checkbox", {
      name: /Bloquear la personalización/,
    });
    await act(async () => {
      fireEvent.click(casilla);
    });

    expect(m.guardarVistaCompartida).toHaveBeenCalledWith("ventas.pedido", {
      vista: "",
      grupo_id: null,
      config: { modo: "tabla" },
      bloqueada: true,
    });
  });

  test("mientras se guarda, la casilla de bloqueo no admite otro clic", async () => {
    conCompartidas([]);
    let terminar: () => void = () => undefined;
    m.guardarVistaCompartida.mockReturnValue(new Promise<void>((r) => (terminar = r)));
    const panel = await montar();

    const casilla = await within(panel).findByRole("checkbox", {
      name: /Bloquear la personalización/,
    });
    fireEvent.click(casilla);
    fireEvent.click(casilla);
    expect(m.guardarVistaCompartida).toHaveBeenCalledTimes(1);
    expect(casilla).toBeDisabled();

    await act(async () => terminar());
    await waitFor(() => expect(casilla).not.toBeDisabled());
  });

  test("quitar lo compartido con un grupo", async () => {
    conCompartidas([
      { vista: "grandes", grupo_id: "comercial", nombre: "Grandes", bloqueada: false, config: {} },
    ]);
    const panel = await montar();

    const quitar = await within(panel).findByRole("button", {
      name: "Quitar «Grandes», compartida con el grupo Comercial",
    });
    await act(async () => {
      fireEvent.click(quitar);
    });
    expect(m.borrarVistaCompartida).toHaveBeenCalledWith("ventas.pedido", "grandes", "comercial");
  });
});
