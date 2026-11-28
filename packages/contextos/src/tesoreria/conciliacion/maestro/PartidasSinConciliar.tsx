import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { MetaTabla } from "@olula/componentes/atomos/qtablacontrolada.tsx";
import { QModal } from "@olula/componentes/moleculas/qmodal.tsx";
import { useEffect, useState } from "react";
import { PartidaHuerfana } from "../diseño.js";
import { getPartidasHuerfanas } from "../infraestructura.js";
import { tTesoreria, useTTesoreria } from "../../i18n/index.ts";

type FilaPartida = {
    id: string;
    fecha: Date;
    descripcion: string;
    numeroAsiento: string;
    importe: number;
};

const metaTablaPartidas: MetaTabla<FilaPartida> = [
    { id: "fecha", get cabecera() { return tTesoreria("conciliacion.fecha"); }, tipo: "fecha" },
    { id: "descripcion", get cabecera() { return tTesoreria("conciliacion.concepto"); }, esTitulo: true },
    { id: "numeroAsiento", get cabecera() { return tTesoreria("conciliacion.asiento"); }, estilo: "secundario" },
    { id: "importe", get cabecera() { return tTesoreria("conciliacion.importe"); }, tipo: "moneda", divisa: "EUR" },
];

const filaDesdePartida = (partida: PartidaHuerfana): FilaPartida => ({
    id: String(partida.idasiento),
    fecha: partida.fecha,
    descripcion: partida.descripcion ?? "",
    numeroAsiento: partida.numeroAsiento ?? "",
    importe: partida.importe,
});

/**
 * Listado de las partidas contables de la subcuenta del banco sin movimiento
 * bancario conciliado que las cubra (las que cuenta la alerta del cuadre).
 */
export const PartidasSinConciliar = ({
    cuentaId,
    onCerrar,
}: {
    cuentaId: string;
    onCerrar: () => void;
}) => {

    const t = useTTesoreria();
    const [partidas, setPartidas] = useState<FilaPartida[] | null>(null);

    useEffect(() => {
        getPartidasHuerfanas(cuentaId)
            .then((lista) => setPartidas(lista.map(filaDesdePartida)))
            .catch(console.error);
    }, [cuentaId]);

    return (
        <QModal
            nombre="partidasSinConciliar"
            titulo={t("conciliacion.partidasContablesSinConciliar")}
            abierto={true}
            onCerrar={onCerrar}
        >
            <div className="PartidasSinConciliar">
                <QTabla
                    metaTabla={metaTablaPartidas}
                    datos={partidas ?? []}
                    cargando={partidas === null}
                    orden={["fecha", "DESC"]}
                />
                <div className="botones maestro-botones">
                    <QBoton onClick={onCerrar}>{t("conciliacion.cerrar")}</QBoton>
                </div>
            </div>
        </QModal>
    );
};
