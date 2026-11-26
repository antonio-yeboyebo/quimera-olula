import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { formatearNumero } from "@olula/lib/dominio.ts";
import { BorrarLineaInventario } from "../../borrar_linea/BorrarLineaInventario.tsx";
import { CambiarLineaInventario } from "../../cambiar_linea/CambiarLineaInventario.tsx";
import { CargarFicheroInventario } from "../../cargar_fichero/CargarFicheroInventario.tsx";
import { CrearLineaInventario } from "../../crear_linea/CrearLineaInventario.tsx";
import { Inventario, LineaInventario } from "../../diseño.ts";
import { EstadoDetalleInventario } from "../diseño.ts";
import { totalesLineas } from "../dominio.ts";
import { LineasLista } from "./LineasLista.tsx";
import { tAlmacen } from "../../../i18n/index.ts";

/** Orquestador de las líneas: botones, tabla y modales de alta, cambio, borrado y carga. */
export const LineasInventario = ({
    inventario,
    lineas,
    lineaActiva,
    estado,
    publicar,
}: {
    inventario: Inventario;
    lineas: LineaInventario[];
    lineaActiva: LineaInventario | null;
    estado: EstadoDetalleInventario;
    publicar: EmitirEvento;
}) => {
    const totales = totalesLineas(lineas);
    return (
        <div className="LineasInventario">
            <div className="cabecera-lineas">
                <h4>
                    {tAlmacen("inventario.lineas")}{formatearNumero(totales.lineas)}{tAlmacen("inventario.contado")}{" "}{formatearNumero(totales.contado)}{" "}{tAlmacen("inventario.diferencia")}{" "}{totales.diferencia > 0 ? "+" : ""}{formatearNumero(totales.diferencia)}
                </h4>
                <div className="botones maestro-botones">
                    <QBoton onClick={() => publicar("crear_linea_solicitado")}>{tAlmacen("inventario.nuevaLinea")}</QBoton>
                    <QBoton onClick={() => publicar("cambio_linea_solicitado")} deshabilitado={!lineaActiva}>
                        {tAlmacen("inventario.editar")}
                    </QBoton>
                    <QBoton onClick={() => publicar("borrar_linea_solicitado")} deshabilitado={!lineaActiva}>
                        {tAlmacen("inventario.borrarLinea")}
                    </QBoton>
                    <QBoton variante="borde" onClick={() => publicar("cargar_fichero_solicitado")}>
                        {tAlmacen("inventario.cargarFichero")}
                    </QBoton>
                </div>
            </div>
            <LineasLista lineas={lineas} seleccionada={lineaActiva?.id} publicar={publicar} />

            {estado === "CREANDO_LINEA" && (
                <CrearLineaInventario inventario={inventario} publicar={publicar} />
            )}
            {estado === "CAMBIANDO_LINEA" && lineaActiva && (
                <CambiarLineaInventario inventario={inventario} linea={lineaActiva} publicar={publicar} />
            )}
            {estado === "BORRANDO_LINEA" && lineaActiva && (
                <BorrarLineaInventario inventario={inventario} linea={lineaActiva} publicar={publicar} />
            )}
            {estado === "CARGANDO_FICHERO" && (
                <CargarFicheroInventario inventario={inventario} publicar={publicar} />
            )}
        </div>
    );
};
