import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { ListaEntidades } from "@olula/lib/ListaEntidades.js";
import { BorrarArticuloTarifa } from "../../borrar_linea/BorrarArticuloTarifa.js";
import { CambiarArticuloTarifa } from "../../cambiar_linea/CambiarArticuloTarifa.js";
import { CrearArticuloTarifa } from "../../crear_linea/CrearArticuloTarifa.js";
import { ArticuloTarifa, Tarifa } from "../../diseño.js";
import { EstadoDetalleTarifa } from "../diseño.js";
import { ArticulosTarifaLista } from "./ArticulosTarifaLista.js";
import { useTVentas } from "../../../i18n/index.ts";

/**
 * Orquestador del sub-recurso: lista de precios por artículo de la tarifa,
 * botones de operación y renderizado condicional de los modales.
 *
 * Los modales no reciben prop `activo`: la visibilidad la controla este
 * componente con `{estado === "X" && <Modal />}`, y reciben el artículo ya
 * resuelto, nunca un id suelto.
 */
export const ArticulosTarifa = ({
    tarifa,
    articulos,
    estado,
    publicar,
}: {
    tarifa: Tarifa;
    articulos: ListaEntidades<ArticuloTarifa>;
    estado: EstadoDetalleTarifa;
    publicar: EmitirEvento;
}) => {
    const t = useTVentas();
    return (
        <>
            <h3>{t("tarifa.articulos.titulo")}</h3>
            <div className="botones maestro-botones">
                <QBoton onClick={() => publicar("alta_articulo_solicitada")}>
                    {t("tarifa.articulos.anadir")}
                </QBoton>
                <QBoton
                    onClick={() => publicar("cambio_articulo_solicitado")}
                    deshabilitado={!articulos.activo}
                >
                    {t("tarifa.articulos.cambiarPrecio")}
                </QBoton>
                <QBoton
                    onClick={() => publicar("baja_articulo_solicitada")}
                    deshabilitado={!articulos.activo}
                    advertencia
                >
                    Quitar
                </QBoton>
            </div>
            <ArticulosTarifaLista
                articulos={articulos.lista}
                divisa={tarifa.divisaId}
                seleccionado={articulos.activo?.id}
                publicar={publicar}
            />
            {estado === "CREANDO_ARTICULO" && (
                <CrearArticuloTarifa tarifa={tarifa} publicar={publicar} />
            )}
            {articulos.activo && estado === "CAMBIANDO_ARTICULO" && (
                <CambiarArticuloTarifa
                    articulo={articulos.activo}
                    publicar={publicar}
                />
            )}
            {articulos.activo && estado === "BORRANDO_ARTICULO" && (
                <BorrarArticuloTarifa
                    articulo={articulos.activo}
                    publicar={publicar}
                />
            )}
        </>
    );
};
