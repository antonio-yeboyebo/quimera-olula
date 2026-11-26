import { QSelect } from "@olula/componentes/index.js";
import { QAutocompletarProps } from "@olula/componentes/moleculas/qautocompletar.tsx";
import { tContabilidad } from "../../i18n/index.ts";

type TipoDocumentoAsientoProps = Omit<
    QAutocompletarProps,
    "obtenerOpciones" | "label" | "nombre"
> & {
    label?: string;
    nombre?: string;
};

/**
 * Los valores son los literales que guarda `co_asientos.tipodocumento`, que es
 * con los que habla la API. La primera opción, vacía, es el asiento sin
 * documento de origen: el caso normal de un asiento manual.
 */
const TIPOS_DOCUMENTO_ASIENTO = [
    { valor: "", get descripcion() { return tContabilidad("comun.sinDocumento"); } },
    { valor: "Factura de cliente", get descripcion() { return tContabilidad("comun.facturaDeCliente"); } },
    { valor: "Factura de proveedor", get descripcion() { return tContabilidad("comun.facturaDeProveedor"); } },
    { valor: "Recibo de cliente", get descripcion() { return tContabilidad("comun.reciboDeCliente"); } },
    { valor: "Recibo de proveedor", get descripcion() { return tContabilidad("comun.reciboDeProveedor"); } },
    { valor: "Arqueo TPV", get descripcion() { return tContabilidad("comun.arqueoTpv"); } },
];

export const TipoDocumentoAsiento = ({
    valor,
    nombre = "tipoDocumento",
    label = tContabilidad("comun.tipoDeDocumento"),
    onChange,
    ...props
}: TipoDocumentoAsientoProps) => {
    return (
        <QSelect
            label={label}
            nombre={nombre}
            valor={valor}
            onChange={onChange}
            opciones={TIPOS_DOCUMENTO_ASIENTO}
            {...props}
        />
    );
};
