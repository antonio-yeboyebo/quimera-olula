import { QEtiqueta } from "@olula/componentes/atomos/qetiqueta.tsx";
import { MetaTabla, QTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { formatearMoneda } from "@olula/lib/dominio.ts";
import { AmortizacionPrestamo, PrestamoBancario } from "../diseño.js";
import { tTesoreria } from "../../i18n/index.ts";

const SIN_ORDEN = ["", ""];

/** Cuotas cobradas y programadas del préstamo, tal como las reporta el banco. */
export const CuotasPrestamoConexionBancaria = ({
    prestamo,
    publicar,
}: {
    prestamo: PrestamoBancario;
    publicar: EmitirEvento;
}) => {
    const divisa = prestamo.divisa ?? "EUR";
    const metaTabla: MetaTabla<AmortizacionPrestamo> = [
        { id: "fecha", cabecera: tTesoreria("conexion_bancaria.fecha"), tipo: "fecha" },
        { id: "capital", cabecera: tTesoreria("conexion_bancaria.capital"), render: (a) => formatearMoneda(a.capital, divisa) },
        { id: "intereses", cabecera: tTesoreria("conexion_bancaria.intereses"), render: (a) => formatearMoneda(a.intereses, divisa) },
        { id: "total", cabecera: tTesoreria("conexion_bancaria.total"), render: (a) => formatearMoneda(a.total, divisa) },
        {
            id: "capitalPendiente",
            cabecera: tTesoreria("conexion_bancaria.capitalPendiente"),
            render: (a) => (a.capitalPendiente !== null ? formatearMoneda(a.capitalPendiente, divisa) : "-"),
        },
        {
            id: "asientoId",
            cabecera: tTesoreria("conexion_bancaria.estado"),
            render: (a) => (a.programada
                ? <QEtiqueta variante="gris">{tTesoreria("conexion_bancaria.programada")}</QEtiqueta>
                : a.asientoId !== null
                    ? <QEtiqueta variante="exito">{tTesoreria("conexion_bancaria.contabilizada")}</QEtiqueta>
                    : <QEtiqueta variante="advertencia">{tTesoreria("conexion_bancaria.sinContabilizar")}</QEtiqueta>),
        },
    ];

    return (
        <QModal abierto={true} nombre="cuotasPrestamoConexionBancaria"
            titulo={tTesoreria("conexion_bancaria.cuotasDelPrestamoValor", { valor: prestamo.contrato ?? prestamo.nombre })}
            onCerrar={() => publicar("cuotas_prestamo_cerradas")}>
            <QTabla<AmortizacionPrestamo>
                metaTabla={metaTabla}
                datos={prestamo.amortizaciones}
                cargando={false}
                orden={SIN_ORDEN}
            />
        </QModal>
    );
};
