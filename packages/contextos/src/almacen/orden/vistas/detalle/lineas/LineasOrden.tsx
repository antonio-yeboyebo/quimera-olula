import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { ListaEntidades } from "@olula/lib/ListaEntidades.js";
import { BorrarLineaOrden } from "../../borrar_linea/BorrarLineaOrden.tsx";
import { CambiarLineaOrden } from "../../cambiar_linea/CambiarLineaOrden.tsx";
import { CrearLineaOrden } from "../../crear_linea/CrearLineaOrden.tsx";
import { LeerPasosOrden } from "../leer_pasos/LeerPasosOrden.tsx";
import { DevolverSobrante } from "../../devolver_sobrante/DevolverSobrante.tsx";
import { LineaOrdenAlmacen, OrdenAlmacen } from "../../../diseño.ts";
import { EstadoOrdenAlmacen } from "../maquina.ts";
import { LineasOrdenLista } from "./LineasOrdenLista.tsx";
import { tAlmacen } from "../../../../i18n/index.ts";

export const LineasOrden = ({
    orden,
    lineas,
    estado,
    publicar,
    modoVoz = false,
}: {
    orden: OrdenAlmacen;
    lineas: ListaEntidades<LineaOrdenAlmacen>;
    estado: EstadoOrdenAlmacen;
    publicar: EmitirEvento;
    modoVoz?: boolean;
}) => {
    return (
        <>
            <div className="botones maestro-botones">
                <QBoton
                    onClick={() => publicar("alta_linea_solicitada")}
                    deshabilitado={!orden.abierta}
                >
                    {tAlmacen("orden.nuevaLinea")}
                </QBoton>
                <QBoton
                    onClick={() => publicar("cambio_linea_solicitado")}
                    deshabilitado={!lineas.activo || !orden.abierta}
                >
                    {tAlmacen("orden.editar")}
                </QBoton>
                <QBoton
                    onClick={() => publicar("baja_linea_solicitada")}
                    deshabilitado={!lineas.activo || !orden.abierta}
                >
                    {tAlmacen("orden.borrar")}
                </QBoton>
            </div>
            <LineasOrdenLista
                orden={orden}
                lineas={lineas.lista}
                seleccionada={lineas.activo?.id}
                publicar={publicar}
            />
            {estado === "CREANDO_LINEA" && (
                <CrearLineaOrden orden={orden} publicar={publicar} />
            )}
            {lineas.activo && estado === "CAMBIANDO_LINEA" && (
                <CambiarLineaOrden
                    orden={orden}
                    linea={lineas.activo}
                    publicar={publicar}
                />
            )}
            {lineas.activo && estado === "BORRANDO_LINEA" && (
                <BorrarLineaOrden
                    orden={orden}
                    linea={lineas.activo}
                    publicar={publicar}
                />
            )}
            {lineas.activo && estado === "DEVOLVIENDO_SOBRANTE" && (
                <DevolverSobrante orden={orden} linea={lineas.activo} publicar={publicar} />
            )}
            {lineas.activo && estado === "LEYENDO_GUION_PICK_LINEA" && (
                <LeerPasosOrden
                    orden={orden}
                    linea={lineas.activo}
                    publicar={publicar}
                    fase="PICK"
                    modoVoz={modoVoz}
                />
            )}
            {lineas.activo && estado === "LEYENDO_GUION_DROP_LINEA" && (
                <LeerPasosOrden
                    orden={orden}
                    linea={lineas.activo}
                    publicar={publicar}
                    fase="DROP"
                    modoVoz={modoVoz}
                />
            )}
        </>
    );
};
