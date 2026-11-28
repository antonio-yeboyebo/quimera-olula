import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { MetaTabla, QTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback, useEffect, useState } from "react";
import { CrearDotacion } from "../../crear_dotacion/CrearDotacion.tsx";
import { Amortizacion, Dotacion } from "../../diseño.ts";
import { esCerrada } from "../../dominio.ts";
import { deleteDotacion, getDotaciones } from "../../infraestructura.ts";
import { tContabilidad, useTContabilidad } from "../../../i18n/index.ts";

const metaTablaDotaciones: MetaTabla<Dotacion> = [
    { id: "fechaInicio", get cabecera() { return tContabilidad("amortizacion.desde"); }, tipo: "fecha" },
    { id: "fechaFin", get cabecera() { return tContabilidad("amortizacion.hasta"); }, tipo: "fecha" },
    { id: "fecha", get cabecera() { return tContabilidad("amortizacion.fechaAsiento"); }, tipo: "fecha" },
    { id: "importe", get cabecera() { return tContabilidad("amortizacion.importe"); }, tipo: "moneda" },
    { id: "porcentaje", cabecera: "%", tipo: "numero" },
    { id: "acumulado", get cabecera() { return tContabilidad("amortizacion.acumulado"); }, tipo: "moneda" },
    { id: "resto", get cabecera() { return tContabilidad("amortizacion.resto"); }, tipo: "moneda" },
    { id: "numeroAsiento", get cabecera() { return tContabilidad("amortizacion.asiento"); }, tipo: "numero" },
    { id: "ejercicioAsiento", get cabecera() { return tContabilidad("amortizacion.ejercicio"); } },
];

type Estado = "INICIAL" | "CREANDO" | "BORRANDO";

const BorrarDotacion = ({
    dotacion, onBorrada, onCancelar,
}: { dotacion: Dotacion; onBorrada: () => void; onCancelar: () => void }) => {
    const t = useTContabilidad();
    const borrar_ = useCallback(async () => {
        await deleteDotacion(dotacion.id);
        onBorrada();
    }, [dotacion.id, onBorrada]);
    const [borrar, cancelar] = useForm(borrar_, onCancelar);
    return (
        <QModalConfirmacion
            nombre="borrarDotacion"
            abierto={true}
            titulo={t("amortizacion.borrarDotacion")}
            mensaje={t("amortizacion.seBorraraLaDotacionYSu")}
            onCerrar={cancelar}
            onAceptar={borrar}
        />
    );
};

/** Pestaña de dotaciones de la ficha (`tdbDotaciones`). Se aparta de la
 * plantilla `_con_lineas` (sin máquina propia): es una lista con alta y baja,
 * y cada cambio recarga la ficha porque cambian sus totales. */
export const Dotaciones = ({
    amortizacion,
    onCambio,
}: {
    amortizacion: Amortizacion;
    onCambio: () => void;
}) => {
    const t = useTContabilidad();
    const [dotaciones, setDotaciones] = useState<Dotacion[]>([]);
    const [cargando, setCargando] = useState(true);
    const [activa, setActiva] = useState<Dotacion | null>(null);
    const [estado, setEstado] = useState<Estado>("INICIAL");

    const recargar = useCallback(async () => {
        setCargando(true);
        try {
            setDotaciones(await getDotaciones(amortizacion.id));
        } finally {
            setCargando(false);
        }
    }, [amortizacion.id]);

    useEffect(() => { recargar(); }, [recargar]);

    const cambiado = useCallback(async () => {
        setEstado("INICIAL");
        setActiva(null);
        await recargar();
        onCambio();
    }, [onCambio, recargar]);

    const cerrada = esCerrada(amortizacion);

    return (
        <div className="DotacionesAmortizacion">
            <div className="botones maestro-botones">
                <QBoton onClick={() => setEstado("CREANDO")}
                    deshabilitado={cerrada || amortizacion.pendiente === 0}>
                    {t("amortizacion.nuevaDotacion")}
                </QBoton>
                <QBoton onClick={() => setEstado("BORRANDO")} deshabilitado={cerrada || !activa}>
                    {t("amortizacion.borrar")}
                </QBoton>
            </div>
            <QTabla
                metaTabla={metaTablaDotaciones}
                datos={dotaciones}
                cargando={cargando}
                seleccionadaId={activa?.id}
                onSeleccion={setActiva}
                orden={["fechaFin", "ASC"]}
                totalEntidades={dotaciones.length}
            />
            {estado === "CREANDO" && (
                <CrearDotacion amortizacion={amortizacion} onCreada={cambiado}
                    onCancelar={() => setEstado("INICIAL")} />
            )}
            {estado === "BORRANDO" && activa && (
                <BorrarDotacion dotacion={activa} onBorrada={cambiado}
                    onCancelar={() => setEstado("INICIAL")} />
            )}
        </div>
    );
};
