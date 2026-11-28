import { Tab, Tabs } from "@olula/componentes/detalle/tabs/Tabs.tsx";
import { puede } from "@olula/lib/dominio.ts";
import { PestañaInforme } from "../diseño.ts";
import "./InformesDocumentos.css";
import { MaestroInforme } from "./MaestroInforme.tsx";
import { tComun } from "../../i18n/index.ts";

/** Pantalla de informes de documentos: una pestaña por tipo de documento
 * (las que el usuario puede ver), cada una con sus fichas guardadas. */
export const InformesDocumentos = ({
    titulo,
    pestañas,
}: {
    titulo: string;
    pestañas: PestañaInforme[];
}) => {
    const visibles = pestañas.filter((pestaña) => puede(pestaña.regla));

    if (visibles.length === 0) {
        return <p>{tComun("informeDocumentos.noTienesPermisoParaVerNingun", { valor: titulo.toLowerCase() })}</p>;
    }

    return (
        <div className="InformesDocumentos">
            <Tabs
                children={visibles.map((pestaña) => (
                    <Tab
                        label={pestaña.titulo}
                        key={pestaña.clave}
                        children={<MaestroInforme pestaña={pestaña} />}
                    />
                ))}
            />
        </div>
    );
};
