import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { Listado } from "@olula/componentes/maestro/Listado.js";
import { MaestroDetalle } from "@olula/componentes/maestro/MaestroDetalle.tsx";
import { puede } from "@olula/lib/dominio.ts";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { useEffect, useMemo } from "react";
import { CrearBanco } from "../crear/CrearBanco.tsx";
import { DetalleBanco } from "../detalle/DetalleBanco.tsx";
import { Banco } from "../diseño.ts";
import { REGLA_BANCO } from "../dominio.ts";
import { criteriaBancosDefecto, metaFiltroBanco, metaTablaBanco } from "./diseño.ts";
import { getMaquina } from "./maquina.ts";
import { useTTesoreria } from "../../i18n/index.ts";

/** Bancos (Eneboo `formaspago.ui` con su tabla de plazos). */
export const MaestroConDetalleBanco = () => {

    const t = useTTesoreria();
    const criteriaInicial = useMemo(criteriaBancosDefecto, []);

    const { ctx, emitir } = useMaquina(getMaquina, {
        estado: "INICIAL",
        bancos: listaActivaEntidadesInicial<Banco>(undefined, criteriaInicial),
    });

    const { estado, bancos } = ctx;

    const autorizado = puede(REGLA_BANCO);

    useEffect(() => {
        if (!autorizado) return;
        emitir("recarga_de_bancos_solicitada", bancos.criteria);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (!autorizado) {
        return <p>{t("banco.noTienesPermisoParaVerLos")}</p>;
    }

    return (
        <div className="Banco">
            <MaestroDetalle<Banco>
                seleccionada={bancos.activo}
                Maestro={
                    <>
                        <h2>{t("banco.bancos")}</h2>
                        <Listado<Banco>
                            metaTabla={metaTablaBanco}
                            metaFiltro={metaFiltroBanco}
                            criteria={bancos.criteria}
                            modoInicial="tabla"
                            entidades={bancos.lista}
                            totalEntidades={bancos.total}
                            seleccionada={bancos.activo}
                            renderAcciones={() => (
                                <div className="maestro-botones">
                                    <QBoton onClick={() => emitir("crear_banco_solicitado")}>
                                        {t("banco.nuevoBanco")}
                                    </QBoton>
                                </div>
                            )}
                            onSeleccion={(payload) => emitir("banco_seleccionado", payload)}
                            onCriteriaChanged={(payload) => emitir("criteria_cambiado", payload)}
                            onSiguientePagina={(payload) => emitir("siguiente_pagina", payload)}
                        />
                    </>
                }
                Detalle={<DetalleBanco id={bancos.activo} publicar={emitir} />}
            />

            {estado === "CREANDO" && <CrearBanco publicar={emitir} />}
        </div>
    );
};
