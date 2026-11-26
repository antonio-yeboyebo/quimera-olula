import { EmitirEvento } from "@olula/lib/diseño.ts";
import { ListaEntidades } from "@olula/lib/ListaEntidades.ts";
import { BorrarLineaAlbaran } from "../../borrar_linea/BorrarLineaAlbaran.tsx";
import { CambiarLineaAlbaran } from "../../cambiar_linea/CambiarLineaAlbaran.tsx";
import { CrearLineaAlbaran } from "../../crear_linea/CrearLineaAlbaran.tsx";
import { Albaran, LineaAlbaran } from "../../diseño.ts";
import { albaranFacturado } from "../../dominio.ts";
import { EstadoDetalleAlbaran } from "../diseño.ts";
import { LineasLista } from "./LineasLista.tsx";
import { useTCompras } from "#/compras/i18n/index.ts";

export const LineasAlbaran = ({
    albaran,
    lineas,
    estado,
    publicar,
}: {
    albaran: Albaran;
    lineas: ListaEntidades<LineaAlbaran>;
    estado: EstadoDetalleAlbaran;
    publicar: EmitirEvento;
}) => {
    const t = useTCompras();
    const activa = lineas.activo;
    const editable = !albaranFacturado(albaran);

    const acciones = [
        {
            texto: t("comun.botones.nueva"),
            onClick: () => publicar("alta_linea_solicitada"),
        },
        {
            texto: t("comun.botones.editar"),
            onClick: () => publicar("cambio_linea_solicitado"),
            deshabilitado: !activa,
        },
        {
            icono: "eliminar",
            texto: t("comun.botones.borrar"),
            advertencia: true,
            onClick: () => publicar("baja_linea_solicitada"),
            deshabilitado: !activa,
        },
    ];

    return (
        <>
            <LineasLista
                lineas={lineas.lista}
                divisa={albaran.divisaId}
                seleccionada={activa?.id}
                acciones={editable ? acciones : undefined}
                publicar={publicar}
            />
            {estado === "CREANDO_LINEA" && (
                <CrearLineaAlbaran albaran={albaran} publicar={publicar} />
            )}
            {activa && estado === "CAMBIANDO_LINEA" && (
                <CambiarLineaAlbaran albaran={albaran} linea={activa} publicar={publicar} />
            )}
            {activa && estado === "BORRANDO_LINEA" && (
                <BorrarLineaAlbaran albaran={albaran} linea={activa} publicar={publicar} />
            )}
        </>
    );
};
