import { EtiquetaEstado } from "#/comun/componentes/etiqueta_estado/EtiquetaEstado.tsx";
import { useDatosClaveDocumentoCompra } from "#/compras/comun/vistas/useDatosClaveDocumentoCompra.ts";
import { ModalTraza } from "#/comun/componentes/traza/ModalTraza.tsx";
import { AsientoDeDocumento } from "#/contabilidad/asiento/vistas/detalle/AsientoDeDocumento.tsx";
import { CambiarDivisa } from "#/ventas/comun/componentes/moleculas/CambiarDivisa/CambiarDivisa.tsx";
import { CambioProveedor } from "#/compras/comun/componentes/moleculas/CambioProveedor/CambioProveedor.tsx";
import { Detalle } from "@olula/componentes/detalle/Detalle.tsx";
import { Tab, Tabs } from "@olula/componentes/detalle/tabs/Tabs.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { QuimeraAcciones } from "@olula/componentes/moleculas/qacciones.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { puede } from "@olula/lib/dominio.ts";
import { imprimir_blob } from "@olula/lib/impresion.ts";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useEffect } from "react";
import { BorrarFactura } from "../borrar/BorrarFactura.tsx";
import { CambiarRectificativa } from "../cambiar_rectificativa/CambiarRectificativa.tsx";
import { Factura } from "../diseño.ts";
import { etiquetaEstadoFactura, facturaEditable, facturaRegistrable } from "../dominio.ts";
import { getReportFactura, getTrazaFactura } from "../infraestructura.ts";
import { RegistrarFactura } from "../registrar/RegistrarFactura.tsx";
import {
    contextoDetalleFacturaInicial,
    guardarFactura,
    metaFactura,
} from "./detalle.ts";
import "./DetalleFactura.css";
import { LineasFactura } from "./lineas/LineasFactura.tsx";
import { getMaquina } from "./maquina.ts";
import { TabDatos } from "./TabDatos.tsx";
import { TabObservaciones } from "./TabObservaciones.tsx";
import { TabProveedor } from "./TabProveedor.tsx";
import { TabRecibos } from "./TabRecibos.tsx";
import { TotalesDocumento } from "#/compras/comun/componentes/TotalesDocumento.tsx";
import { useTCompras } from "#/compras/i18n/index.ts";

export const DetalleFactura = ({
    id,
    publicar = async () => {},
}: {
    id?: string;
    publicar?: EmitirEvento;
}) => {
    const t = useTCompras();
    const { ctx, emitir } = useMaquina(getMaquina, contextoDetalleFacturaInicial, publicar);

    const autoGuardar = useCallback(
        async (factura: Factura) => {
            await guardarFactura(ctx, factura);
            await emitir("factura_guardada");
        },
        [ctx, emitir]
    );

    const formModelo = useModelo(metaFactura, ctx.factura, autoGuardar);
    const datosClave = useDatosClaveDocumentoCompra();

    const { estado, factura, lineas } = ctx;

    useEffect(() => {
        emitir("factura_id_cambiado", id, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    if (!factura.id) return null;

    const imprimir = async () => {
        const blob = await getReportFactura(factura.id);
        imprimir_blob(blob);
    };

    const titulo = (f: Factura) =>
        `${f.codigo}${f.nombreProveedor ? ` · ${f.nombreProveedor}` : ""}`;

    const editable = facturaEditable(factura);

    const accionesFactura = [
        { texto: t("comun.botones.imprimir"), onClick: imprimir },
        { texto: t("comun.botones.documentosRelacionados"), onClick: () => emitir("traza_solicitada") },
        {
            texto: t("factura.detalle.registrar"),
            onClick: () => emitir("registro_solicitado"),
            deshabilitado: !facturaRegistrable(factura),
            principal: true,
        },
        {
            texto: t("factura.detalle.rectificativa"),
            onClick: () => emitir("cambio_rectificativa_solicitado"),
            deshabilitado: !editable,
        },
        {
            icono: "eliminar",
            texto: t("comun.botones.borrar"),
            onClick: () => emitir("borrado_solicitado"),
            advertencia: true,
            deshabilitado: !editable,
        },
    ];

    return (
        <Detalle
            id={id}
            obtenerTitulo={titulo}
            obtenerEstado={(F: Factura) => <EtiquetaEstado {...etiquetaEstadoFactura(F)} />}
            obtenerDatosClave={datosClave}
            setEntidad={() => {}}
            entidad={factura}
            cerrarDetalle={() => emitir("factura_deseleccionada", null, true)}
        >
            <div className="DetalleFactura">
                <div className="maestro-botones">
                    <QuimeraAcciones acciones={accionesFactura} vertical />
                </div>
                <Tabs
                    children={[
                        <Tab
                            key="tab-lineas"
                            label={t("comun.documento.pestanas.lineas")}
                            children={
                                <LineasFactura
                                    factura={factura}
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
                        <Tab
                            key="tab-recibos"
                            label={t("factura.detalle.recibos")}
                            children={<TabRecibos facturaId={factura.id} />}
                        />,
                        puede("contabilidad.asiento") && (
                            <Tab
                                key="tab-contabilidad"
                                label={t("factura.detalle.contabilidad")}
                                children={<AsientoDeDocumento asientoId={factura.asientoId} sinDatosDocumento />}
                            />
                        ),
                    ]}
                />
                <TotalesDocumento form={formModelo} />
            </div>

            {estado === "CAMBIANDO_DIVISA" && (
                <CambiarDivisa
                    publicar={emitir}
                    divisaId={factura.divisaId}
                    tasaConversion={factura.tasaConversion}
                />
            )}

            {estado === "CAMBIANDO_PROVEEDOR" && (
                <CambioProveedor
                    documento={factura}
                    onGuardar={async (cambio) => emitir("cambio_proveedor_listo", cambio)}
                    onCancelar={() => emitir("cambio_proveedor_cancelado")}
                />
            )}

            {estado === "BORRANDO" && (
                <BorrarFactura factura={factura} publicar={emitir} />
            )}

            {estado === "REGISTRANDO" && (
                <RegistrarFactura factura={factura} publicar={emitir} />
            )}

            {estado === "CAMBIANDO_RECTIFICATIVA" && (
                <CambiarRectificativa factura={factura} publicar={emitir} />
            )}

            {estado === "VIENDO_TRAZA" && (
              <ModalTraza
                id={ctx.factura.id}
                getTraza={getTrazaFactura}
                onCerrar={() => emitir("traza_cerrada")}
              />
            )}
        </Detalle>
    );
};
