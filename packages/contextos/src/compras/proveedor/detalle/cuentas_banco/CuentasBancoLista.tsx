import { MetaTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { ListadoSemiControlado } from "@olula/componentes/maestro/ListadoSemiControlado.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { criteriaDefecto } from "@olula/lib/dominio.ts";
import { CuentaBancoProveedor } from "../../diseño.ts";
import { tCompras, useTCompras } from "#/compras/i18n/index.ts";

const metaTablaCuentas = (cuentaPagoId: string | null, t = tCompras): MetaTabla<CuentaBancoProveedor> => [
    {
        id: "pago",
        cabecera: t("proveedor.cuentas.pago"),
        render: (c: CuentaBancoProveedor) => (c.id === cuentaPagoId ? t("comun.si") : ""),
    },
    { id: "descripcion", cabecera: t("comun.campos.descripcion") },
    { id: "iban", cabecera: t("proveedor.cuentas.iban") },
    { id: "bic", cabecera: t("proveedor.cuentas.bic") },
    { id: "entidad", cabecera: t("proveedor.cuentas.entidad") },
    { id: "agencia", cabecera: t("proveedor.cuentas.agencia") },
];

export const CuentasBancoLista = ({
    cuentas,
    cuentaPagoId,
    seleccionada,
    publicar,
}: {
    cuentas: CuentaBancoProveedor[];
    cuentaPagoId: string | null;
    seleccionada?: string;
    publicar: EmitirEvento;
}) => {
    const t = useTCompras();
    return (
        <ListadoSemiControlado
            metaTabla={metaTablaCuentas(cuentaPagoId, t)}
            entidades={cuentas}
            totalEntidades={cuentas.length}
            cargando={false}
            seleccionada={cuentas.find((c) => c.id === seleccionada) ?? null}
            onSeleccion={(cuenta: CuentaBancoProveedor) =>
                publicar("cuenta_seleccionada", cuenta)
            }
            criteriaInicial={criteriaDefecto}
            onCriteriaChanged={() => null}
            modo="tabla"
        />
    );
};
