import { ResolvedorHitlTareaProps } from "#/comun/ia/hitl_cola/diseño.ts";
import { getFicheroHitlTarea } from "#/comun/ia/hitl_cola/infraestructura.ts";
import { useCallback, useEffect, useMemo, useState } from "react";
import { facturaLeidaDesdeApi, FacturaLeidaApi, importarDeHitl } from "../../infraestructura.ts";
import { FacturaLeida, FicheroOriginal } from "../validar_importacion/diseño.ts";
import { tipoFichero } from "../validar_importacion/dominio.ts";
import { ValidarImportacionFactura } from "../validar_importacion/ValidarImportacionFactura.tsx";

/**
 * Resolvedor HITL de importación de facturas
 * (ui_hint 'factura_revision' y 'factura_completar_datos').
 * Ambos casos se resuelven con la misma pantalla de validación.
 */
export const ResolverImportacionFactura = ({ tarea, publicar }: ResolvedorHitlTareaProps) => {
    const facturaLeida = useMemo(() => {
        const payload = tarea.datos_payload as Record<string, unknown>;
        const datos = (payload.factura_leida ?? payload) as unknown as FacturaLeidaApi;
        return facturaLeidaDesdeApi(datos);
    }, [tarea.datos_payload]);

    const { fichero, cargandoFichero } = useFicheroTarea(tarea.id, tarea.fichero_nombre);

    const confirmar = useCallback(
        async (leida: FacturaLeida) => {
            await importarDeHitl(tarea.id, leida);
            publicar("tarea_resuelta", tarea.id);
        },
        [tarea.id, publicar]
    );

    return (
        <ValidarImportacionFactura
            facturaLeida={facturaLeida}
            fichero={fichero}
            cargandoFichero={cargandoFichero}
            onConfirmar={confirmar}
            onCancelar={() => publicar("resolucion_cancelada")}
        />
    );
};

/** El fichero original de la tarea, si lo tiene. Si falla la descarga se
 * valida igualmente, sin visor. */
const useFicheroTarea = (tareaId: string, ficheroNombre: string | null) => {
    const [fichero, setFichero] = useState<FicheroOriginal | null>(null);
    const [cargandoFichero, setCargandoFichero] = useState(ficheroNombre !== null);

    useEffect(() => {
        if (!ficheroNombre) return;
        let url: string | null = null;
        let vigente = true;

        getFicheroHitlTarea(tareaId)
            .then((blob) => {
                if (!vigente) return;
                url = URL.createObjectURL(blob);
                setFichero({ url, tipo: tipoFichero(blob.type || ficheroNombre) });
            })
            .catch(() => setFichero(null))
            .finally(() => vigente && setCargandoFichero(false));

        return () => {
            vigente = false;
            if (url) URL.revokeObjectURL(url);
        };
    }, [tareaId, ficheroNombre]);

    return { fichero, cargandoFichero };
};
