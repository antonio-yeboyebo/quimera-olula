import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QModal, QSelect } from "@olula/componentes/index.js";
import { ContextoError } from "@olula/lib/contexto.ts";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useForm } from "@olula/lib/useForm.js";
import { usePreferencia } from "@olula/lib/usePreferencia.ts";
import { useCallback, useContext, useEffect, useState } from "react";
import { ImpresoraEtiquetas, OrdenAlmacen } from "../../diseño.ts";
import { getImpresorasEtiquetas, postImprimirEtiquetasOrden } from "../../infraestructura.ts";

/**
 * Modal para mandar a una impresora de etiquetas de red (plugin impresion) las
 * etiquetas de las cajas creadas desde la orden.
 *
 *   - El detalle lo renderiza cuando estado === "IMPRIMIENDO_ETIQUETAS".
 *   - Recuerda en el navegador la última impresora elegida.
 *   - Emite "etiquetas_impresas" o "impresion_etiquetas_cancelada".
 */
export const ImprimirEtiquetasOrden = ({
    publicar,
    orden,
}: {
    publicar: EmitirEvento;
    orden: OrdenAlmacen;
}) => {
    const { intentar } = useContext(ContextoError);
    const [impresoras, setImpresoras] = useState<ImpresoraEtiquetas[] | null>(null);
    const [preferida, setPreferida] = usePreferencia("almacen.impresora-etiquetas", "");

    useEffect(() => {
        let vigente = true;
        intentar(async () => {
            const leidas = await getImpresorasEtiquetas();
            if (vigente) setImpresoras(leidas);
        });
        return () => { vigente = false; };
    }, [intentar]);

    const impresora = impresoras?.some((i) => i.codigo === preferida)
        ? preferida
        : impresoras?.length === 1 ? impresoras[0].codigo : "";

    const imprimir_ = useCallback(async () => {
        await postImprimirEtiquetasOrden(orden.id, impresora);
        setPreferida(impresora);
        publicar("etiquetas_impresas");
    }, [orden.id, impresora, setPreferida, publicar]);

    const cancelar_ = useCallback(() => publicar("impresion_etiquetas_cancelada"), [publicar]);

    const [imprimir, cancelar] = useForm(imprimir_, cancelar_);

    const opciones = (impresoras ?? []).map((i) => ({
        valor: i.codigo,
        descripcion: `${i.codigo} - ${i.descripcion} (${i.anchoMm}×${i.altoMm} mm)`,
    }));

    return (
        <QModal abierto={true} nombre="imprimirEtiquetas" titulo="Imprimir etiquetas de caja" onCerrar={cancelar}>
            {impresoras === null ? (
                <p>Cargando impresoras…</p>
            ) : impresoras.length === 0 ? (
                <p>No hay ninguna impresora de etiquetas dada de alta.</p>
            ) : (
                <>
                    <quimera-formulario>
                        <QSelect
                            label="Impresora"
                            nombre="impresora"
                            valor={impresora}
                            opciones={opciones}
                            onChange={(opcion) => setPreferida(opcion?.valor ?? "")}
                        />
                    </quimera-formulario>
                    <div className="botones maestro-botones">
                        <QBoton onClick={imprimir} deshabilitado={!impresora}>
                            Imprimir
                        </QBoton>
                    </div>
                </>
            )}
        </QModal>
    );
};
