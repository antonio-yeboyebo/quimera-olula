import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { MetaTabla } from "@olula/componentes/index.js";
import { Listado } from "@olula/componentes/maestro/Listado.js";
import { MaestroDetalle } from "@olula/componentes/maestro/MaestroDetalle.tsx";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { getUrlParams, useUrlParams } from "@olula/lib/url-params.js";
import { useEffect, useMemo } from "react";
import { CrearCuentaBancaria } from "../crear/CrearCuentaBancaria.js";
import { DetalleCuentaBancaria } from "../detalle/DetalleCuentaBancaria.js";
import { CuentaBancaria } from "../diseño.js";
import "./MaestroConDetalleCuentaBancaria.css";
import { getMaquina } from "./maquina.js";
import { tTesoreria, useTTesoreria } from "../../i18n/index.ts";

const metaTablaCuentaBancaria: MetaTabla<CuentaBancaria> = [
    { id: 'descripcion', get cabecera() { return tTesoreria("cuentas_bancarias.descripcion"); } },
    { id: 'iban', cabecera: 'IBAN' },
    { id: 'bic', cabecera: 'BIC' },
    { id: 'codigoCuenta', get cabecera() { return tTesoreria("cuentas_bancarias.codCuenta"); } },
    { id: 'paisId', get cabecera() { return tTesoreria("cuentas_bancarias.pais"); } },
];

export const MaestroConDetalleCuentaBancaria = () => {

    const t = useTTesoreria();
    const criteriaBase = useMemo(() => criteriaDefecto, []);

    const { id, criteria } = getUrlParams();
    const criteriaInicial = criteria.filtro.length > 0 ? criteria : criteriaBase;

    const { ctx, emitir } = useMaquina(getMaquina, {
        estado: "INICIAL",
        cuentas: listaActivaEntidadesInicial<CuentaBancaria>(id, criteriaInicial),
    });

    const { estado, cuentas } = ctx;

    useUrlParams(cuentas.activo, cuentas.criteria);

    useEffect(() => {
        emitir("recarga_de_cuentas_solicitada", cuentas.criteria);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="CuentaBancaria">
            <MaestroDetalle<CuentaBancaria>
                Maestro={
                    <>
                        <h2>{t("cuentas_bancarias.cuentasBancarias")}</h2>
                        <Listado<CuentaBancaria>
                            metaTabla={metaTablaCuentaBancaria}
                            criteria={cuentas.criteria}
                            tarjeta={TarjetaCuentaBancaria}
                            entidades={cuentas.lista}
                            totalEntidades={cuentas.total}
                            seleccionada={cuentas.activo}
                            renderAcciones={() => (
                                <div className="maestro-botones">
                                    <QBoton onClick={() => emitir("crear_cuenta_solicitada")}>
                                        {t("cuentas_bancarias.nuevaCuenta")}
                                    </QBoton>
                                </div>
                            )}
                            onSeleccion={(payload) => emitir("cuenta_seleccionada", payload)}
                            onCriteriaChanged={(payload) => emitir("criteria_cambiado", payload)}
                            onSiguientePagina={(payload) => emitir("siguiente_pagina", payload)}
                        />
                    </>
                }
                Detalle={<DetalleCuentaBancaria id={cuentas.activo} publicar={emitir} />}
                seleccionada={cuentas.activo}
                modoDisposicion="maestro-50"
            />

            {estado === "CREANDO" && (
                <CrearCuentaBancaria
                    publicar={emitir}
                />
            )}
        </div>
    );
};

const TarjetaCuentaBancaria = (cuenta: CuentaBancaria) => {
    return (
        <div className="tarjeta-cuenta-bancaria" key={cuenta.id}>
            <div className="tarjeta-cuenta-bancaria-descripcion">
                {cuenta.descripcion || cuenta.iban || cuenta.codigoCuenta}
            </div>
            <div className="tarjeta-cuenta-bancaria-iban">{cuenta.iban}</div>
        </div>
    );
};
