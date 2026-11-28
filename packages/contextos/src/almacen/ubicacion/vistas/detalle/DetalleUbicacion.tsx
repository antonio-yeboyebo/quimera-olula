import { urlMapa } from "#/almacen/comun/fichas.ts";
import { PasilloZona } from "#/almacen/comun/componentes/PasilloZona.tsx";
import { TipoUbicacion } from "#/almacen/comun/componentes/TipoUbicacion.tsx";
import { Zona } from "#/almacen/comun/componentes/Zona.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { Detalle } from "@olula/componentes/detalle/Detalle.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { ContextoError } from "@olula/lib/contexto.ts";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useContext, useEffect } from "react";
import { Ubicacion } from "../../diseño.ts";
import { estadosUbicacion, metaUbicacion, ubicacionVacia, descripcionCaraUbicacion } from "../../dominio.ts";
import { patchUbicacion } from "../../infraestructura.ts";
import { BorrarUbicacion } from "./BorrarUbicacion.tsx";
import "./DetalleUbicacion.css";
import { getMaquina } from "./maquina.ts";
import { StocksUbicacion } from "./stocks/StocksUbicacion.tsx";
import { useTAlmacen } from "../../../i18n/index.ts";

const titulo = (ubicacion: Ubicacion) => ubicacion.codigo as string;

export const DetalleUbicacion = ({
    id,
    publicar = async () => {},
}: {
    id?: string;
    publicar?: EmitirEvento;
}) => {
    const t = useTAlmacen();
    const { intentar } = useContext(ContextoError);

    const { ctx, emitir } = useMaquina(
        getMaquina,
        {
            estado: "INICIAL",
            ubicacion: ubicacionVacia(),
            stocks: [],
        },
        publicar
    );

    const autoGuardar = useCallback(
        async (ubicacion: Ubicacion) => {
            await intentar(() => patchUbicacion(ubicacion.id, ubicacion));
            await emitir("ubicacion_guardada");
        },
        [intentar, emitir]
    );

    const modelo = useModelo(metaUbicacion, ctx.ubicacion, autoGuardar);

    useEffect(() => {
        emitir("ubicacion_id_cambiada", id, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    if (!ctx.ubicacion.id) return null;

    return (
        <Detalle
            id={id}
            obtenerTitulo={titulo}
            setEntidad={() => {}}
            entidad={ctx.ubicacion}
            cerrarDetalle={() => emitir("ubicacion_deseleccionada", null, true)}
        >
            <div className="DetalleUbicacion">
                <div className="maestro-botones">
                    <QBoton onClick={() => emitir("borrado_solicitado")}>{t("ubicacion.borrar")}</QBoton>
                    <QBoton variante="borde" enlace={urlMapa({ ubicacionId: ctx.ubicacion.id })}>{t("ubicacion.verEnElMapa")}</QBoton>
                </div>
                    <quimera-formulario>
                        <QInput label={t("ubicacion.codigo")} {...modelo.uiProps("codigo")} />
                        <Zona {...modelo.uiProps("idZona")} />
                        <PasilloZona zonaId={modelo.modelo.idZona} {...modelo.uiProps("pasilloId")} />
                        <QInput label={t("ubicacion.modulo")} {...modelo.uiProps("modulo")} />
                        <QInput label={t("ubicacion.cara")} nombre="cara" valor={descripcionCaraUbicacion(ctx.ubicacion.cara)} soloLectura />
                        <QInput label={t("ubicacion.nivel")} {...modelo.uiProps("nivel")} />
                        <QInput label={t("ubicacion.hueco")} {...modelo.uiProps("hueco")} />
                        <TipoUbicacion {...modelo.uiProps("tipoUbicacionId")} />
                        <QSelect label={t("ubicacion.estado")} {...modelo.uiProps("estado")} opciones={estadosUbicacion} />
                    </quimera-formulario>
                    <StocksUbicacion stocks={ctx.stocks} />
            </div>

            {ctx.estado === "BORRANDO" && (
                <BorrarUbicacion
                    publicar={emitir}
                    ubicacion={ctx.ubicacion}
                />
            )}
        </Detalle>
    );
};
