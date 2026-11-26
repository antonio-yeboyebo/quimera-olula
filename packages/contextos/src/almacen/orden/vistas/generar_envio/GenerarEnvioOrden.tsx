import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput, QModal, QSelect } from "@olula/componentes/index.js";
import { ContextoError } from "@olula/lib/contexto.ts";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { imprimir_blob } from "@olula/lib/impresion.ts";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { AgenciaEnvio, OrdenAlmacen } from "../../diseño.ts";
import { albaranesSinEnvio, metaNuevoEnvioAgencia, nuevoEnvioAgenciaInicial } from "../../dominio.ts";
import { getAgenciasEnvio, getEtiquetaEnvio, postEnvioAgencia } from "../../infraestructura.ts";
import { useTAlmacen } from "../../../i18n/index.ts";

/**
 * Modal para pedir a una agencia de transporte el envío de un albarán de una
 * orden de SALIDA terminada.
 *
 *   - El detalle lo renderiza cuando estado === "GENERANDO_ENVIO".
 *   - Emite "envio_generado" (tras imprimir la etiqueta) o "envio_cancelado".
 */
export const GenerarEnvioOrden = ({
    publicar,
    orden,
}: {
    publicar: EmitirEvento;
    orden: OrdenAlmacen;
}) => {
    const t = useTAlmacen();
    const { intentar } = useContext(ContextoError);
    const [agencias, setAgencias] = useState<AgenciaEnvio[] | null>(null);

    useEffect(() => {
        let vigente = true;
        intentar(async () => {
            const leidas = await getAgenciasEnvio();
            if (vigente) setAgencias(leidas);
        });
        return () => { vigente = false; };
    }, [intentar]);

    const cancelar_ = useCallback(() => publicar("envio_cancelado"), [publicar]);

    if (agencias === null) {
        return (
            <QModal abierto={true} nombre="generarEnvio" titulo={t("orden.generarEnvio")} onCerrar={cancelar_}>
                <p>{t("orden.cargandoAgencias")}</p>
            </QModal>
        );
    }

    return <FormularioEnvio orden={orden} agencias={agencias} publicar={publicar} cancelar_={cancelar_} />;
};

const FormularioEnvio = ({
    orden,
    agencias,
    publicar,
    cancelar_,
}: {
    orden: OrdenAlmacen;
    agencias: AgenciaEnvio[];
    publicar: EmitirEvento;
    cancelar_: () => void;
}) => {
    const t = useTAlmacen();
    const inicial = useMemo(() => nuevoEnvioAgenciaInicial(orden, agencias), [orden, agencias]);
    const { modelo: envio, uiProps, valido } = useModelo(metaNuevoEnvioAgencia, inicial);

    const opcionesAlbaran = albaranesSinEnvio(orden).map((a) => ({ valor: a.id, descripcion: a.codigo }));
    const opcionesAgencia = agencias.map((a) => ({ valor: a.codigo, descripcion: a.nombre }));
    const opcionesServicio = (agencias.find((a) => a.codigo === envio.agenciaId)?.servicios ?? [])
        .map((s) => ({ valor: s.codigo, descripcion: `${s.codigo} - ${s.descripcion}` }));

    const generar_ = useCallback(async () => {
        const generado = await postEnvioAgencia(orden.id, envio);
        imprimir_blob(await getEtiquetaEnvio(generado.albaranId));
        publicar("envio_generado", generado);
    }, [orden.id, envio, publicar]);

    const [generar, cancelar] = useForm(generar_, cancelar_);

    return (
        <QModal abierto={true} nombre="generarEnvio" titulo={t("orden.generarEnvioPorAgencia")} onCerrar={cancelar}>
            {agencias.length === 0 ? (
                <p>{t("orden.noHayNingunaAgenciaDeTransporte")}</p>
            ) : (
                <>
                    <quimera-formulario>
                        <QSelect label={t("orden.albaran")} {...uiProps("albaranId")} opciones={opcionesAlbaran} />
                        <QSelect label={t("orden.agencia")} {...uiProps("agenciaId")} opciones={opcionesAgencia} />
                        <QSelect label={t("orden.servicio")} {...uiProps("servicio")} opciones={opcionesServicio} />
                        <QInput label={t("orden.bultos")} {...uiProps("bultos")} />
                        <QInput label={t("orden.kilos")} {...uiProps("kilos")} />
                        <QInput label={t("orden.fechaDeRecogida")} {...uiProps("fechaRecogida")} />
                        <QInput label={t("orden.observaciones")} {...uiProps("observaciones")} />
                    </quimera-formulario>
                    <div className="botones maestro-botones">
                        <QBoton onClick={generar} deshabilitado={!valido}>
                            {t("orden.generarEnvio")}
                        </QBoton>
                    </div>
                </>
            )}
        </QModal>
    );
};
