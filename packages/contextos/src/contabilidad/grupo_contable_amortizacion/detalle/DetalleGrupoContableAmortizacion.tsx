import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { Detalle } from "@olula/componentes/detalle/Detalle.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { QuimeraAcciones } from "@olula/componentes/moleculas/qacciones.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { puede } from "@olula/lib/dominio.ts";
import { useModelo } from "@olula/lib/useModelo.js";
import { useCallback, useEffect } from "react";
import { BorrarGrupoContableAmortizacion } from "../borrar/BorrarGrupoContableAmortizacion.tsx";
import { GrupoContableAmortizacion } from "../diseño.ts";
import { etiquetaGrupoContableAmortizacion, metaGrupoContableAmortizacion } from "../dominio.ts";
import { CamposGrupo } from "./CamposGrupo.tsx";
import { contextoDetalleGrupoInicial, guardarGrupo } from "./detalle.ts";
import { getMaquina } from "./maquina.ts";
import { useTContabilidad } from "../../i18n/index.ts";

/** Formulario de Eneboo `co_gruposcontablesamo.ui`. */
export const DetalleGrupoContableAmortizacion = ({
    id,
    publicar = async () => {},
}: {
    id?: string;
    publicar?: EmitirEvento;
}) => {
    const t = useTContabilidad();
    const { ctx, emitir } = useMaquina(getMaquina, contextoDetalleGrupoInicial, publicar);

    const autoGuardar = useCallback(
        async (grupo: GrupoContableAmortizacion) => {
            await guardarGrupo(ctx, grupo);
            await emitir("grupo_guardado");
        },
        [ctx, emitir]
    );

    const formModelo = useModelo(metaGrupoContableAmortizacion, ctx.grupo, autoGuardar);

    const { estado, grupo } = ctx;

    useEffect(() => {
        emitir("grupo_id_cambiado", id, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    if (!grupo.id) return null;

    const acciones = [
        {
            texto: t("grupo_contable_amortizacion.borrar"),
            onClick: () => emitir("borrado_solicitado"),
            deshabilitado: !puede("contabilidad.asiento"),
            advertencia: true,
        },
    ];

    return (
        <Detalle
            id={id}
            obtenerTitulo={etiquetaGrupoContableAmortizacion}
            setEntidad={() => {}}
            entidad={grupo}
            cerrarDetalle={() => emitir("grupo_deseleccionado", null, true)}
        >
            <div className="DetalleGrupoContableAmortizacion">
                <div className="maestro-botones">
                    <QuimeraAcciones acciones={acciones} vertical />
                </div>
                <quimera-formulario>
                    <QInput label={t("grupo_contable_amortizacion.codigo")} nombre="id" valor={grupo.id} soloLectura />
                    <CamposGrupo
                        uiProps={formModelo.uiProps}
                        descripciones={grupo.descripcionesSubcuentas}
                    />
                </quimera-formulario>
            </div>

            {estado === "BORRANDO" && (
                <BorrarGrupoContableAmortizacion grupo={grupo} publicar={emitir} />
            )}
        </Detalle>
    );
};
