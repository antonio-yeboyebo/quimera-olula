import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { Detalle } from "@olula/componentes/detalle/Detalle.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { ContextoError } from "@olula/lib/contexto.ts";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useContext, useEffect } from "react";
import { BorrarClaseAlmacenamiento } from "../borrar/BorrarClaseAlmacenamiento.js";
import { ClaseAlmacenamiento } from "../diseño.ts";
import { metaClaseAlmacenamiento } from "../dominio.ts";
import { patchClaseAlmacenamiento } from "../infraestructura.ts";
import { contextoDetalleClaseAlmacenamientoInicial } from "./detalle.ts";
import "./DetalleClaseAlmacenamiento.css";
import { getMaquina } from "./maquina.ts";
import { useTAlmacen } from "../../i18n/index.ts";

const titulo = (clase: ClaseAlmacenamiento) => clase.codigo as string;

export const DetalleClaseAlmacenamiento = ({
    id,
    publicar = async () => {},
}: {
    id?: string;
    publicar?: EmitirEvento;
}) => {
    const t = useTAlmacen();
    const { intentar } = useContext(ContextoError);

    const { ctx, emitir } = useMaquina(getMaquina, contextoDetalleClaseAlmacenamientoInicial, publicar);

    const autoGuardar = useCallback(
        async (clase: ClaseAlmacenamiento) => {
            await intentar(() => patchClaseAlmacenamiento(clase.id, clase));
            await emitir("clase_almacenamiento_guardada");
        },
        [intentar, emitir]
    );

    const modelo = useModelo(metaClaseAlmacenamiento, ctx.clase, autoGuardar);

    useEffect(() => {
        emitir("clase_almacenamiento_id_cambiado", id, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    if (!ctx.clase.id) return null;

    return (
        <Detalle
            id={id}
            obtenerTitulo={titulo}
            setEntidad={() => {}}
            entidad={ctx.clase}
            cerrarDetalle={() => emitir("clase_almacenamiento_deseleccionada", null, true)}
        >
            <div className="DetalleClaseAlmacenamiento">
                <div className="maestro-botones">
                    <QBoton onClick={() => emitir("borrado_solicitado")}>{t("clase_almacenamiento.borrar")}</QBoton>
                </div>
                <quimera-formulario>
                    <QInput label={t("clase_almacenamiento.codigo")} {...modelo.uiProps("codigo")} maxLength={10} />
                    <QInput label={t("clase_almacenamiento.descripcion")} {...modelo.uiProps("descripcion")} />
                </quimera-formulario>
            </div>

            {ctx.estado === "BORRANDO" && (
                <BorrarClaseAlmacenamiento publicar={emitir} clase={ctx.clase} />
            )}
        </Detalle>
    );
};
