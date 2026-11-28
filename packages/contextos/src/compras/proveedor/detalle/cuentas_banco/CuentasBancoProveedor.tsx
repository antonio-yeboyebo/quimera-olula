import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { ListaEntidades } from "@olula/lib/ListaEntidades.ts";
import { BorrarCuentaBancoProveedor } from "../../borrar_cuenta_banco/BorrarCuentaBancoProveedor.tsx";
import { CambiarCuentaBancoProveedor } from "../../cambiar_cuenta_banco/CambiarCuentaBancoProveedor.tsx";
import { CrearCuentaBancoProveedor } from "../../crear_cuenta_banco/CrearCuentaBancoProveedor.tsx";
import { CuentaBancoProveedor, Proveedor } from "../../diseño.ts";
import { EstadoDetalleProveedor } from "../diseño.ts";
import { CuentasBancoLista } from "./CuentasBancoLista.tsx";
import { useTCompras } from "#/compras/i18n/index.ts";

export const CuentasBancoProveedor = ({
    proveedor,
    cuentas,
    estado,
    publicar,
}: {
    proveedor: Proveedor;
    cuentas: ListaEntidades<CuentaBancoProveedor>;
    estado: EstadoDetalleProveedor;
    publicar: EmitirEvento;
}) => {
    const t = useTCompras();
    const activa = cuentas.activo;
    const esCuentaPago = !!activa && activa.id === proveedor.cuentaPagoId;

    return (
        <>
            <div className="botones maestro-botones">
                <QBoton onClick={() => publicar("alta_cuenta_solicitada")}>
                    {t("proveedor.cuentas.nueva")}
                </QBoton>
                <QBoton
                    onClick={() => publicar("cambio_cuenta_solicitado")}
                    deshabilitado={!activa}
                >
                    {t("comun.botones.editar")}
                </QBoton>
                <QBoton
                    onClick={() => publicar("baja_cuenta_solicitada")}
                    deshabilitado={!activa}
                >
                    {t("comun.botones.borrar")}
                </QBoton>
                {esCuentaPago ? (
                    <QBoton onClick={() => publicar("cuenta_pago_desasignada")}>
                        {t("proveedor.cuentas.quitarPago")}
                    </QBoton>
                ) : (
                    <QBoton
                        onClick={() => publicar("cuenta_pago_solicitada")}
                        deshabilitado={!activa}
                    >
                        {t("proveedor.cuentas.marcarPago")}
                    </QBoton>
                )}
            </div>
            <CuentasBancoLista
                cuentas={cuentas.lista}
                cuentaPagoId={proveedor.cuentaPagoId}
                seleccionada={activa?.id}
                publicar={publicar}
            />
            {estado === "CREANDO_CUENTA" && (
                <CrearCuentaBancoProveedor proveedor={proveedor} publicar={publicar} />
            )}
            {activa && estado === "CAMBIANDO_CUENTA" && (
                <CambiarCuentaBancoProveedor
                    proveedor={proveedor}
                    cuenta={activa}
                    publicar={publicar}
                />
            )}
            {activa && estado === "BORRANDO_CUENTA" && (
                <BorrarCuentaBancoProveedor
                    proveedor={proveedor}
                    cuenta={activa}
                    publicar={publicar}
                />
            )}
        </>
    );
};
