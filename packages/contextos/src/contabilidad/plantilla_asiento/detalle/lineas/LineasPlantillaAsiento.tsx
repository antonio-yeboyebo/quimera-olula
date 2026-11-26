import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { ListaEntidades } from "@olula/lib/ListaEntidades.js";
import { BorrarPartidaPlantilla } from "../../borrar_linea/BorrarPartidaPlantilla.tsx";
import { CambiarPartidaPlantilla } from "../../cambiar_linea/CambiarPartidaPlantilla.tsx";
import { CrearPartidaPlantilla } from "../../crear_linea/CrearPartidaPlantilla.tsx";
import { PartidaPlantilla, PlantillaAsiento } from "../../diseño.ts";
import { EstadoDetallePlantillaAsiento } from "../maquina.ts";
import { LineasLista } from "./LineasLista.tsx";
import { tContabilidad } from "../../../i18n/index.ts";

export const LineasPlantillaAsiento = ({
    plantilla,
    partidas,
    estado,
    publicar,
}: {
    plantilla: PlantillaAsiento;
    partidas: ListaEntidades<PartidaPlantilla>;
    estado: EstadoDetallePlantillaAsiento;
    publicar: EmitirEvento;
}) => (
    <>
        <div className="botones maestro-botones">
            <QBoton onClick={() => publicar("alta_linea_solicitada")}>{tContabilidad("plantilla_asiento.nuevaPartida")}</QBoton>
            <QBoton onClick={() => publicar("cambio_linea_solicitado")} deshabilitado={!partidas.activo}>
                {tContabilidad("plantilla_asiento.editar")}
            </QBoton>
            <QBoton onClick={() => publicar("baja_linea_solicitada")} deshabilitado={!partidas.activo}>
                {tContabilidad("plantilla_asiento.borrar")}
            </QBoton>
        </div>
        <LineasLista partidas={partidas.lista} seleccionada={partidas.activo?.id} publicar={publicar} />
        {estado === "CREANDO_LINEA" && <CrearPartidaPlantilla plantilla={plantilla} publicar={publicar} />}
        {partidas.activo && estado === "CAMBIANDO_LINEA" && (
            <CambiarPartidaPlantilla plantilla={plantilla} partida={partidas.activo} publicar={publicar} />
        )}
        {partidas.activo && estado === "BORRANDO_LINEA" && (
            <BorrarPartidaPlantilla plantilla={plantilla} partida={partidas.activo} publicar={publicar} />
        )}
    </>
);
