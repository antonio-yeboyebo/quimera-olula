import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { Detalle } from "@olula/componentes/detalle/Detalle.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { QuimeraAcciones } from "@olula/componentes/moleculas/qacciones.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { puede } from "@olula/lib/dominio.ts";
import { useModelo } from "@olula/lib/useModelo.js";
import { useCallback, useEffect } from "react";
import { BorrarPais } from "../borrar/BorrarPais.tsx";
import { Pais } from "../diseño.ts";
import { etiquetaPais, metaPais, REGLA_PAIS } from "../dominio.ts";
import { CamposPais } from "./CamposPais.tsx";
import { contextoDetallePaisInicial, guardarPais } from "./detalle.ts";
import { getMaquina } from "./maquina.ts";
import { useTComun } from "../../i18n/index.ts";

/** Formulario de Eneboo `paises.ui` (sin bandera ni el botón de normalizar provincias). */
export const DetallePais = ({
    id,
    publicar = async () => {},
}: {
    id?: string;
    publicar?: EmitirEvento;
}) => {
    const t = useTComun();
    const { ctx, emitir } = useMaquina(getMaquina, contextoDetallePaisInicial, publicar);

    const autoGuardar = useCallback(
        async (pais: Pais) => {
            await guardarPais(ctx, pais);
            await emitir("pais_guardado");
        },
        [ctx, emitir]
    );

    const formModelo = useModelo(metaPais, ctx.pais, autoGuardar);

    const { estado, pais } = ctx;

    useEffect(() => {
        emitir("pais_id_cambiado", id, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    if (!pais.id) return null;

    const acciones = [
        {
            texto: t("paises.borrar"),
            onClick: () => emitir("borrado_solicitado"),
            deshabilitado: !puede(REGLA_PAIS),
            advertencia: true,
        },
    ];

    return (
        <Detalle
            id={id}
            obtenerTitulo={etiquetaPais}
            setEntidad={() => {}}
            entidad={pais}
            cerrarDetalle={() => emitir("pais_deseleccionado", null, true)}
        >
            <div className="DetallePais">
                <div className="maestro-botones">
                    <QuimeraAcciones acciones={acciones} vertical />
                </div>
                <quimera-formulario>
                    <QInput label={t("paises.codigo")} nombre="id" valor={pais.id} soloLectura />
                    <CamposPais uiProps={formModelo.uiProps} />
                </quimera-formulario>
            </div>

            {estado === "BORRANDO" && <BorrarPais pais={pais} publicar={emitir} />}
        </Detalle>
    );
};
