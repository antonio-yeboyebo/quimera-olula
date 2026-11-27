import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { Criteria } from "@olula/lib/diseño.ts";
import { MetaTabla } from "../atomos/qtablacontrolada.tsx";
import { Listado } from "../maestro/Listado.tsx";
import { ConfigWidgets } from "../maestro/widgets/diseño.ts";
import * as infra from "./infraestructura.ts";
import { reiniciarModoPersonalizar } from "./modo_personalizar.ts";
import { BotonPersonalizar } from "./PanelPersonalizar.tsx";
import { olvidarPreferenciasVista } from "./usePreferenciasVista.ts";

vi.mock("./infraestructura.ts", () => ({
  getVistaUsuario: vi.fn(),
  guardarVistaUsuario: vi.fn(),
  restaurarVistaUsuario: vi.fn(),
  getVistasGuardadas: vi.fn(),
}));

// Los widgets del usuario se pueden personalizar (servidor disponible), sin ninguno elegido.
vi.mock("../maestro/widgets/useWidgetsUsuario.ts", () => ({
  useWidgetsUsuario: (config: ConfigWidgets | undefined) => ({
    widgets: config?.widgets ?? [],
    origen: null,
    personalizable: true,
    guardar: vi.fn(),
    restaurar: vi.fn(),
  }),
}));
vi.mock("../maestro/widgets/useTotalesWidgets.ts", () => ({
  useTotalesWidgets: () => ({ valores: {}, series: {}, cargando: false }),
}));

type Pedido = { id: string; codigo: string };
const metaTabla: MetaTabla<Pedido> = [{ id: "codigo", cabecera: "Código" }];
const criteria: Criteria = { filtro: [], orden: ["id", "DESC"], paginacion: { pagina: 1, limite: 20 } };
const widgets: ConfigWidgets = { recurso: "ventas.pedido", titulo: "Pedidos", widgets: [], campos: [] };

const montar = (pantalla?: string) =>
  render(
    <>
      <BotonPersonalizar />
      <Listado<Pedido>
        metaTabla={metaTabla}
        criteria={criteria}
        criteriaInicial={criteria}
        entidades={[{ id: "p1", codigo: "PED-1" }]}
        totalEntidades={1}
        modoInicial="tabla"
        onSeleccion={() => {}}
        onCriteriaChanged={() => {}}
        widgets={widgets}
        pantalla={pantalla}
      />
    </>
  );

beforeEach(() => {
  vi.clearAllMocks();
  olvidarPreferenciasVista();
  reiniciarModoPersonalizar();
  vi.mocked(infra.getVistaUsuario).mockResolvedValue({
    pantalla: "ventas.pedido",
    vista: "",
    config: null,
    origen: null,
  });
  vi.mocked(infra.getVistasGuardadas).mockResolvedValue([]);
});

describe("widgets y panel personalizar", () => {
  test("sin panel (pantalla sin personalización), el resumen ofrece añadir widgets", () => {
    montar();
    expect(screen.getByRole("button", { name: "Añadir widgets" })).toBeInTheDocument();
  });

  test("con panel, se personalizan desde allí y el resumen no tiene botón propio", async () => {
    montar("ventas.pedido");

    fireEvent.click(await screen.findByRole("button", { name: "Personalizar pantalla" }));
    const panel = screen.getByRole("complementary", { name: "Personalizar pantalla" });
    expect(within(panel).getByRole("button", { name: "Personalizar widgets…" })).toBeInTheDocument();

    await waitFor(() =>
      expect(screen.queryByRole("button", { name: /Añadir widgets|^Personalizar$/ })).toBeNull()
    );
    // Sin widgets elegidos tampoco queda el bloque vacío del resumen.
    expect(screen.queryByRole("heading", { name: /Resumen/ })).toBeNull();
  });
});
