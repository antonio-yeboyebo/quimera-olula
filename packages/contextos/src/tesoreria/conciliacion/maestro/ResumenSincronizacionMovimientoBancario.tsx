import { QAviso } from "@olula/componentes/atomos/qaviso.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QModal } from "@olula/componentes/moleculas/qmodal.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { ResumenSincronizacionMovimientoBancario as ResumenSincronizacion } from "../diseño.js";
import "./ResumenSincronizacionMovimientoBancario.css";
import { tTesoreria } from "../../i18n/index.ts";

export const ResumenSincronizacionMovimientoBancario = ({
    resumen,
    publicar,
}: {
    resumen: ResumenSincronizacion;
    publicar: EmitirEvento;
}) => {
    const cerrar = () => publicar("resumen_sincronizacion_cerrado");

    return (
        <QModal
            nombre="resumenSincronizacionMovimientoBancario"
            titulo={tTesoreria("conciliacion.resultadoDeLaSincronizacion")}
            abierto={true}
            onCerrar={cerrar}
        >
            <div className="ResumenSincronizacionMovimientoBancario">
                <p>
                    {tTesoreria("conciliacion.resumenConexiones", { count: resumen.conexiones })}{" "}
                    {tTesoreria("conciliacion.resumenCambios", { nuevos: resumen.nuevos, modificados: resumen.modificados, eliminados: resumen.eliminados })}
                </p>
                <p>
                    {tTesoreria("conciliacion.resumenAutomatica", { conciliados: resumen.conciliados, conCandidatos: resumen.conCandidatos })}
                    {resumen.conciliadosIa + resumen.conCandidatosIa > 0 &&
                        tTesoreria("conciliacion.resumenIa", { conciliadosIa: resumen.conciliadosIa, conCandidatosIa: resumen.conCandidatosIa })}.
                </p>

                {resumen.erroresConciliacion.length > 0 && (
                    <>
                        <QAviso variante="advertencia">{tTesoreria("conciliacion.noSeHanPodidoConciliar")}</QAviso>
                        <ul className="errores-sincronizacion">
                            {resumen.erroresConciliacion.map((error, indice) => <li key={indice}>{error}</li>)}
                        </ul>
                    </>
                )}

                {resumen.errores.length > 0 && (
                    <>
                        <QAviso variante="error">
                            {tTesoreria("conciliacion.resumenErrores", { count: resumen.errores.length })}
                        </QAviso>
                        <ul className="errores-sincronizacion">
                            {resumen.errores.map((error, indice) => (
                                <li key={`${error.conexionId}-${indice}`}>
                                    <strong>{error.institucionNombre ?? tTesoreria("conciliacion.bancoSinIdentificar")}:</strong>{" "}
                                    {error.error}
                                    {error.requiereReautenticacion && (
                                        <>
                                            {" "}{tTesoreria("conciliacion.hayQueVolverAAutenticarLa")}{" "}
                                            <QBoton
                                                tamaño="pequeño"
                                                variante="borde"
                                                enlace={`/tesoreria/conexion_bancaria?id=${encodeURIComponent(error.conexionId)}`}
                                            >
                                                {tTesoreria("conciliacion.irALaConexion")}
                                            </QBoton>
                                        </>
                                    )}
                                </li>
                            ))}
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
