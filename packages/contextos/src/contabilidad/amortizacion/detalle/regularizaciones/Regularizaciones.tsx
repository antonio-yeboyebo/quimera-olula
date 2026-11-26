import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { MetaTabla, QTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback, useEffect, useState } from "react";
import { CrearRegularizacion } from "../../crear_regularizacion/CrearRegularizacion.tsx";
import { Amortizacion, RegularizacionValor } from "../../diseño.ts";
import { deleteRegularizacion, getRegularizaciones } from "../../infraestructura.ts";
import { tContabilidad, useTContabilidad } from "../../../i18n/index.ts";

const metaTabla: MetaTabla<RegularizacionValor> = [
    { id: "fecha", get cabecera() { return tContabilidad("amortizacion.fecha"); }, tipo: "fecha" },
    { id: "descripcion", get cabecera() { return tContabilidad("amortizacion.descripcion"); } },
    { id: "importe", get cabecera() { return tContabilidad("amortizacion.importe"); }, tipo: "moneda" },
];

type Estado = "INICIAL" | "CREANDO" | "BORRANDO";

const BorrarRegularizacion = ({
    regularizacion, onBorrada, onCancelar,
}: { regularizacion: RegularizacionValor; onBorrada: () => void; onCancelar: () => void }) => {
    const t = useTContabilidad();
    const borrar_ = useCallback(async () => {
        await deleteRegularizacion(regularizacion.id);
        onBorrada();
    }, [regularizacion.id, onBorrada]);
    const [borrar, cancelar] = useForm(borrar_, onCancelar);
    return (
        <QModalConfirmacion nombre="borrarRegularizacionValor" abierto={true}
            titulo={t("amortizacion.borrarRegularizacionDeValor")}
            mensaje={t("amortizacion.confirmaBorrarLaRegularizacionDeValor")}
            onCerrar={cancelar} onAceptar={borrar} />
    );
};

/** Pestaña «Regularizaciones» (`co_regvaloramor`): solo registro de datos. */
export const Regularizaciones = ({ amortizacion }: { amortizacion: Amortizacion }) => {
    const t = useTContabilidad();
    const [lista, setLista] = useState<RegularizacionValor[]>([]);
    const [cargando, setCargando] = useState(true);
    const [activa, setActiva] = useState<RegularizacionValor | null>(null);
    const [estado, setEstado] = useState<Estado>("INICIAL");

    const recargar = useCallback(async () => {
        setCargando(true);
        try {
            setLista(await getRegularizaciones(amortizacion.id));
        } finally {
            setCargando(false);
        }
    }, [amortizacion.id]);

    useEffect(() => { recargar(); }, [recargar]);

    const cambiado = useCallback(async () => {
        setEstado("INICIAL");
        setActiva(null);
        await recargar();
    }, [recargar]);

    return (
        <div className="RegularizacionesValor">
            <div className="botones maestro-botones">
                <QBoton onClick={() => setEstado("CREANDO")}>{t("amortizacion.nuevaRegularizacion")}</QBoton>
                <QBoton onClick={() => setEstado("BORRANDO")} deshabilitado={!activa}>{t("amortizacion.borrar")}</QBoton>
            </div>
            <QTabla metaTabla={metaTabla} datos={lista} cargando={cargando}
                seleccionadaId={activa?.id} onSeleccion={setActiva}
                orden={["fecha", "ASC"]} totalEntidades={lista.length} />
            {estado === "CREANDO" && (
                <CrearRegularizacion amortizacion={amortizacion} onCreada={cambiado}
                    onCancelar={() => setEstado("INICIAL")} />
            )}
            {estado === "BORRANDO" && activa && (
                <BorrarRegularizacion regularizacion={activa} onBorrada={cambiado}
                    onCancelar={() => setEstado("INICIAL")} />
            )}
        </div>
    );
};
