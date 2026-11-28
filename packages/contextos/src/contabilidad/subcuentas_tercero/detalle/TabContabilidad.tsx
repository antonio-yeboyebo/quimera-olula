import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { QTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { QModal } from "@olula/componentes/index.ts";
import { Asiento } from "#/contabilidad/asiento/diseño.ts";
import { getAsiento } from "#/contabilidad/asiento/infraestructura.ts";
import { CambiarAsientoManual } from "#/contabilidad/asiento/vistas/cambiar/CambiarAsientoManual.tsx";
import { DetalleAsiento } from "#/contabilidad/asiento/vistas/detalle/DetalleAsiento.tsx";
import { useCallback, useEffect, useState } from "react";
import { PartidaSubcuenta, SubcuentaTercero, TipoTercero } from "../diseño.ts";
import { opcionesSubcuentas, subcuentaInicial } from "../dominio.ts";
import {
    getPartidasSubcuenta,
    getSubcuentasTercero,
} from "../infraestructura.ts";
import { metaTablaPartidasSubcuenta } from "./meta.ts";
import "./TabContabilidad.css";
import { useTContabilidad } from "../../i18n/index.ts";

/** Pestaña «Contabilidad» de las fichas de cliente y proveedor (Eneboo
 * clientes.ui / proveedores.ui): subcuenta elegida arriba y, encima de sus
 * partidas, un combo con las subcuentas por ejercicio (ejercicio, subcuenta y
 * saldo) que filtra la tabla. Pulsar una partida abre su asiento: el formulario
 * de edición si es manual; si no (factura, recibo…), su ficha en consulta. */
export const TabContabilidad = ({
    tipo,
    terceroId,
    codigoSubcuenta,
}: {
    tipo: TipoTercero;
    terceroId: string;
    /** `clientes.codsubcuenta` / `proveedores.codsubcuenta`, por si el tercero
     * aún no tiene subcuentas por ejercicio. */
    codigoSubcuenta?: string | null;
}) => {
    const t = useTContabilidad();
    const [subcuentas, setSubcuentas] = useState<SubcuentaTercero[]>([]);
    const [cargandoSubcuentas, setCargandoSubcuentas] = useState(true);
    const [activa, setActiva] = useState<SubcuentaTercero | null>(null);
    const [partidas, setPartidas] = useState<PartidaSubcuenta[]>([]);
    const [cargandoPartidas, setCargandoPartidas] = useState(false);
    const [asiento, setAsiento] = useState<Asiento | null>(null);
    const [recargas, setRecargas] = useState(0);

    useEffect(() => {
        let vigente = true;
        setCargandoSubcuentas(true);
        getSubcuentasTercero(tipo, terceroId)
            .then((lista) => {
                if (!vigente) return;
                setSubcuentas(lista);
                // Tras editar un asiento se mantiene la subcuenta elegida (con su saldo nuevo).
                setActiva((previa) =>
                    lista.find((s) => s.id === previa?.id) ?? subcuentaInicial(lista));
            })
            .finally(() => vigente && setCargandoSubcuentas(false));
        return () => {
            vigente = false;
        };
    }, [tipo, terceroId, recargas]);

    const abrirAsiento = useCallback(async (partida: PartidaSubcuenta) => {
        if (partida.asientoId) setAsiento(await getAsiento(partida.asientoId));
    }, []);

    const cerrarAsiento = useCallback((actualizado: boolean) => {
        setAsiento(null);
        if (actualizado) setRecargas((n) => n + 1);
    }, []);

    const cargarPartidas = useCallback(async (subcuentaId: string) => {
        setCargandoPartidas(true);
        try {
            setPartidas(await getPartidasSubcuenta(subcuentaId));
        } finally {
            setCargandoPartidas(false);
        }
    }, []);

    useEffect(() => {
        if (activa) {
            cargarPartidas(activa.subcuentaId);
        } else {
            setPartidas([]);
        }
    }, [activa, cargarPartidas]);

    return (
        <div className="TabContabilidad">
            <quimera-formulario>
                <QInput
                    label={t("subcuentas_tercero.subcuenta")}
                    nombre="codigo_subcuenta"
                    valor={activa?.codigoSubcuenta ?? codigoSubcuenta ?? ""}
                    deshabilitado
                />
                <QInput
                    label={t("subcuentas_tercero.descripcion")}
                    nombre="descripcion_subcuenta"
                    valor={activa?.descripcion ?? ""}
                    deshabilitado
                />
            </quimera-formulario>
            <div className="TabContabilidad-partidas">
                <QSelect
                    label={t("subcuentas_tercero.subcuentaPorEjercicio")}
                    nombre="subcuenta_ejercicio"
                    valor={activa?.id ?? ""}
                    opciones={opcionesSubcuentas(subcuentas)}
                    deshabilitado={cargandoSubcuentas || subcuentas.length === 0}
                    onChange={(opcion) =>
                        setActiva(subcuentas.find((s) => s.id === opcion?.valor) ?? null)
                    }
                />
                <QTabla
                    metaTabla={metaTablaPartidasSubcuenta}
                    datos={partidas}
                    cargando={cargandoPartidas}
                    orden={["fecha", "ASC"]}
                    totalEntidades={partidas.length}
                    onSeleccion={abrirAsiento}
                />
            </div>
            {asiento?.manual && (
                <CambiarAsientoManual
                    asiento={asiento}
                    publicar={async (evento) => cerrarAsiento(evento === "asiento_actualizado")}
                />
            )}
            {asiento && !asiento.manual && (
                <QModal
                    nombre="asientoDePartida"
                    abierto
                    titulo={t("subcuentas_tercero.asientoNumero", { numero: asiento.numero })}
                    onCerrar={() => cerrarAsiento(false)}
                >
                    <DetalleAsiento
                        id={asiento.id}
                        publicar={async (evento) => {
                            if (evento === "asiento_deseleccionado") cerrarAsiento(false);
                        }}
                    />
                </QModal>
            )}
        </div>
    );
};
