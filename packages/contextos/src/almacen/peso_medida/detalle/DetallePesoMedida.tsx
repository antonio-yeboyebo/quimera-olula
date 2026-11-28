import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { Detalle } from "@olula/componentes/detalle/Detalle.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { ContextoError } from "@olula/lib/contexto.ts";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useContext, useEffect } from "react";
import { BorrarPesoMedida } from "../borrar/BorrarPesoMedida.js";
import { PesoMedida } from "../diseño.ts";
import { metaPesoMedida } from "../dominio.ts";
import { patchPesoMedida } from "../infraestructura.ts";
import { contextoDetallePesoMedidaInicial } from "./detalle.ts";
import { MagnitudPesoMedida } from "../MagnitudPesoMedida.tsx";
import "./DetallePesoMedida.css";
import { getMaquina } from "./maquina.ts";
import { useTAlmacen } from "../../i18n/index.ts";

const titulo = (pesoMedida: PesoMedida) => `${pesoMedida.id} - ${pesoMedida.descripcion}`;

export const DetallePesoMedida = ({
    id,
    publicar = async () => {},
}: {
    id?: string;
    publicar?: EmitirEvento;
}) => {
    const t = useTAlmacen();
    const { intentar } = useContext(ContextoError);

    const { ctx, emitir } = useMaquina(getMaquina, contextoDetallePesoMedidaInicial, publicar);

    const autoGuardar = useCallback(
        async (pesoMedida: PesoMedida) => {
            await intentar(() => patchPesoMedida(pesoMedida.id, pesoMedida));
            await emitir("peso_medida_guardada");
        },
        [intentar, emitir]
    );

    const modelo = useModelo(metaPesoMedida, ctx.pesoMedida, autoGuardar);

    useEffect(() => {
        emitir("peso_medida_id_cambiado", id, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    if (!ctx.pesoMedida.id) return null;

    return (
        <Detalle
            id={id}
            obtenerTitulo={titulo}
            setEntidad={() => {}}
            entidad={ctx.pesoMedida}
            cerrarDetalle={() => emitir("peso_medida_deseleccionada", null, true)}
        >
            <div className="DetallePesoMedida">
                <div className="maestro-botones">
                    <QBoton onClick={() => emitir("borrado_solicitado")}>{t("peso_medida.borrar")}</QBoton>
                </div>
                <quimera-formulario>
                    <QInput label={t("peso_medida.abreviatura")} nombre="id" valor={ctx.pesoMedida.id} soloLectura />
                    <QInput label={t("peso_medida.descripcion")} {...modelo.uiProps("descripcion")} maxLength={100} />
                    <MagnitudPesoMedida {...modelo.uiProps("magnitud")} />
                    <QInput label={t("peso_medida.factorDeConversion")} {...modelo.uiProps("factorConversion")} />
                </quimera-formulario>
            </div>

            {ctx.estado === "BORRANDO" && (
                <BorrarPesoMedida publicar={emitir} pesoMedida={ctx.pesoMedida} />
            )}
        </Detalle>
    );
};
