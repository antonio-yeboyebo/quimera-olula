import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { Detalle } from "@olula/componentes/detalle/Detalle.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { QuimeraAcciones } from "@olula/componentes/moleculas/qacciones.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { formatearFechaDate, puede } from "@olula/lib/dominio.ts";
import { useEffect } from "react";
import { FilaFormulario } from "#/contabilidad/comun/componentes/FilaFormulario.tsx";
import { AsientosEjercicio } from "../asientos/AsientosEjercicio.tsx";
import { CerrarEjercicio } from "../cerrar/CerrarEjercicio.tsx";
import { DeshacerCierreEjercicio } from "../deshacer_cierre/DeshacerCierreEjercicio.tsx";
import { Ejercicio } from "../diseño.ts";
import {
    etiquetaEjercicio,
    puedeCerrar,
    puedeReabrir,
    textoEstadoEjercicio,
} from "../dominio.ts";
import { contextoDetalleEjercicioInicial } from "./detalle.ts";
import { getMaquina } from "./maquina.ts";
import { useTContabilidad } from "../../i18n/index.ts";

export interface PropsDetalleEjercicio {
    id?: string;
    ejercicios: Ejercicio[];
    publicar?: EmitirEvento;
}

/** Contabilidad > Apertura y Cierre de Ejercicio: datos del ejercicio, que
 * aquí no se cambian, y los asientos de apertura, regularización y cierre. */
export const DetalleEjercicio = ({
    id,
    ejercicios,
    publicar = async () => {},
}: PropsDetalleEjercicio) => {
    const t = useTContabilidad();
    const { ctx, emitir } = useMaquina(getMaquina, contextoDetalleEjercicioInicial, publicar);
    const { estado, ejercicio } = ctx;

    useEffect(() => {
        emitir("ejercicio_id_cambiada", id, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    if (!ejercicio.id) return null;

    const autorizado = puede("contabilidad.asiento");

    const acciones = [
        { texto: t("ejercicio.cerrarEjercicio"), onClick: () => emitir("cierre_solicitado"),
            deshabilitado: !autorizado || !puedeCerrar(ejercicio) },
        { texto: t("ejercicio.reabrirEjercicio"), onClick: () => emitir("deshacer_cierre_solicitado"),
            deshabilitado: !autorizado || !puedeReabrir(ejercicio), advertencia: true },
    ];

    const campo = (label: string, nombre: string, valor: string) => (
        <QInput label={label} nombre={nombre} valor={valor} soloLectura />
    );

    return (
        <Detalle
            id={id}
            obtenerTitulo={etiquetaEjercicio}
            setEntidad={() => {}}
            entidad={ejercicio}
            cerrarDetalle={() => emitir("ejercicio_deseleccionado", null, true)}
        >
            <div className="DetalleEjercicio">
                <div className="maestro-botones">
                    <QuimeraAcciones acciones={acciones} vertical />
                </div>
                <quimera-formulario>
                    <FilaFormulario columnas="1fr 3fr 1.5fr 1.5fr 1.5fr">
                        {campo(t("ejercicio.codigo"), "id", ejercicio.id)}
                        {campo(t("ejercicio.nombre"), "nombre", ejercicio.nombre)}
                        {campo(t("ejercicio.inicio"), "fechaInicio", formatearFechaDate(ejercicio.fechaInicio))}
                        {campo(t("ejercicio.fin"), "fechaFin", formatearFechaDate(ejercicio.fechaFin))}
                        {campo(t("ejercicio.estado"), "estado", textoEstadoEjercicio(ejercicio.estado))}
                    </FilaFormulario>
                </quimera-formulario>
                <AsientosEjercicio ejercicio={ejercicio} />
            </div>

            {estado === "CERRANDO" && (
                <CerrarEjercicio ejercicio={ejercicio} ejercicios={ejercicios} publicar={emitir} />
            )}
            {estado === "DESHACIENDO" && (
                <DeshacerCierreEjercicio ejercicio={ejercicio} ejercicios={ejercicios} publicar={emitir} />
            )}
        </Detalle>
    );
};
