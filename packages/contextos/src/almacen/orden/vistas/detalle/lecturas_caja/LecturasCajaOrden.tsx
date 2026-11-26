import { urlFicha } from "#/almacen/comun/fichas.ts";
import { MetaTabla } from "@olula/componentes/atomos/qtablacontrolada.tsx";
import { ListadoSemiControlado } from "@olula/componentes/maestro/ListadoSemiControlado.tsx";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { LecturaCajaOrden, LecturaLineaOrden, OrdenAlmacen } from "../../../diseño.ts";
import { tAlmacen } from "../../../../i18n/index.ts";

const formatearFechaHora = (fechaHora: Date | string): string => {
    const d = fechaHora instanceof Date ? fechaHora : new Date(fechaHora);
    return isNaN(d.getTime()) ? String(fechaHora) : d.toLocaleString();
};

const getLecturasDeLinea = (orden: OrdenAlmacen, lecturaCajaId: string): LecturaLineaOrden[] =>
    orden.lineas.flatMap((linea) =>
        linea.lecturas.filter((l) => l.idLecturaCaja === lecturaCajaId)
    );

const ExpansionLecturas = ({ entidad, orden }: { entidad: LecturaCajaOrden; orden: OrdenAlmacen }) => {
    const lecturas = getLecturasDeLinea(orden, entidad.id);
    if (!lecturas.length) return <p>{tAlmacen("orden.sinLecturas")}</p>;
    return (
        <table>
            <thead>
                <tr>
                    <th>{tAlmacen("orden.sku")}</th>
                    <th>{tAlmacen("orden.lote")}</th>
                    <th>{tAlmacen("orden.cantidad")}</th>
                    <th>{tAlmacen("orden.fechaHora")}</th>
                    <th>{tAlmacen("orden.ubiOrigen")}</th>
                    <th>{tAlmacen("orden.ubiDestino")}</th>
                </tr>
            </thead>
            <tbody>
                {lecturas.map((l) => (
                    <tr key={l.id}>
                        <td>{l.sku}</td>
                        <td>{l.loteId}</td>
                        <td>{l.cantidad}</td>
                        <td>{formatearFechaHora(l.fechaHora)}</td>
                        <td>{l.ubicacionOrigen}</td>
                        <td>{l.ubicacionDestino}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

const metaTablaLecturasCaja: MetaTabla<LecturaCajaOrden> = {
    cols: [
        { id: "lpn", cabecera: "LPN", enlace: (l) => urlFicha.caja(l.idCaja) },
        { id: "ubicacionDestino", cabecera: "Ubi.Destino", enlace: (l) => urlFicha.ubicacion(l.idUbicacionDestino) },
        { id: "cajaDestino", get cabecera() { return tAlmacen("orden.cajaDestino2"); }, enlace: (l) => urlFicha.caja(l.idCajaDestino) },
        { id: "cajaCompleta", get cabecera() { return tAlmacen("orden.cajaCompleta"); } },
        {
            id: "fechaHora",
            get cabecera() { return tAlmacen("orden.fechaHora"); },
            render: (lectura: LecturaCajaOrden) =>
                formatearFechaHora(lectura.fechaHora),
        },
    ],
};

export const LecturasCajaOrden = ({
    orden,
}: {
    orden: OrdenAlmacen;
}) => {
    const metaTabla: MetaTabla<LecturaCajaOrden> = {
        ...metaTablaLecturasCaja,
        expansion: ({ entidad }: { entidad: LecturaCajaOrden }) => (
            <ExpansionLecturas entidad={entidad} orden={orden} />
        ),
    };
    if (!orden.lecturasCaja.length) return <p><i>{tAlmacen("orden.sinLecturasDeCaja")}</i></p>;

    return (
        <>
            <h3>{tAlmacen("orden.lecturasDeCaja")}</h3>
            <ListadoSemiControlado
                metaTabla={metaTabla}
                entidades={orden.lecturasCaja}
                totalEntidades={orden.lecturasCaja.length}
                cargando={false}
                seleccionada={null}
                onSeleccion={() => null}
                criteriaInicial={criteriaDefecto}
                onCriteriaChanged={() => null}
                modo="tabla"
            />
        </>
    );
};
