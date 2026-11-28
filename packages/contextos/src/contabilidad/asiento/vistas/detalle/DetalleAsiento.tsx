import { Detalle } from "@olula/componentes/detalle/Detalle.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { QuimeraAcciones } from "@olula/componentes/moleculas/qacciones.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useEffect } from "react";
import { Asiento } from "../../diseño.ts";
import { BorrarAsientoManual } from "../borrar/BorrarAsientoManual.tsx";
import { CambiarAsientoManual } from "../cambiar/CambiarAsientoManual.tsx";
import { contextoDetalleAsientoInicial, getMaquina } from "./maquina.ts";
import { CabeceraAsiento } from "./CabeceraAsiento.tsx";
import { PartidasAsientoLista } from "./PartidasAsientoLista.tsx";
import { useTContabilidad } from "../../../i18n/index.ts";

export const DetalleAsiento = ({
    id,
    publicar = async () => {},
}: {
    id?: string;
    publicar?: EmitirEvento;
}) => {
    const t = useTContabilidad();
    const { ctx, emitir } = useMaquina(getMaquina, contextoDetalleAsientoInicial, publicar);

    useEffect(() => {
        emitir("asiento_id_cambiado", id, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    if (!ctx.asiento.id) return null;

    const titulo = (a: Asiento) => a.concepto;
    const manual = ctx.asiento.manual;

    return (
        <Detalle
            id={id}
            obtenerTitulo={titulo}
            setEntidad={() => {}}
            entidad={ctx.asiento}
            cerrarDetalle={() => emitir("asiento_deseleccionado", null, true)}
        >
            <div className="DetalleAsiento">
                {manual && (
                    <div className="maestro-botones">
                        <QuimeraAcciones
                            acciones={[
                                {
                                    icono: "editar",
                                    texto: t("asiento.editar"),
                                    onClick: () => emitir("cambio_asiento_solicitado"),
                                },
                                {
                                    icono: "borrar",
                                    texto: t("asiento.borrar"),
                                    onClick: () => emitir("borrado_solicitado"),
                                    advertencia: true,
                                },
                            ]}
                        />
                    </div>
                )}
                <CabeceraAsiento asiento={ctx.asiento} />
                <PartidasAsientoLista partidas={ctx.asiento.partidas} />
            </div>
            {ctx.estado === "CAMBIANDO" && (
                <CambiarAsientoManual asiento={ctx.asiento} publicar={emitir} />
            )}
            {ctx.estado === "BORRANDO" && (
                <BorrarAsientoManual asiento={ctx.asiento} publicar={emitir} />
            )}
        </Detalle>
    );
};
