import { urlListado, urlMapa } from "#/almacen/comun/fichas.ts";
import { FuncionZona } from "#/almacen/comun/componentes/FuncionZona.tsx";
import { Almacen } from "#/almacen/comun/componentes/Almacen.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { ClasesAdmitidasZona } from "#/almacen/comun/componentes/ClasesAdmitidasZona.tsx";
import { QCheckbox } from "@olula/componentes/atomos/qcheckbox.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { Detalle } from "@olula/componentes/detalle/Detalle.tsx";
import { Tab, Tabs } from "@olula/componentes/detalle/tabs/Tabs.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { ContextoError } from "@olula/lib/contexto.ts";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useContext, useEffect } from "react";
import { Zona } from "../../diseño.ts";
import { patchZona } from "../../infraestructura.ts";
import { BorrarZona } from "../borrar/BorrarZona.js";
import "./DetalleZona.css";
import { contextoDetalleZonaInicial, metaZona } from "./dominio.ts";
import { getMaquina } from "./maquina.ts";
import { PasillosZona } from "./pasillos/PasillosZona.js";
import { UbicacionesZona } from "./ubicaciones/UbicacionesZona.js";
import { useTAlmacen } from "../../../i18n/index.ts";

const titulo = (zona: Zona) => zona.codigo as string;

export const DetalleZona = ({
    id,
    publicar = async () => {},
}: {
    id?: string;
    publicar?: EmitirEvento;
}) => {
    const t = useTAlmacen();
    const { intentar } = useContext(ContextoError);

    const { ctx, emitir } = useMaquina(getMaquina, contextoDetalleZonaInicial, publicar);

    const autoGuardar = useCallback(
        async (zona: Zona) => {
            await intentar(() => patchZona(zona.id, zona));
            await emitir("zona_guardada");
        },
        [intentar, emitir]
    );

    const modelo = useModelo(metaZona, ctx.zona, autoGuardar);

    useEffect(() => {
        emitir("zona_id_cambiada", id, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    if (!ctx.zona.id) return null;

    return (
        <Detalle
            id={id}
            obtenerTitulo={titulo}
            setEntidad={() => {}}
            entidad={ctx.zona}
            cerrarDetalle={() => emitir("zona_deseleccionada", null, true)}
        >
            <div className="DetalleZona">
                <div className="maestro-botones">
                    <QBoton onClick={() => emitir("borrado_solicitado")}>{t("zona.borrar")}</QBoton>
                    <QBoton variante="borde" enlace={urlListado.ubicacionesDeZona(ctx.zona.id)}>{t("zona.verUbicaciones")}</QBoton>
                    <QBoton variante="borde" enlace={urlMapa({ almacenId: ctx.zona.almacenId, zonaId: ctx.zona.id })}>
                        {t("zona.verEnElMapa")}
                    </QBoton>
                </div>
                <Tabs
                    children={[
                        <Tab key="general" label={t("zona.general")}>
                            <quimera-formulario>
                                <QInput label={t("zona.codigo")} {...modelo.uiProps("codigo")} />
                                <Almacen {...modelo.uiProps("almacenId")} />
                                <FuncionZona {...modelo.uiProps("funcion")} />
                                <QInput label={t("zona.descripcion")} {...modelo.uiProps("descripcion")} />
                            </quimera-formulario>
                        </Tab>,
                        <Tab key="clases" label={t("zona.clases")}>
                            <quimera-formulario>
                                <QCheckbox label={t("zona.admiteArticulosSinClase")} {...modelo.uiProps("admiteSinClase")} />
                                <ClasesAdmitidasZona {...modelo.uiProps("clasesAdmitidas")} />
                            </quimera-formulario>
                        </Tab>,
                        <Tab key="pasillos" label={t("zona.pasillos")}>
                            <PasillosZona
                                zona={ctx.zona}
                                pasillos={ctx.pasillos}
                                estado={ctx.estado}
                                publicar={emitir}
                            />
                        </Tab>,
                        <Tab key="ubicaciones" label={t("zona.ubicaciones")}>
                            <UbicacionesZona
                                ubicaciones={ctx.ubicaciones}
                                total={ctx.totalUbicaciones}
                                criteria={ctx.criteriaUbicaciones}
                                publicar={emitir}
                            />
                        </Tab>,
                    ]}
                />
            </div>

            {ctx.estado === "BORRANDO" && (
                <BorrarZona publicar={emitir} zona={ctx.zona} />
            )}
        </Detalle>
    );
};
