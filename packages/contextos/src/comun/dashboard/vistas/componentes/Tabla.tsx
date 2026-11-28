import { MetaTabla, QTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { pareceImporte } from "@olula/componentes/maestro/widgets/dominio.ts";
import { Entidad } from "@olula/lib/diseño.ts";
import { Link, useNavigate } from "react-router";
import {
  ComponenteDashboard,
  RecursoAgregable,
  RespuestaAgregado,
} from "../../diseño.ts";
import { useTComun } from "../../../i18n/index.ts";

type FilaDashboard = Entidad & Record<string, string | number | boolean | null>;

const SIN_ID = "__sin_id__";

/** `/ventas/pedido` desde el recurso, o a partir de `ventas.pedido` / `ventas.pedido.linea`. */
const rutaRecurso = (
  recurso: RecursoAgregable | undefined,
  recursoId: string
): string | undefined => {
  if (recurso?.ruta) return recurso.ruta;
  const partes = recursoId.split(".").filter(Boolean);
  if (partes.length < 2) return undefined;
  return `/${partes[0]}/${partes[1]}`;
};

const idFila = (fila: Record<string, string | number | boolean | null>, indice: number): string => {
  const crudo = fila.id;
  if (crudo != null && crudo !== "") return String(crudo);
  return `${SIN_ID}${indice}`;
};

const tipoColumna = (
  id: string,
  recurso: RecursoAgregable | undefined
): NonNullable<MetaTabla<FilaDashboard>[number]["tipo"]> => {
  if (recurso?.medidas.some((m) => m.id === id)) {
    return pareceImporte(id) ? "moneda" : "numero";
  }
  const dim = recurso?.dimensiones.find((d) => d.id === id);
  if (dim?.tipo === "fecha") return "fecha";
  if (dim?.tipo === "numero") return "numero";
  if (dim?.tipo === "booleano") return "booleano";
  return "texto";
};

const etiquetaColumna = (id: string, recurso: RecursoAgregable | undefined) =>
  recurso?.dimensiones.find((d) => d.id === id)?.descripcion ??
  recurso?.medidas.find((m) => m.id === id)?.descripcion ??
  id;

const filasDesdeRespuesta = (respuesta: RespuestaAgregado): FilaDashboard[] =>
  respuesta.grupos.map((fila, i) => ({
    ...fila,
    id: idFila(fila, i),
  }));

const metaDesdeColumnas = (
  columnas: string[],
  recurso: RecursoAgregable | undefined
): MetaTabla<FilaDashboard> =>
  columnas.map((id) => ({
    id,
    cabecera: etiquetaColumna(id, recurso),
    tipo: tipoColumna(id, recurso),
  }));

/** Filas de un listado con su filtro; QTabla como en los maestros. Clic en la fila abre la ficha. */
export const Tabla = ({
  componente,
  respuesta,
  recurso,
}: {
  componente: ComponenteDashboard;
  respuesta: RespuestaAgregado;
  recurso: RecursoAgregable | undefined;
}) => {
  const t = useTComun();
  const navegar = useNavigate();
  const recursoId = componente.consultas[0]?.recurso ?? "";
  const ruta = rutaRecurso(recurso, recursoId);
  const columnas = (componente.consultas[0].columnas ?? "").split(",").filter(Boolean);
  const datos = filasDesdeRespuesta(respuesta);
  const metaTabla = metaDesdeColumnas(columnas, recurso);

  return (
    <div className="dashboard-tabla">
      <QTabla
        metaTabla={metaTabla}
        datos={datos}
        cargando={false}
        orden={["", "ASC"]}
        onSeleccion={
          ruta
            ? (fila) => {
                // Los maestros abren el detalle con `?id=`, no con un segmento de la ruta.
                if (!fila.id.startsWith(SIN_ID)) {
                  navegar(`${ruta}?id=${encodeURIComponent(fila.id)}`);
                }
              }
            : undefined
        }
      />
      {respuesta.truncado && ruta && (
        <Link className="dashboard-tabla-mas" to={ruta}>
          {t("dashboard.verLas")}{" "}{respuesta.total_grupos}
          {recurso ? ` en ${recurso.descripcion.split(" (")[0]}` : ""} →
        </Link>
      )}
    </div>
  );
};
