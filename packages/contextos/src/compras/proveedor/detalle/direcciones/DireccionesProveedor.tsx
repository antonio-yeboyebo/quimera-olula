import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { ListaEntidades } from "@olula/lib/ListaEntidades.ts";
import { BorrarDireccionProveedor } from "../../borrar_direccion/BorrarDireccionProveedor.tsx";
import { CambiarDireccionProveedor } from "../../cambiar_direccion/CambiarDireccionProveedor.tsx";
import { CrearDireccionProveedor } from "../../crear_direccion/CrearDireccionProveedor.tsx";
import { DireccionProveedor, Proveedor } from "../../diseño.ts";
import { EstadoDetalleProveedor } from "../diseño.ts";
import { DireccionesLista } from "./DireccionesLista.tsx";
import { useTCompras } from "#/compras/i18n/index.ts";

export const DireccionesProveedor = ({
    proveedor,
    direcciones,
    estado,
    publicar,
}: {
    proveedor: Proveedor;
    direcciones: ListaEntidades<DireccionProveedor>;
    estado: EstadoDetalleProveedor;
    publicar: EmitirEvento;
}) => {
    const t = useTCompras();
    const activa = direcciones.activo;

    return (
        <>
            <div className="botones maestro-botones">
                <QBoton onClick={() => publicar("alta_direccion_solicitada")}>
                    {t("proveedor.direcciones.nueva")}
                </QBoton>
                <QBoton
                    onClick={() => publicar("cambio_direccion_solicitado")}
                    deshabilitado={!activa}
                >
                    {t("comun.botones.editar")}
                </QBoton>
                <QBoton
                    onClick={() => publicar("baja_direccion_solicitada")}
                    deshabilitado={!activa}
                >
                    {t("comun.botones.borrar")}
                </QBoton>
                <QBoton
                    onClick={() => publicar("principal_solicitada")}
                    deshabilitado={!activa || activa.principal}
                >
                    {t("proveedor.direcciones.marcarPrincipal")}
                </QBoton>
            </div>
            <DireccionesLista
                direcciones={direcciones.lista}
                seleccionada={activa?.id}
                publicar={publicar}
            />
            {estado === "CREANDO_DIRECCION" && (
                <CrearDireccionProveedor proveedor={proveedor} publicar={publicar} />
            )}
            {activa && estado === "CAMBIANDO_DIRECCION" && (
                <CambiarDireccionProveedor
                    proveedor={proveedor}
                    direccion={activa}
                    publicar={publicar}
                />
            )}
            {activa && estado === "BORRANDO_DIRECCION" && (
                <BorrarDireccionProveedor
                    proveedor={proveedor}
                    direccion={activa}
                    publicar={publicar}
                />
            )}
        </>
    );
};
