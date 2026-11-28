import { Detalle } from "@olula/componentes/detalle/Detalle.tsx";
import { Tab, Tabs } from "@olula/componentes/detalle/tabs/Tabs.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { QuimeraAcciones } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useModelo } from "@olula/lib/useModelo.js";
import { useEffect } from "react";
import { proveedorBancarioUI } from "../../comun/proveedor_bancario/registro.js";
import { ConfigurarPrestamoConexionBancaria } from "../configurar_prestamo/ConfigurarPrestamoConexionBancaria.js";
import { CuotasPrestamoConexionBancaria } from "../cuotas_prestamo/CuotasPrestamoConexionBancaria.js";
import { ConexionBancaria } from "../diseño.js";
import { esPrestamo, nombreInstitucion, requiereReautenticacion } from "../dominio.js";
import { CuentasConexionBancaria } from "./cuentas/CuentasConexionBancaria.js";
import { PrestamosConexionBancaria } from "./prestamos/PrestamosConexionBancaria.js";
import { ProductosConexionBancaria } from "./productos/ProductosConexionBancaria.js";
import { contextoDetalleConexionBancariaInicial, metaConexionBancaria } from "./detalle.js";
import "./DetalleConexionBancaria.css";
import { DesconectarConexionBancaria } from "../desconectar/DesconectarConexionBancaria.js";
import { ReautenticarBancoConexionBancaria } from "../reautenticar/ReautenticarBancoConexionBancaria.js";
import { getMaquina } from "./maquina.js";
import { TabGeneral } from "./TabGeneral.js";
import { useTTesoreria } from "../../i18n/index.ts";

/**
 * Detalle de solo lectura salvo por la asociación de cuentas (ver
 * detalle/cuentas/CuentasConexionBancaria.tsx, que se auto-guarda por fila),
 * los tipos de producto que se leen (proveedores que cobran por producto) y
 * las subcuentas de los préstamos. No hay edición de la cabecera: la gestiona
 * el proveedor bancario.
 */
export const DetalleConexionBancaria = ({
    id,
    publicar = async () => {},
}: {
    id?: string;
    publicar?: EmitirEvento;
}) => {

    const t = useTTesoreria();
    const { ctx, emitir } = useMaquina(
        getMaquina,
        contextoDetalleConexionBancariaInicial,
        publicar
    );

    const formModelo = useModelo(metaConexionBancaria, ctx.conexion);

    const { estado, conexion, prestamos, prestamoSeleccionado } = ctx;

    useEffect(() => {
        emitir("conexion_bancaria_id_cambiado", id, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    if (!ctx.conexion.id) return null;

    const titulo = (c: ConexionBancaria) => nombreInstitucion(c);
    const eligeTiposProducto = Boolean(proveedorBancarioUI(conexion.proveedor)?.eligeTiposProducto);
    const cuentas = conexion.cuentas.filter((cuenta) => !esPrestamo(cuenta));

    const acciones = [
        requiereReautenticacion(conexion) && {
            texto: t("conexion_bancaria.reautenticarBanco"),
            onClick: () => emitir("reautenticacion_solicitada"),
            advertencia: true,
        },
        {
            texto: t("conexion_bancaria.desconectar"),
            onClick: () => emitir("desconexion_solicitada"),
            advertencia: true,
        },
    ];

    return (
        <Detalle
            id={id}
            obtenerTitulo={titulo}
            setEntidad={() => {}}
            entidad={ctx.conexion}
            cerrarDetalle={() => emitir("conexion_bancaria_deseleccionada", null, true)}
        >
            <div className="DetalleConexionBancaria">
                <div className="maestro-botones">
                    <QuimeraAcciones acciones={acciones} vertical />
                </div>
                <Tabs children={[
                    <Tab label={t("conexion_bancaria.general")}
                        key="tab-general"
                        children={<TabGeneral form={formModelo} />}
                    />,
                    <Tab label={t("conexion_bancaria.cuentasLength", { length: cuentas.length })}
                        key="tab-cuentas"
                        children={
                            <CuentasConexionBancaria
                                conexionId={conexion.id}
                                cuentas={cuentas}
                                publicar={emitir}
                            />
                        }
                    />,
                    ...(prestamos.length > 0 ? [
                        <Tab label={t("conexion_bancaria.prestamosLength", { length: prestamos.length })}
                            key="tab-prestamos"
                            children={<PrestamosConexionBancaria prestamos={prestamos} publicar={emitir} />}
                        />,
                    ] : []),
                    ...(eligeTiposProducto ? [
                        <Tab label={t("conexion_bancaria.productos")}
                            key="tab-productos"
                            children={<ProductosConexionBancaria conexion={conexion} publicar={emitir} />}
                        />,
                    ] : []),
                ]} />
            </div>

            {estado === "REAUTENTICANDO" && (
                <ReautenticarBancoConexionBancaria
                    conexion={ctx.conexion}
                    publicar={emitir}
                />
            )}

            {estado === "CONFIGURANDO_PRESTAMO" && prestamoSeleccionado && (
                <ConfigurarPrestamoConexionBancaria prestamo={prestamoSeleccionado} publicar={emitir} />
            )}

            {estado === "VIENDO_CUOTAS" && prestamoSeleccionado && (
                <CuotasPrestamoConexionBancaria prestamo={prestamoSeleccionado} publicar={emitir} />
            )}

            {estado === "DESCONECTANDO" && (
                <DesconectarConexionBancaria
                    conexion={ctx.conexion}
                    publicar={emitir}
                />
            )}
        </Detalle>
    );
};
