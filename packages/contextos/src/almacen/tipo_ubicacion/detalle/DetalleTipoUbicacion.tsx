import { urlListado } from "#/almacen/comun/fichas.ts";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QCheckbox } from "@olula/componentes/atomos/qcheckbox.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { Detalle } from "@olula/componentes/detalle/Detalle.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { ContextoError } from "@olula/lib/contexto.ts";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useContext, useEffect } from "react";
import { TipoUbicacion } from "../diseño.ts";
import { formatosUbicacion, metaTipoUbicacion } from "../dominio.ts";
import { patchTipoUbicacion } from "../infraestructura.ts";
import { BorrarTipoUbicacion } from "../borrar/BorrarTipoUbicacion.js";
import { contextoDetalleTipoUbicacionInicial } from "./detalle.ts";
import "./DetalleTipoUbicacion.css";
import { getMaquina } from "./maquina.ts";
import { useTAlmacen } from "../../i18n/index.ts";

const titulo = (tipo: TipoUbicacion) => tipo.codigo as string;

export const DetalleTipoUbicacion = ({
    id,
    publicar = async () => {},
}: {
    id?: string;
    publicar?: EmitirEvento;
}) => {
    const t = useTAlmacen();
    const { intentar } = useContext(ContextoError);

    const { ctx, emitir } = useMaquina(getMaquina, contextoDetalleTipoUbicacionInicial, publicar);

    const autoGuardar = useCallback(
        async (tipo: TipoUbicacion) => {
            await intentar(() => patchTipoUbicacion(tipo.id, tipo));
            await emitir("tipo_ubicacion_guardado");
        },
        [intentar, emitir]
    );

    const modelo = useModelo(metaTipoUbicacion, ctx.tipoUbicacion, autoGuardar);

    useEffect(() => {
        emitir("tipo_ubicacion_id_cambiado", id, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    if (!ctx.tipoUbicacion.id) return null;

    return (
        <Detalle
            id={id}
            obtenerTitulo={titulo}
            setEntidad={() => {}}
            entidad={ctx.tipoUbicacion}
            cerrarDetalle={() => emitir("tipo_ubicacion_deseleccionado", null, true)}
        >
            <div className="DetalleTipoUbicacion">
                <div className="maestro-botones">
                    <QBoton onClick={() => emitir("borrado_solicitado")}>{t("tipo_ubicacion.borrar")}</QBoton>
                    <QBoton variante="borde" enlace={urlListado.ubicacionesDeTipo(id ?? "")}>{t("tipo_ubicacion.verUbicaciones")}</QBoton>
                </div>
                <quimera-formulario>
                    <QInput label={t("tipo_ubicacion.codigo")} {...modelo.uiProps("codigo")} maxLength={10} />
                    <QInput label={t("tipo_ubicacion.descripcion")} {...modelo.uiProps("descripcion")} />
                    <QSelect label={t("tipo_ubicacion.formato")} {...modelo.uiProps("formato")} opciones={formatosUbicacion} />
                    <QInput label={t("tipo_ubicacion.capacidadPales")} {...modelo.uiProps("capacidadPalets")} />
                    <QInput label={t("tipo_ubicacion.pesoMaxKg")} {...modelo.uiProps("pesoMax")} />
                    <QInput label={t("tipo_ubicacion.alturaMaxM")} {...modelo.uiProps("alturaMax")} />
                    <QCheckbox label={t("tipo_ubicacion.multiReferencia")} {...modelo.uiProps("multiReferencia")} />
                    <QCheckbox label={t("tipo_ubicacion.multiLote")} {...modelo.uiProps("multiLote")} />
                </quimera-formulario>
            </div>

            {ctx.estado === "BORRANDO" && (
                <BorrarTipoUbicacion publicar={emitir} tipoUbicacion={ctx.tipoUbicacion} />
            )}
        </Detalle>
    );
};
