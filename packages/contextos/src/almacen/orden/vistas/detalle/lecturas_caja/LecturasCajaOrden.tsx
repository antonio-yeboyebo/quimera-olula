import { MetaTabla } from "@olula/componentes/atomos/qtablacontrolada.tsx";
import { ListadoSemiControlado } from "@olula/componentes/maestro/ListadoSemiControlado.tsx";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { LecturaCajaOrden, LecturaLineaOrden, OrdenAlmacen } from "../../../diseño.ts";

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
    if (!lecturas.length) return <p>Sin lecturas</p>;
    return (
        <table>
            <thead>
                <tr>
                    <th>SKU</th>
                    <th>Lote</th>
                    <th>Cantidad</th>
                    <th>Fecha/Hora</th>
                    <th>Ubi.Origen</th>
                    <th>Ubi.Destino</th>
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
        { id: "lpn", cabecera: "LPN" },
        { id: "ubicacionDestino", cabecera: "Ubi.Destino" },
        { id: "cajaDestino", cabecera: "Caja destino" },
        { id: "cajaCompleta", cabecera: "Caja completa" },
        {
            id: "fechaHora",
            cabecera: "Fecha/Hora",
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
    if (!orden.lecturasCaja.length) return <p><i>Sin lecturas de caja</i></p>;

    return (
        <>
            <h3>LECTURAS DE CAJA</h3>
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
