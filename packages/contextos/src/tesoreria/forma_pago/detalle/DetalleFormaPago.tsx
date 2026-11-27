import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { Detalle } from "@olula/componentes/detalle/Detalle.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { QuimeraAcciones } from "@olula/componentes/moleculas/qacciones.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { puede } from "@olula/lib/dominio.ts";
import { useModelo } from "@olula/lib/useModelo.js";
import { useCallback, useEffect } from "react";
import { BorrarFormaPago } from "../borrar/BorrarFormaPago.tsx";
import { FormaPago } from "../diseño.ts";
import { etiquetaFormaPago, metaFormaPago, REGLA_FORMA_PAGO } from "../dominio.ts";
import { EditarPlazosFormaPago } from "../editar_plazos/EditarPlazosFormaPago.tsx";
import { CamposFormaPago } from "./CamposFormaPago.tsx";
import { contextoDetalleFormaPagoInicial, guardarFormaPago } from "./detalle.ts";
import { getMaquina } from "./maquina.ts";
import { PlazosFormaPago } from "./PlazosFormaPago.tsx";
import { useTTesoreria } from "../../i18n/index.ts";

/** Formulario de Eneboo `formaspago.ui`. */
export const DetalleFormaPago = ({
    id,
    publicar = async () => {},
}: {
    id?: string;
    publicar?: EmitirEvento;
}) => {
    const t = useTTesoreria();
    const { ctx, emitir } = useMaquina(getMaquina, contextoDetalleFormaPagoInicial, publicar);

    const autoGuardar = useCallback(
        async (formaPago: FormaPago) => {
            await guardarFormaPago(ctx, formaPago);
            await emitir("forma_pago_guardada");
        },
        [ctx, emitir]
    );

    const formModelo = useModelo(metaFormaPago, ctx.formaPago, autoGuardar);

    const { estado, formaPago } = ctx;

    useEffect(() => {
        emitir("forma_pago_id_cambiado", id, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    if (!formaPago.id) return null;

    const autorizado = puede(REGLA_FORMA_PAGO);

    const acciones = [
        {
            texto: t("forma_pago.editarPlazos"),
            onClick: () => emitir("edicion_de_plazos_solicitada"),
            deshabilitado: !autorizado,
        },
        {
            texto: t("forma_pago.borrar"),
            onClick: () => emitir("borrado_solicitado"),
            deshabilitado: !autorizado,
            advertencia: true,
        },
    ];

    return (
        <Detalle
            id={id}
            obtenerTitulo={etiquetaFormaPago}
            setEntidad={() => {}}
            entidad={formaPago}
            cerrarDetalle={() => emitir("forma_pago_deseleccionada", null, true)}
        >
            <div className="DetalleFormaPago">
                <div className="maestro-botones">
                    <QuimeraAcciones acciones={acciones} vertical />
                </div>
                <quimera-formulario>
                    <QInput label={t("forma_pago.codigo")} nombre="id" valor={formaPago.id} soloLectura />
                    <CamposFormaPago uiProps={formModelo.uiProps} />
                </quimera-formulario>
                <PlazosFormaPago plazos={formaPago.plazos} />
            </div>

            {estado === "EDITANDO_PLAZOS" && (
                <EditarPlazosFormaPago formaPago={formaPago} publicar={emitir} />
            )}
            {estado === "BORRANDO" && <BorrarFormaPago formaPago={formaPago} publicar={emitir} />}
        </Detalle>
    );
};
