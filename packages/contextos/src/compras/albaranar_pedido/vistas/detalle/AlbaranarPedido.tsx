import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QModal } from "@olula/componentes/moleculas/qmodal.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router";
import { metaAlbaranarPedido } from "../../dominio.ts";
import { contextoVacio } from "./dominio.ts";
import { getMaquina } from "./maquina.ts";
import { LineasAlbaranar } from "./lineas/LineasAlbaranar.tsx";
import { useTCompras } from "#/compras/i18n/index.ts";

export const AlbaranarPedido = ({
    publicar = async () => {},
}: {
    publicar?: EmitirEvento;
}) => {
    const t = useTCompras();
    const navigate = useNavigate();
    const params = useParams();
    const pedidoId = params.id;
    const pedidoIdCargadoRef = useRef<string | null>(null);

    const { ctx, emitir } = useMaquina(getMaquina, contextoVacio, publicar);

    useEffect(() => {
        if (pedidoId && pedidoId !== pedidoIdCargadoRef.current) {
            pedidoIdCargadoRef.current = pedidoId;
            void emitir("cargar", pedidoId, true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pedidoId]);

    const albaranado = useModelo(metaAlbaranarPedido, ctx.albaranado);
    const { estado } = ctx;

    const lineaActiva = ctx.lineaActivaId
        ? ctx.albaranado.lineas.find((l) => l.idLinea === ctx.lineaActivaId) ?? null
        : null;

    return (
        <div className="AlbaranarPedido">
            <div className="albaranar2-bloque">
            <div className="botones maestro-botones">
                <QBoton onClick={() => emitir("marcar_todo")}>
                    {t("albaranarPedido.recibirTodo")}
                </QBoton>
                <QBoton
                    onClick={() => emitir("albaranar_solicitado")}
                    deshabilitado={!albaranado.valido || estado !== "LISTO"}
                >
                    {t("albaranarPedido.albaranar")}
                </QBoton>
            </div>

            <LineasAlbaranar
                lineas={ctx.albaranado.lineas}
                estado={estado}
                lineaActivaId={ctx.lineaActivaId}
                loteActivo={ctx.loteActivo}
                lineaActiva={lineaActiva}
                emitir={emitir}
            />
            </div>

            {estado === "ALBARAN_CREADO" && ctx.albaranCreado && (
                <QModal
                    nombre="albaranCreado"
                    abierto={true}
                    titulo={t("albaranarPedido.creadoTitulo")}
                    onCerrar={() => emitir("albaranado_cerrado")}
                >
                    <p>{t("albaranarPedido.creado", { codigo: ctx.albaranCreado.codigo })}</p>
                    <div className="botones maestro-botones">
                        <QBoton
                            variante="texto"
                            onClick={() => navigate("/compras/pedido")}
                        >
                            {t("albaranarPedido.volver")}
                        </QBoton>
                        <QBoton
                            onClick={() => navigate(`/compras/albaran?id=${ctx.albaranCreado!.id}`)}
                        >
                            {t("albaranarPedido.irAlbaran", { codigo: ctx.albaranCreado.codigo })}
                        </QBoton>
                    </div>
                </QModal>
            )}
        </div>
    );
};
