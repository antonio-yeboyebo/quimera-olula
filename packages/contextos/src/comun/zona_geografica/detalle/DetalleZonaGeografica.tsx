import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { Detalle } from "@olula/componentes/detalle/Detalle.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { QuimeraAcciones } from "@olula/componentes/moleculas/qacciones.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { puede } from "@olula/lib/dominio.ts";
import { useModelo } from "@olula/lib/useModelo.js";
import { useCallback, useEffect } from "react";
import { BorrarZonaGeografica } from "../borrar/BorrarZonaGeografica.tsx";
import { ZonaGeografica } from "../diseño.ts";
import { etiquetaZonaGeografica, metaZonaGeografica, REGLA_ZONA_GEOGRAFICA } from "../dominio.ts";
import { CamposZonaGeografica } from "./CamposZonaGeografica.tsx";
import { contextoDetalleZonaGeograficaInicial, guardarZonaGeografica } from "./detalle.ts";
import { getMaquina } from "./maquina.ts";
import { useTComun } from "../../i18n/index.ts";

/** Formulario de Eneboo `zonasgeo.ui`. */
export const DetalleZonaGeografica = ({
    id,
    publicar = async () => {},
}: {
    id?: string;
    publicar?: EmitirEvento;
}) => {
    const t = useTComun();
    const { ctx, emitir } = useMaquina(getMaquina, contextoDetalleZonaGeograficaInicial, publicar);

    const autoGuardar = useCallback(
        async (zonaGeografica: ZonaGeografica) => {
            await guardarZonaGeografica(ctx, zonaGeografica);
            await emitir("zona_geografica_guardado");
        },
        [ctx, emitir]
    );

    const formModelo = useModelo(metaZonaGeografica, ctx.zonaGeografica, autoGuardar);

    const { estado, zonaGeografica } = ctx;

    useEffect(() => {
        emitir("zona_geografica_id_cambiado", id, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    if (!zonaGeografica.id) return null;

    const acciones = [
        {
            texto: t("zonaGeografica.borrar"),
            onClick: () => emitir("borrado_solicitado"),
            deshabilitado: !puede(REGLA_ZONA_GEOGRAFICA),
            advertencia: true,
        },
    ];

    return (
        <Detalle
            id={id}
            obtenerTitulo={etiquetaZonaGeografica}
            setEntidad={() => {}}
            entidad={zonaGeografica}
            cerrarDetalle={() => emitir("zona_geografica_deseleccionado", null, true)}
        >
            <div className="DetalleZonaGeografica">
                <div className="maestro-botones">
                    <QuimeraAcciones acciones={acciones} vertical />
                </div>
                <quimera-formulario>
                    <QInput label={t("zonaGeografica.codigo")} nombre="id" valor={zonaGeografica.id} soloLectura />
                    <CamposZonaGeografica uiProps={formModelo.uiProps} />
                </quimera-formulario>
            </div>

            {estado === "BORRANDO" && <BorrarZonaGeografica zonaGeografica={zonaGeografica} publicar={emitir} />}
        </Detalle>
    );
};
