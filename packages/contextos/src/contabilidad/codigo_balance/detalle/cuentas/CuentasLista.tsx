import { MetaTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { ListadoSemiControlado } from "@olula/componentes/maestro/ListadoSemiControlado.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { CuentaCodigoBalance } from "../../diseño.ts";
import { tContabilidad } from "../../../i18n/index.ts";

const metaTablaCuentas: MetaTabla<CuentaCodigoBalance> = [
    { id: "codigoCuenta", get cabecera() { return tContabilidad("codigo_balance.cuenta"); } },
    { id: "descripcionCuenta", get cabecera() { return tContabilidad("codigo_balance.descripcion"); } },
    { id: "signo", get cabecera() { return tContabilidad("codigo_balance.signo"); } },
];

export const CuentasLista = ({
    cuentas,
    seleccionada,
    publicar,
}: {
    cuentas: CuentaCodigoBalance[];
    seleccionada?: string;
    publicar: EmitirEvento;
}) => (
    <ListadoSemiControlado
        metaTabla={metaTablaCuentas}
        entidades={cuentas}
        totalEntidades={cuentas.length}
        cargando={false}
        seleccionada={cuentas.find((c) => c.id === seleccionada) ?? null}
        onSeleccion={(cuenta: CuentaCodigoBalance) => publicar("cuenta_seleccionada", cuenta)}
        criteriaInicial={criteriaDefecto}
        onCriteriaChanged={() => null}
        modo="tabla"
    />
);
