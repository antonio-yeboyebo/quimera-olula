import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { Detalle } from "@olula/componentes/detalle/Detalle.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { QuimeraAcciones } from "@olula/componentes/moleculas/qacciones.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { puede } from "@olula/lib/dominio.ts";
import { useModelo } from "@olula/lib/useModelo.js";
import { useCallback, useEffect } from "react";
import { BorrarProvincia } from "../borrar/BorrarProvincia.tsx";
import { Provincia } from "../diseño.ts";
import { etiquetaProvincia, metaProvincia, REGLA_PROVINCIA } from "../dominio.ts";
import { CamposProvincia } from "./CamposProvincia.tsx";
import { contextoDetalleProvinciaInicial, guardarProvincia } from "./detalle.ts";
import { getMaquina } from "./maquina.ts";
import { useTComun } from "../../i18n/index.ts";

/** Formulario de Eneboo `provincias.ui`. */
export const DetalleProvincia = ({
    id,
    publicar = async () => {},
}: {
    id?: string;
    publicar?: EmitirEvento;
}) => {
    const t = useTComun();
    const { ctx, emitir } = useMaquina(getMaquina, contextoDetalleProvinciaInicial, publicar);

    const autoGuardar = useCallback(
        async (provincia: Provincia) => {
            await guardarProvincia(ctx, provincia);
            await emitir("provincia_guardado");
        },
        [ctx, emitir]
    );

    const formModelo = useModelo(metaProvincia, ctx.provincia, autoGuardar);

    const { estado, provincia } = ctx;

    useEffect(() => {
        emitir("provincia_id_cambiado", id, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    if (!provincia.id) return null;

    const acciones = [
        {
            texto: t("provincia.borrar"),
            onClick: () => emitir("borrado_solicitado"),
            deshabilitado: !puede(REGLA_PROVINCIA),
            advertencia: true,
        },
    ];

    return (
        <Detalle
            id={id}
            obtenerTitulo={etiquetaProvincia}
            setEntidad={() => {}}
            entidad={provincia}
            cerrarDetalle={() => emitir("provincia_deseleccionado", null, true)}
        >
            <div className="DetalleProvincia">
                <div className="maestro-botones">
                    <QuimeraAcciones acciones={acciones} vertical />
                </div>
                <quimera-formulario>
                    <QInput label={t("provincia.identificador")} nombre="id" valor={provincia.id} soloLectura />
                    <CamposProvincia uiProps={formModelo.uiProps} nombrePais={provincia.nombrePais} />
                </quimera-formulario>
            </div>

            {estado === "BORRANDO" && <BorrarProvincia provincia={provincia} publicar={emitir} />}
        </Detalle>
    );
};
