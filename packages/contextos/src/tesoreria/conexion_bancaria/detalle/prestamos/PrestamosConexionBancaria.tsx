import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QEtiqueta } from "@olula/componentes/atomos/qetiqueta.tsx";
import { MetaTabla } from "@olula/componentes/atomos/qtablacontrolada.tsx";
import { ListadoSemiControlado } from "@olula/componentes/maestro/ListadoSemiControlado.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { criteriaDefecto, formatearMoneda } from "@olula/lib/dominio.ts";
import { PrestamoBancario } from "../../diseño.js";
import { tTesoreria } from "../../../i18n/index.ts";

/**
 * Préstamos leídos del banco. Sus cuotas se contabilizan al conciliar el cargo
 * en la cuenta (capital e intereses contra el banco), con las subcuentas que
 * se indican aquí (ver configurar_prestamo/).
 */
export const PrestamosConexionBancaria = ({
    prestamos,
    publicar,
}: {
    prestamos: PrestamoBancario[];
    publicar: EmitirEvento;
}) => {
    const metaTabla: MetaTabla<PrestamoBancario> = [
        {
            id: "nombre",
            cabecera: tTesoreria("conexion_bancaria.prestamo"),
            render: (p) => (
                <div>
                    <div>{p.nombre}</div>
                    {p.contrato && <small>{p.contrato}</small>}
                </div>
            ),
        },
        {
            id: "capitalPendiente",
            cabecera: tTesoreria("conexion_bancaria.pendiente"),
            render: (p) => (p.capitalPendiente !== null ? formatearMoneda(p.capitalPendiente, p.divisa ?? "EUR") : "-"),
        },
        {
            id: "cuota",
            cabecera: tTesoreria("conexion_bancaria.cuota"),
            render: (p) => (p.cuota !== null ? formatearMoneda(p.cuota, p.divisa ?? "EUR") : "-"),
        },
        {
            id: "codigoSubcuentaCapital",
            cabecera: tTesoreria("conexion_bancaria.subcuentas"),
            render: (p) => (p.codigoSubcuentaCapital && p.codigoSubcuentaIntereses
                ? `${p.codigoSubcuentaCapital} / ${p.codigoSubcuentaIntereses}`
                : <QEtiqueta variante="advertencia">{tTesoreria("conexion_bancaria.sinConfigurar")}</QEtiqueta>),
        },
        {
            id: "cuotasSinContabilizar",
            cabecera: tTesoreria("conexion_bancaria.sinContabilizar"),
            render: (p) => String(p.cuotasSinContabilizar),
        },
        {
            id: "id",
            cabecera: "",
            render: (p) => (
                <div className="maestro-botones">
                    <QBoton tamaño="pequeño" variante="borde"
                        onClick={() => publicar("cuotas_prestamo_solicitadas", p)}>
                        {tTesoreria("conexion_bancaria.cuotas")}
                    </QBoton>
                    <QBoton tamaño="pequeño" onClick={() => publicar("configurar_prestamo_solicitado", p)}>
                        {tTesoreria("conexion_bancaria.subcuentas")}
                    </QBoton>
                </div>
            ),
        },
    ];

    return (
        <ListadoSemiControlado<PrestamoBancario>
            metaTabla={metaTabla}
            entidades={prestamos}
            totalEntidades={prestamos.length}
            cargando={false}
            seleccionada={null}
            onSeleccion={() => null}
            criteriaInicial={criteriaDefecto}
            onCriteriaChanged={() => null}
            modo="tabla"
        />
    );
};
