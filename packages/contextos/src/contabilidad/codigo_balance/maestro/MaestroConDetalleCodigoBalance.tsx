import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { Listado } from "@olula/componentes/maestro/Listado.js";
import { MaestroDetalle } from "@olula/componentes/maestro/MaestroDetalle.tsx";
import { puede } from "@olula/lib/dominio.ts";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { useEffect, useMemo } from "react";
import { CrearCodigoBalance } from "../crear/CrearCodigoBalance.tsx";
import { DetalleCodigoBalance } from "../detalle/DetalleCodigoBalance.tsx";
import { CodigoBalance } from "../diseño.ts";
import { RegenerarCodigosBalance } from "../regenerar/RegenerarCodigosBalance.tsx";
import {
    criteriaCodigosBalanceDefecto,
    metaFiltroCodigoBalance,
    metaTablaCodigoBalance,
} from "./diseño.ts";
import { getMaquina } from "./maquina.ts";
import { useTContabilidad } from "../../i18n/index.ts";

/**
 * Códigos de balance 2008 (Eneboo `co_codbalances08`, acción del menú
 * principal de contabilidad). No dependen del ejercicio. Las cuentas que suman
 * en cada código (`co_cuentascb` y `co_cuentascbba`) se mantienen en las
 * pestañas del detalle, como en el formulario de Eneboo.
 */
export const MaestroConDetalleCodigoBalance = () => {

    const t = useTContabilidad();
    const criteriaInicial = useMemo(criteriaCodigosBalanceDefecto, []);

    const { ctx, emitir } = useMaquina(getMaquina, {
        estado: "INICIAL",
        codigosBalance: listaActivaEntidadesInicial<CodigoBalance>(undefined, criteriaInicial),
        alcanceRegeneracion: null,
    });

    const { estado, codigosBalance, alcanceRegeneracion } = ctx;

    const autorizado = puede("contabilidad.asiento");

    useEffect(() => {
        if (!autorizado) return;
        emitir("recarga_de_codigos_balance_solicitada", codigosBalance.criteria);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (!autorizado) {
        return <p>{t("codigo_balance.noTienesPermisoParaVerLos")}</p>;
    }

    return (
        <div className="CodigoBalance">
            <MaestroDetalle<CodigoBalance>
                seleccionada={codigosBalance.activo}
                Maestro={
                    <>
                        <h2>{t("codigo_balance.codigosDeBalance2008")}</h2>
                        <Listado<CodigoBalance>
                            metaTabla={metaTablaCodigoBalance}
                            metaFiltro={metaFiltroCodigoBalance}
                            criteria={codigosBalance.criteria}
                            modoInicial="tabla"
                            entidades={codigosBalance.lista}
                            totalEntidades={codigosBalance.total}
                            seleccionada={codigosBalance.activo}
                            renderAcciones={() => (
                                <div className="maestro-botones">
                                    <QBoton onClick={() => emitir("crear_codigo_balance_solicitado")}>
                                        {t("codigo_balance.nuevoCodigo")}
                                    </QBoton>
                                    <QBoton
                                        variante="borde"
                                        onClick={() => emitir("regeneracion_solicitada", "todo")}
                                    >
                                        {t("codigo_balance.regenerarCodigos")}
                                    </QBoton>
                                    <QBoton
                                        variante="borde"
                                        onClick={() => emitir("regeneracion_solicitada", "cuentas")}
                                    >
                                        {t("codigo_balance.regenerarCuentas")}
                                    </QBoton>
                                    <QBoton
                                        variante="borde"
                                        onClick={() => emitir("regeneracion_solicitada", "cuentas_abreviado")}
                                    >
                                        {t("codigo_balance.regenerarCuentasAbreviado")}
                                    </QBoton>
                                </div>
                            )}
                            onSeleccion={(payload) => emitir("codigo_balance_seleccionado", payload)}
                            onCriteriaChanged={(payload) => emitir("criteria_cambiado", payload)}
                            onSiguientePagina={(payload) => emitir("siguiente_pagina", payload)}
                        />
                    </>
                }
                Detalle={
                    <DetalleCodigoBalance
                        id={codigosBalance.activo}
                        publicar={emitir}
                    />
                }
            />

            {estado === "CREANDO" && <CrearCodigoBalance publicar={emitir} />}

            {estado === "REGENERANDO" && alcanceRegeneracion && (
                <RegenerarCodigosBalance alcance={alcanceRegeneracion} publicar={emitir} />
            )}
        </div>
    );
};
