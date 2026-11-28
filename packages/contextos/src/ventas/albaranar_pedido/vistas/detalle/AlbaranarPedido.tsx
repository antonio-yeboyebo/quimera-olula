import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QModal } from "@olula/componentes/moleculas/qmodal.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { FactoryCtx } from "@olula/lib/factory_ctx.tsx";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useContext, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router";
import { metaAlbaranarPedido } from "../../dominio.ts";
import { contextoVacio } from "./dominio.ts";
import { getMaquina } from "./maquina.ts";
import { LineasAlbaranar } from "./lineas/LineasAlbaranar.tsx";
import { useTVentas } from "../../../i18n/index.ts";

type UrlPorId = (id: string) => string;

export const AlbaranarPedido = ({
    publicar = async () => {},
}: {
    publicar?: EmitirEvento;
}) => {
    const t = useTVentas();
    const navigate = useNavigate();
    const { app } = useContext(FactoryCtx);
    const urlAlbaran =
        (app.Ventas?.albaranar_url_albaran as UrlPorId | undefined) ??
        ((id: string) => `/ventas/albaran?id=${id}`);
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
                    {t("pedido.albaranar.enviarTodo")}
                </QBoton>
                <QBoton
                    onClick={() => emitir("albaranar_solicitado")}
                    deshabilitado={!albaranado.valido || estado !== "LISTO"}
                >
                    {t("pedido.albaranar.albaranar")}
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
                    titulo={t("pedido.albaranar.albaranCreado")}
                    onCerrar={() => emitir("albaranado_cerrado")}
                >
                    <p>{t("pedido.albaranar.albaranCreadoCodigo", { codigo: ctx.albaranCreado.codigo })}</p>
                    <div className="botones maestro-botones">
                        <QBoton
                            variante="texto"
                            onClick={() => navigate("/ventas/pedido")}
                        >
                            {t("pedido.albaranar.volverAPedidos")}
                        </QBoton>
                        <QBoton
                            onClick={() => navigate(urlAlbaran(ctx.albaranCreado!.id))}
                        >
                            {t("pedido.albaranar.irAlAlbaran", { codigo: ctx.albaranCreado.codigo })}
                        </QBoton>
                    </div>
                </QModal>
            )}
        </div>
    );
};
