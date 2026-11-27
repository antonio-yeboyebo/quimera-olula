import { Detalle } from "@olula/componentes/detalle/Detalle.tsx";
import { Tab, Tabs } from "@olula/componentes/detalle/tabs/Tabs.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { QuimeraAcciones } from "@olula/componentes/moleculas/qacciones.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { puede } from "@olula/lib/dominio.ts";
import { useModelo } from "@olula/lib/useModelo.js";
import { useCallback, useEffect, useMemo } from "react";
import { FichaInforme, PestañaInforme } from "../diseño.ts";
import { etiquetaFichaInforme, metaFichaInforme } from "../dominio.ts";
import { BorrarInforme } from "./BorrarInforme.tsx";
import { CamposInforme } from "./CamposInforme.tsx";
import { contextoDetalleInicial, getMaquinaDetalle, guardarFicha } from "./detalle.ts";
import { TabResultado } from "./TabResultado.tsx";
import { useTComun } from "../../i18n/index.ts";

/** Ficha de un informe: pestañas Criterios (se guardan solos al cambiar) y
 * Resultado, como el libro diario. */
export const DetalleInforme = ({
    pestaña,
    id,
    publicar = async () => {},
}: {
    pestaña: PestañaInforme;
    id?: string;
    publicar?: EmitirEvento;
}) => {
    const t = useTComun();
    const getMaquina = useMemo(() => getMaquinaDetalle(pestaña), [pestaña]);
    const inicial = useMemo(() => contextoDetalleInicial(pestaña), [pestaña]);
    const { ctx, emitir } = useMaquina(getMaquina, inicial, publicar);

    const meta = useMemo(() => metaFichaInforme<FichaInforme>(pestaña), [pestaña]);

    const autoGuardar = useCallback(
        async (ficha: FichaInforme) => {
            await guardarFicha(pestaña, ctx, ficha);
            await emitir("informe_guardado");
        },
        [pestaña, ctx, emitir]
    );

    const form = useModelo(meta, ctx.ficha, autoGuardar);

    useEffect(() => {
        emitir("informe_id_cambiado", id, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const { estado, ficha, resultado, modo } = ctx;

    if (!ficha.id) return null;

    const acciones = [
        {
            texto: t("informeDocumentos.borrar"),
            onClick: () => emitir("borrado_solicitado"),
            deshabilitado: !puede(pestaña.regla),
            advertencia: true,
        },
    ];

    return (
        <Detalle
            id={id}
            obtenerTitulo={(f: FichaInforme) => etiquetaFichaInforme(pestaña, f)}
            setEntidad={() => {}}
            entidad={ficha}
            cerrarDetalle={() => emitir("informe_deseleccionado", null, true)}
        >
            <div className="DetalleInformeDocumentos">
                <div className="maestro-botones">
                    <QuimeraAcciones acciones={acciones} vertical />
                </div>
                <Tabs
                    children={[
                        <Tab
                            label={t("informeDocumentos.criterios")}
                            key="tab-criterios"
                            children={
                                <quimera-formulario>
                                    <CamposInforme
                                        pestaña={pestaña}
                                        uiProps={form.uiProps}
                                        ficha={form.modelo as FichaInforme}
                                    />
                                </quimera-formulario>
                            }
                        />,
                        <Tab
                            label={t("informeDocumentos.resultado")}
                            key="tab-resultado"
                            children={
                                pestaña.Resultado ? (
                                    // La key reinicia el resultado propio al cambiar la ficha o sus criterios.
                                    <pestaña.Resultado key={JSON.stringify(ficha)} pestaña={pestaña} ficha={ficha} />
                                ) : (
                                    <TabResultado
                                        pestaña={pestaña}
                                        ficha={ficha}
                                        resultado={resultado}
                                        modo={modo}
                                        emitir={emitir}
                                    />
                                )
                            }
                        />,
                    ]}
                />
            </div>

            {estado === "BORRANDO" && (
                <BorrarInforme pestaña={pestaña} ficha={ficha} publicar={emitir} />
            )}
        </Detalle>
    );
};
