import { urlListado } from "#/almacen/comun/fichas.ts";
import { BorrarPasillo } from "#/almacen/pasillo/borrar_pasillo/BorrarPasillo.tsx";
import { CambiarPasillo } from "#/almacen/pasillo/cambiar_pasillo/CambiarPasillo.tsx";
import { CrearPasillo } from "#/almacen/pasillo/crear_pasillo/CrearPasillo.tsx";
import { Pasillo } from "#/almacen/pasillo/diseño.ts";
import { descripcionAccesos, descripcionCaras } from "#/almacen/pasillo/dominio.ts";
import { GenerarUbicacionesPasillo } from "#/almacen/pasillo/generar_ubicaciones/GenerarUbicacionesPasillo.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { MetaTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { ListadoSemiControlado } from "@olula/componentes/maestro/ListadoSemiControlado.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { ListaEntidades } from "@olula/lib/ListaEntidades.js";
import { Zona } from "../../../diseño.ts";
import { EstadoDetalleZona } from "../diseño.ts";
import "./PasillosZona.css";
import { tAlmacen } from "../../../../i18n/index.ts";

const metaTablaPasillos: MetaTabla<Pasillo> = [
    { id: "orden", get cabecera() { return tAlmacen("zona.orden"); } },
    // Lleva a las ubicaciones del pasillo.
    { id: "codigo", get cabecera() { return tAlmacen("zona.codigo"); }, enlace: (p) => urlListado.ubicacionesDePasillo(p.id) },
    { id: "caras", get cabecera() { return tAlmacen("zona.caras"); }, render: (p) => descripcionCaras(p.caras) },
    { id: "modulos", get cabecera() { return tAlmacen("zona.modulosCara"); } },
    { id: "accesos", get cabecera() { return tAlmacen("zona.accesos"); }, render: (p) => descripcionAccesos(p.accesos) },
];

export const PasillosZona = ({
    zona,
    pasillos,
    estado,
    publicar,
}: {
    zona: Zona;
    pasillos: ListaEntidades<Pasillo>;
    estado: EstadoDetalleZona;
    publicar: EmitirEvento;
}) => {
    const activo = pasillos.activo;

    return (
        <div className="PasillosZona">
            <div className="botones maestro-botones">
                <QBoton onClick={() => publicar("alta_pasillo_solicitada")}>{tAlmacen("zona.nuevoPasillo")}</QBoton>
                <QBoton onClick={() => publicar("cambio_pasillo_solicitado")} deshabilitado={!activo}>
                    {tAlmacen("zona.editar")}
                </QBoton>
                <QBoton onClick={() => publicar("baja_pasillo_solicitada")} deshabilitado={!activo}>
                    {tAlmacen("zona.borrar")}
                </QBoton>
                <QBoton onClick={() => publicar("generar_ubicaciones_solicitado")} deshabilitado={!activo}>
                    {tAlmacen("zona.generarUbicaciones")}
                </QBoton>
            </div>
            <ListadoSemiControlado
                metaTabla={metaTablaPasillos}
                entidades={pasillos.lista}
                totalEntidades={pasillos.total}
                cargando={false}
                seleccionada={activo}
                onSeleccion={(pasillo: Pasillo) => publicar("pasillo_seleccionado", pasillo)}
                criteriaInicial={criteriaDefecto}
                onCriteriaChanged={() => null}
                modo="tabla"
            />
            {estado === "CREANDO_PASILLO" && <CrearPasillo zona={zona} publicar={publicar} />}
            {activo && estado === "CAMBIANDO_PASILLO" && (
                <CambiarPasillo pasillo={activo} publicar={publicar} />
            )}
            {activo && estado === "BORRANDO_PASILLO" && (
                <BorrarPasillo pasillo={activo} publicar={publicar} />
            )}
            {activo && estado === "GENERANDO_UBICACIONES" && (
                <GenerarUbicacionesPasillo pasillo={activo} publicar={publicar} />
            )}
        </div>
    );
};
