import { EtiquetaEstado } from "#/comun/componentes/etiqueta_estado/EtiquetaEstado.tsx";
import { useDatosClaveDocumentoCompra } from "#/compras/comun/vistas/useDatosClaveDocumentoCompra.ts";
import { ModalTraza } from "#/comun/componentes/traza/ModalTraza.tsx";
import { CambiarDivisa } from "#/ventas/comun/componentes/moleculas/CambiarDivisa/CambiarDivisa.tsx";
import { CambioProveedor } from "#/compras/comun/componentes/moleculas/CambioProveedor/CambioProveedor.tsx";
import { Detalle } from "@olula/componentes/detalle/Detalle.tsx";
import { Tab, Tabs } from "@olula/componentes/detalle/tabs/Tabs.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { QuimeraAcciones } from "@olula/componentes/moleculas/qacciones.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { imprimir_blob } from "@olula/lib/impresion.ts";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useEffect } from "react";
import { useNavigate } from "react-router";
import { BorrarPedido } from "../borrar/BorrarPedido.tsx";
import { Pedido } from "../diseño.ts";
import { etiquetaEstadoPedido, pedidoAlbaranable, pedidoPendiente } from "../dominio.ts";
import { getReportPedido, getTrazaPedido } from "../infraestructura.ts";
import {
    contextoDetallePedidoInicial,
    guardarPedido,
    metaPedido,
} from "./detalle.ts";
import "./DetallePedido.css";
import { LineasPedido } from "./lineas/LineasPedido.tsx";
import { getMaquina } from "./maquina.ts";
import { TabDatos } from "./TabDatos.tsx";
import { TabProveedor } from "./TabProveedor.tsx";
import { TotalesDocumento } from "#/compras/comun/componentes/TotalesDocumento.tsx";
import { TabObservaciones } from "./TabObservaciones.tsx";
import { useTCompras } from "#/compras/i18n/index.ts";

export const DetallePedido = ({
    id,
    publicar = async () => {},
}: {
    id?: string;
    publicar?: EmitirEvento;
}) => {
    const t = useTCompras();
    const { ctx, emitir } = useMaquina(getMaquina, contextoDetallePedidoInicial, publicar);

    const autoGuardar = useCallback(
        async (pedido: Pedido) => {
            await guardarPedido(ctx, pedido);
            await emitir("pedido_guardado");
        },
        [ctx, emitir]
    );

    const formModelo = useModelo(metaPedido, ctx.pedido, autoGuardar);
    const datosClave = useDatosClaveDocumentoCompra();

    const { estado, pedido, lineas } = ctx;

    useEffect(() => {
        emitir("pedido_id_cambiado", id, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const navigate = useNavigate();

    if (!pedido.id) return null;

    const titulo = (p: Pedido) =>
        `${p.codigo}${p.nombreProveedor ? ` · ${p.nombreProveedor}` : ""}`;

    const imprimir = async () => {
        const blob = await getReportPedido(pedido.id);
        imprimir_blob(blob);
    };

    const handleAlbaranar = () => navigate(`/compras/albaranar-pedido/${pedido.id}`);

    const accionesPedido = [
        {
            texto: t("pedido.detalle.albaranParcial"),
            onClick: handleAlbaranar,
            deshabilitado: !pedidoAlbaranable(pedido),
        },
        { texto: t("comun.botones.imprimir"), onClick: imprimir },
        { texto: t("comun.botones.documentosRelacionados"), onClick: () => emitir("traza_solicitada") },
        {
            icono: "eliminar",
            texto: t("comun.botones.borrar"),
            onClick: () => emitir("borrado_solicitado"),
            advertencia: true,
            deshabilitado: !pedidoPendiente(pedido),
        },
    ];

    return (
        <Detalle
            id={id}
            obtenerTitulo={titulo}
            obtenerEstado={(P: Pedido) => <EtiquetaEstado {...etiquetaEstadoPedido(P)} />}
            obtenerDatosClave={datosClave}
            setEntidad={() => {}}
            entidad={pedido}
            cerrarDetalle={() => emitir("pedido_deseleccionado", null, true)}
        >
            <div className="DetallePedido">
                <div className="maestro-botones">
                    <QuimeraAcciones acciones={accionesPedido} vertical />
                </div>
                <Tabs
                    children={[
                        <Tab
                            key="tab-lineas"
                            label={t("comun.documento.pestanas.lineas")}
                            children={
                                <LineasPedido
                                    pedido={pedido}
                                    lineas={lineas}
                                    estado={estado}
                                    publicar={emitir}
                                />
                            }
                        />,
                        <Tab
                            key="tab-proveedor"
                            label={t("comun.documento.pestanas.proveedor")}
                            children={<TabProveedor form={formModelo} publicar={emitir} />}
                        />,
                        <Tab
                            key="tab-datos"
                            label={t("comun.documento.pestanas.datos")}
                            children={<TabDatos form={formModelo} publicar={emitir} />}
                        />,
                        <Tab
                            key="tab-observaciones"
                            label={t("comun.campos.observaciones")}
                            children={<TabObservaciones form={formModelo} />}
                        />,
                    ]}
                />
                <TotalesDocumento form={formModelo} />
            </div>

            {estado === "CAMBIANDO_DIVISA" && (
                <CambiarDivisa
                    publicar={emitir}
                    divisaId={pedido.divisaId}
                    tasaConversion={pedido.tasaConversion}
                />
            )}

            {estado === "CAMBIANDO_PROVEEDOR" && (
                <CambioProveedor
                    documento={pedido}
                    onGuardar={async (cambio) => emitir("cambio_proveedor_listo", cambio)}
                    onCancelar={() => emitir("cambio_proveedor_cancelado")}
                />
            )}

            {estado === "BORRANDO" && (
                <BorrarPedido pedido={pedido} publicar={emitir} />
            )}

            {estado === "VIENDO_TRAZA" && (
              <ModalTraza
                id={pedido.id}
                getTraza={getTrazaPedido}
                onCerrar={() => emitir("traza_cerrada")}
              />
            )}
        </Detalle>
    );
};
