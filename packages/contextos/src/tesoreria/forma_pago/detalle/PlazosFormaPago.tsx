import { MetaTabla, QTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { Entidad } from "@olula/lib/diseño.ts";
import { PlazoFormaPago } from "../diseño.ts";
import { tTesoreria } from "../../i18n/index.ts";

type FilaPlazo = Entidad & { id: string; dias: number; aplazado: number };

const metaTablaPlazos: MetaTabla<FilaPlazo> = [
    { id: "dias", get cabecera() { return tTesoreria("forma_pago.diasAplazados"); }, tipo: "numero" },
    { id: "aplazado", get cabecera() { return tTesoreria("forma_pago.aplazado"); }, tipo: "numero" },
];

/** Tabla «Plazos» de Eneboo `formaspago.ui` (solo lectura; se editan juntos). */
export const PlazosFormaPago = ({ plazos }: { plazos: PlazoFormaPago[] }) => (
    <div className="PlazosFormaPago">
        <h3>{tTesoreria("forma_pago.plazos")}</h3>
        <QTabla<FilaPlazo>
            metaTabla={metaTablaPlazos}
            datos={plazos.map((plazo, i) => ({ ...plazo, id: String(i + 1) }))}
            cargando={false}
            orden={[]}
        />
    </div>
);
