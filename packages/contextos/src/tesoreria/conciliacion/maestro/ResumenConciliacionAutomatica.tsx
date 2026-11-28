import { QAviso } from "@olula/componentes/atomos/qaviso.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QModal } from "@olula/componentes/moleculas/qmodal.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { ResumenConciliacionAutomatica as Resumen } from "../diseño.js";
import "./ResumenSincronizacionMovimientoBancario.css";
import { tTesoreria } from "../../i18n/index.ts";

export const ResumenConciliacionAutomatica = ({
    resumen,
    publicar,
}: {
    resumen: Resumen;
    publicar: EmitirEvento;
}) => {
    const cerrar = () => publicar("resumen_conciliacion_automatica_cerrado");

    return (
        <QModal
            nombre="resumenConciliacionAutomatica"
            titulo={tTesoreria("conciliacion.conciliacionAutomatica")}
            abierto={true}
            onCerrar={cerrar}
        >
            <div className="ResumenSincronizacionMovimientoBancario">
                <p>
                    {tTesoreria("conciliacion.resumenAnalizados", { count: resumen.analizados, conciliados: resumen.conciliados, conCandidatos: resumen.conCandidatos })}
                    {resumen.conciliadosIa + resumen.conCandidatosIa > 0 &&
                        tTesoreria("conciliacion.resumenIa", { conciliadosIa: resumen.conciliadosIa, conCandidatosIa: resumen.conCandidatosIa })}.
                </p>

                {resumen.errores.length > 0 && (
                    <>
                        <QAviso variante="advertencia">{tTesoreria("conciliacion.noSeHanPodidoConciliar")}</QAviso>
                        <ul className="errores-sincronizacion">
                            {resumen.errores.map((error, indice) => <li key={indice}>{error}</li>)}
                        </ul>
                    </>
                )}

                <div className="botones maestro-botones">
                    <QBoton onClick={cerrar}>{tTesoreria("conciliacion.cerrar")}</QBoton>
                </div>
            </div>
        </QModal>
    );
};
