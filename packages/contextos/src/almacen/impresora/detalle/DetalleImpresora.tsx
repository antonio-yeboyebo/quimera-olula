import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { Detalle } from "@olula/componentes/detalle/Detalle.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { QuimeraAcciones } from "@olula/componentes/moleculas/qacciones.tsx";
import { ContextoError } from "@olula/lib/contexto.ts";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useContext, useEffect } from "react";
import { BorrarImpresora } from "../borrar/BorrarImpresora.js";
import { ComprobarEstadoImpresora } from "../comprobar_estado/ComprobarEstadoImpresora.tsx";
import { Impresora } from "../diseño.ts";
import { metaImpresora, opcionesModoSalida, textoEstadoImpresora } from "../dominio.ts";
import { patchImpresora } from "../infraestructura.ts";
import { contextoDetalleImpresoraInicial } from "./detalle.ts";
import "./DetalleImpresora.css";
import { getMaquina } from "./maquina.ts";

const titulo = (impresora: Impresora) => impresora.codigo;

export const DetalleImpresora = ({
    id,
    publicar = async () => {},
}: {
    id?: string;
    publicar?: EmitirEvento;
}) => {
    const { intentar } = useContext(ContextoError);

    const { ctx, emitir } = useMaquina(getMaquina, contextoDetalleImpresoraInicial, publicar);

    const autoGuardar = useCallback(
        async (impresora: Impresora) => {
            await intentar(() => patchImpresora(impresora.id, impresora));
            await emitir("impresora_guardada");
        },
        [intentar, emitir]
    );

    const modelo = useModelo(metaImpresora, ctx.impresora, autoGuardar);

    useEffect(() => {
        emitir("impresora_id_cambiado", id, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    if (!ctx.impresora.id) return null;

    const acciones = [
        { texto: "Comprobar estado", onClick: () => emitir("estado_solicitado"), principal: true },
        { texto: "Etiqueta de prueba", onClick: () => emitir("prueba_solicitada") },
        { texto: "Borrar", onClick: () => emitir("borrado_solicitado"), advertencia: true },
    ];

    const { estadoImpresora } = ctx;

    return (
        <Detalle
            id={id}
            obtenerTitulo={titulo}
            setEntidad={() => {}}
            entidad={ctx.impresora}
            cerrarDetalle={() => emitir("impresora_deseleccionada", null, true)}
        >
            <div className="DetalleImpresora">
                <div className="maestro-botones">
                    <QuimeraAcciones acciones={acciones} vertical />
                </div>
                {estadoImpresora && (
                    <p className={`estado-impresora ${estadoImpresora.lista ? "lista" : "no-lista"}`}>
                        {textoEstadoImpresora(estadoImpresora)}
                    </p>
                )}
                <quimera-formulario>
                    <QInput label="Código" {...modelo.uiProps("codigo")} deshabilitado={true} />
                    <QInput label="Descripción" {...modelo.uiProps("descripcion")} />
                    <QInput label="Dirección IP o nombre" {...modelo.uiProps("host")} />
                    <QInput label="Puerto" {...modelo.uiProps("puerto")} />
                    <QInput label="Ancho etiqueta (mm)" {...modelo.uiProps("anchoMm")} />
                    <QInput label="Alto etiqueta (mm)" {...modelo.uiProps("altoMm")} />
                    <QInput label="Puntos por mm" {...modelo.uiProps("puntosPorMm")} />
                    <QInput label="Desplazamiento X (puntos)" {...modelo.uiProps("desplazamientoX")} />
                    <QSelect label="Salida" {...modelo.uiProps("modoSalida")} opciones={opcionesModoSalida} />
                </quimera-formulario>
            </div>

            {ctx.estado === "COMPROBANDO_ESTADO" && (
                <ComprobarEstadoImpresora publicar={emitir} impresora={ctx.impresora} />
            )}
            {ctx.estado === "BORRANDO" && (
                <BorrarImpresora publicar={emitir} impresora={ctx.impresora} />
            )}
        </Detalle>
    );
};
