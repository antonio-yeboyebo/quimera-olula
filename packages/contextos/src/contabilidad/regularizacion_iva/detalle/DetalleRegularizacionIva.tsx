import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { Detalle } from "@olula/componentes/detalle/Detalle.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { QuimeraAcciones } from "@olula/componentes/moleculas/qacciones.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { formatearFechaDate, puede } from "@olula/lib/dominio.ts";
import { AsientoDeDocumento } from "#/contabilidad/asiento/vistas/detalle/AsientoDeDocumento.tsx";
import { useEffect } from "react";
import { BorrarRegularizacionIva } from "../borrar/BorrarRegularizacionIva.tsx";
import { etiquetaRegularizacionIva } from "../dominio.ts";
import { contextoDetalleRegularizacionIvaInicial } from "./detalle.ts";
import "./DetalleRegularizacionIva.css";
import { getMaquina } from "./maquina.ts";
import { useTContabilidad } from "../../i18n/index.ts";

/** Solo lectura, como el formulario de Eneboo una vez calculado: para
 * rehacer una regularización se borra (con su asiento) y se vuelve a crear. */
export const DetalleRegularizacionIva = ({
    id,
    publicar = async () => {},
}: {
    id?: string;
    publicar?: EmitirEvento;
}) => {

    const t = useTContabilidad();
    const { ctx, emitir } = useMaquina(
        getMaquina,
        contextoDetalleRegularizacionIvaInicial,
        publicar
    );

    const { estado, regularizacion } = ctx;

    useEffect(() => {
        emitir("regularizacion_iva_id_cambiada", id, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    if (!regularizacion.id) return null;

    const acciones = [
        {
            texto: t("regularizacion_iva.borrar"),
            onClick: () => emitir("borrado_solicitado"),
            deshabilitado: !puede("contabilidad.asiento"),
            advertencia: true,
        },
    ];

    const campo = (label: string, nombre: string, valor: string) => (
        <QInput label={label} nombre={nombre} valor={valor} soloLectura />
    );

    return (
        <Detalle
            id={id}
            obtenerTitulo={etiquetaRegularizacionIva}
            setEntidad={() => {}}
            entidad={regularizacion}
            cerrarDetalle={() =>
                emitir("regularizacion_iva_deseleccionada", null, true)
            }
        >
            <div className="DetalleRegularizacionIva">
                <div className="maestro-botones">
                    <QuimeraAcciones acciones={acciones} vertical />
                </div>
                <quimera-formulario>
                    {campo(t("regularizacion_iva.ejercicio"), "ejercicioId", regularizacion.ejercicioId)}
                    {campo(t("regularizacion_iva.periodo"), "periodo", regularizacion.periodo)}
                    {campo(t("regularizacion_iva.fechaDesde"), "fechaInicio", formatearFechaDate(regularizacion.fechaInicio))}
                    {campo(t("regularizacion_iva.fechaHasta"), "fechaFin", formatearFechaDate(regularizacion.fechaFin))}
                    {campo(t("regularizacion_iva.subcuentaHPDeudora"), "codigoSubcuentaDeudora", regularizacion.codigoSubcuentaDeudora)}
                    {campo(t("regularizacion_iva.subcuentaHPAcreedora"), "codigoSubcuentaAcreedora", regularizacion.codigoSubcuentaAcreedora)}
                    {campo(t("regularizacion_iva.nDeAsiento"), "numeroAsiento", String(regularizacion.numeroAsiento ?? ""))}
                    {campo(t("regularizacion_iva.fechaDeAsiento"), "fechaAsiento", formatearFechaDate(regularizacion.fechaAsiento))}
                </quimera-formulario>
                <AsientoDeDocumento
                    asientoId={regularizacion.asientoId || null}
                    conCabecera={false}
                />
            </div>

            {estado === "BORRANDO" && (
                <BorrarRegularizacionIva
                    regularizacion={regularizacion}
                    publicar={emitir}
                />
            )}
        </Detalle>
    );
};
