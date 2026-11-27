import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { Detalle } from "@olula/componentes/detalle/Detalle.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { QuimeraAcciones } from "@olula/componentes/moleculas/qacciones.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { puede } from "@olula/lib/dominio.ts";
import { useModelo } from "@olula/lib/useModelo.js";
import { useCallback, useEffect } from "react";
import { BorrarDivisa } from "../borrar/BorrarDivisa.tsx";
import { Divisa } from "../diseño.ts";
import { etiquetaDivisa, metaDivisa, REGLA_DIVISA } from "../dominio.ts";
import { CamposDivisa } from "./CamposDivisa.tsx";
import { contextoDetalleDivisaInicial, guardarDivisa } from "./detalle.ts";
import { getMaquina } from "./maquina.ts";
import { useTComun } from "../../i18n/index.ts";

/** Formulario de Eneboo `divisas.ui` (sin bandera). */
export const DetalleDivisa = ({
    id,
    publicar = async () => {},
}: {
    id?: string;
    publicar?: EmitirEvento;
}) => {
    const t = useTComun();
    const { ctx, emitir } = useMaquina(getMaquina, contextoDetalleDivisaInicial, publicar);

    const autoGuardar = useCallback(
        async (divisa: Divisa) => {
            await guardarDivisa(ctx, divisa);
            await emitir("divisa_guardado");
        },
        [ctx, emitir]
    );

    const formModelo = useModelo(metaDivisa, ctx.divisa, autoGuardar);

    const { estado, divisa } = ctx;

    useEffect(() => {
        emitir("divisa_id_cambiado", id, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    if (!divisa.id) return null;

    const acciones = [
        {
            texto: t("divisas.borrar"),
            onClick: () => emitir("borrado_solicitado"),
            deshabilitado: !puede(REGLA_DIVISA),
            advertencia: true,
        },
    ];

    return (
        <Detalle
            id={id}
            obtenerTitulo={etiquetaDivisa}
            setEntidad={() => {}}
            entidad={divisa}
            cerrarDetalle={() => emitir("divisa_deseleccionado", null, true)}
        >
            <div className="DetalleDivisa">
                <div className="maestro-botones">
                    <QuimeraAcciones acciones={acciones} vertical />
                </div>
                <quimera-formulario>
                    <QInput label={t("divisas.codigo")} nombre="id" valor={divisa.id} soloLectura />
                    <CamposDivisa uiProps={formModelo.uiProps} />
                </quimera-formulario>
            </div>

            {estado === "BORRANDO" && <BorrarDivisa divisa={divisa} publicar={emitir} />}
        </Detalle>
    );
};
