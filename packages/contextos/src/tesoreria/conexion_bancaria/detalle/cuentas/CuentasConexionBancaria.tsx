import { QCheckbox } from "@olula/componentes/atomos/qcheckbox.tsx";
import { MetaTabla } from "@olula/componentes/atomos/qtablacontrolada.tsx";
import { ListadoSemiControlado } from "@olula/componentes/maestro/ListadoSemiControlado.tsx";
import { ContextoError } from "@olula/lib/contexto.ts";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { criteriaDefecto } from "@olula/lib/dominio.ts";
import { useCallback, useContext } from "react";
import { CuentaBancariaSelect } from "#/tesoreria/comun/componentes/cuenta_bancaria_select.tsx";
import { CuentaConexionBancaria } from "../../diseño.js";
import { patchCuentaConexionBancaria } from "../../infraestructura.js";
import "./CuentasConexionBancaria.css";
import { useTTesoreria } from "../../../i18n/index.ts";

/**
 * Cuentas expuestas por el proveedor bancario dentro de una conexión. No hay
 * alta/baja: son las que el proveedor devuelve al conectar el banco. La única
 * edición posible por cuenta es asociarla a una cuenta bancaria de la empresa
 * y activarla o desactivarla — ambas se guardan al vuelo con PATCH, sin modal propio, igual
 * que el auto-guardado de un formulario (ver useModelo en CLAUDE.md).
 */
export const CuentasConexionBancaria = ({
    conexionId,
    cuentas,
    publicar,
}: {
    conexionId: string;
    cuentas: CuentaConexionBancaria[];
    publicar: EmitirEvento;
}) => {
    const t = useTTesoreria();
    const { intentar } = useContext(ContextoError);

    const guardarCuenta = useCallback(
        (cuenta: CuentaConexionBancaria, cambios: Partial<{ cuentaBancoId: string | null; activa: boolean }>) => {
            intentar(
                async () => {
                    await patchCuentaConexionBancaria(conexionId, cuenta.id, {
                        cuentaBancoId: cambios.cuentaBancoId !== undefined ? cambios.cuentaBancoId : cuenta.cuentaBancoId,
                        activa: cambios.activa !== undefined ? cambios.activa : cuenta.activa,
                    });
                    await publicar("cuenta_conexion_bancaria_guardada");
                }
            );
        },
        [conexionId, intentar, publicar]
    );

    const metaTablaCuentas: MetaTabla<CuentaConexionBancaria> = [
        { id: "nombre", cabecera: t("conexion_bancaria.cuentaEnElBanco") },
        {
            id: "mascara",
            cabecera: t("conexion_bancaria.nCuenta"),
            render: (c) => (c.mascara ? `····${c.mascara}` : "-"),
        },
        { id: "iban", cabecera: "IBAN", render: (c) => c.iban ?? "-" },
        {
            id: "cuentaBancoId",
            cabecera: t("conexion_bancaria.cuentaBancariaDeLaEmpresa"),
            render: (c) => (
                <CuentaBancariaSelect
                    valor={c.cuentaBancoId ?? undefined}
                    nombre={`cuenta_banco_${c.id}`}
                    label=""
                    onChange={(opcion) => guardarCuenta(c, { cuentaBancoId: opcion?.valor ?? null })}
                />
            ),
        },
        {
            id: "activa",
            cabecera: t("conexion_bancaria.sincronizar"),
            render: (c) => (
                <QCheckbox
                    nombre={`activa_${c.id}`}
                    label=""
                    valor={c.activa}
                    onChange={(valor) => guardarCuenta(c, { activa: valor === "true" })}
                />
            ),
        },
    ];

    return (
        <div className="CuentasConexionBancaria">
            <ListadoSemiControlado<CuentaConexionBancaria>
                metaTabla={metaTablaCuentas}
                entidades={cuentas}
                totalEntidades={cuentas.length}
                cargando={false}
                seleccionada={null}
                onSeleccion={() => null}
                criteriaInicial={criteriaDefecto}
                onCriteriaChanged={() => null}
                modo="tabla"
            />
        </div>
    );
};
