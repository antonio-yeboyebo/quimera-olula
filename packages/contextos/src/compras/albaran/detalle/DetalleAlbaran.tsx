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
import { BorrarAlbaran } from "../borrar/BorrarAlbaran.tsx";
import { FacturaGenerada } from "../facturar/FacturaGenerada.tsx";
import { FacturarAlbaran } from "../facturar/FacturarAlbaran.tsx";
import { Albaran } from "../diseño.ts";
import { albaranFacturado, etiquetaEstadoAlbaran } from "../dominio.ts";
import { getReportAlbaran, getTrazaAlbaran } from "../infraestructura.ts";
import {
    contextoDetalleAlbaranInicial,
    guardarAlbaran,
    metaAlbaran,
} from "./detalle.ts";
import "./DetalleAlbaran.css";
import { LineasAlbaran } from "./lineas/LineasAlbaran.tsx";
import { getMaquina } from "./maquina.ts";
import { TabDatos } from "./TabDatos.tsx";
import { TabObservaciones } from "./TabObservaciones.tsx";
import { TabProveedor } from "./TabProveedor.tsx";
import { TotalesDocumento } from "#/compras/comun/componentes/TotalesDocumento.tsx";
import { useTCompras } from "#/compras/i18n/index.ts";

export const DetalleAlbaran = ({
    id,
    publicar = async () => {},
}: {
    id?: string;
    publicar?: EmitirEvento;
}) => {
    const t = useTCompras();
    const { ctx, emitir } = useMaquina(getMaquina, contextoDetalleAlbaranInicial, publicar);

    const autoGuardar = useCallback(
        async (albaran: Albaran) => {
            await guardarAlbaran(ctx, albaran);
            await emitir("albaran_guardado");
        },
        [ctx, emitir]
    );

    const formModelo = useModelo(metaAlbaran, ctx.albaran, autoGuardar);
    const datosClave = useDatosClaveDocumentoCompra();

    const { estado, albaran, lineas, facturaCreada } = ctx;

    useEffect(() => {
        emitir("albaran_id_cambiado", id, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    if (!albaran.id) return null;

    const titulo = (a: Albaran) =>
        `${a.codigo}${a.nombreProveedor ? ` · ${a.nombreProveedor}` : ""}`;

    const imprimir = async () => {
        const blob = await getReportAlbaran(albaran.id);
        imprimir_blob(blob);
    };

    const accionesAlbaran = [
        { texto: t("comun.botones.imprimir"), onClick: imprimir },
        { texto: t("comun.botones.documentosRelacionados"), onClick: () => emitir("traza_solicitada") },
        {
            texto: t("albaran.detalle.facturar"),
            onClick: () => emitir("facturado_solicitado"),
            deshabilitado: albaranFacturado(albaran),
            principal: true,
        },
        {
            icono: "eliminar",
            texto: t("comun.botones.borrar"),
            onClick: () => emitir("borrado_solicitado"),
            advertencia: true,
            deshabilitado: albaranFacturado(albaran),
        },
    ];

    return (
        <Detalle
            id={id}
            obtenerTitulo={titulo}
            obtenerEstado={(A: Albaran) => <EtiquetaEstado {...etiquetaEstadoAlbaran(A)} />}
            obtenerDatosClave={datosClave}
            setEntidad={() => {}}
            entidad={albaran}
            cerrarDetalle={() => emitir("albaran_deseleccionado", null, true)}
        >
            <div className="DetalleAlbaran">
                <div className="maestro-botones">
                    <QuimeraAcciones acciones={accionesAlbaran} vertical />
                </div>
                <Tabs
                    children={[
                        <Tab
                            key="tab-lineas"
                            label={t("comun.documento.pestanas.lineas")}
                            children={
                                <LineasAlbaran
                                    albaran={albaran}
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
                    divisaId={albaran.divisaId}
                    tasaConversion={albaran.tasaConversion}
                />
            )}

            {estado === "CAMBIANDO_PROVEEDOR" && (
                <CambioProveedor
                    documento={albaran}
                    onGuardar={async (cambio) => emitir("cambio_proveedor_listo", cambio)}
                    onCancelar={() => emitir("cambio_proveedor_cancelado")}
                />
            )}

            {estado === "FACTURANDO" && (
                <FacturarAlbaran albaran={albaran} publicar={emitir} />
            )}

            {estado === "FACTURA_CREADA" && facturaCreada && (
                <FacturaGenerada factura={facturaCreada} publicar={emitir} />
            )}

            {estado === "BORRANDO" && (
                <BorrarAlbaran albaran={albaran} publicar={emitir} />
            )}

            {estado === "VIENDO_TRAZA" && (
              <ModalTraza
                id={ctx.albaran.id}
                getTraza={getTrazaAlbaran}
                onCerrar={() => emitir("traza_cerrada")}
              />
            )}
        </Detalle>
    );
};
