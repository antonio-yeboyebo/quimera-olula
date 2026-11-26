import { TipoUbicacion } from "#/almacen/comun/componentes/TipoUbicacion.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal, QModalConfirmacion } from "@olula/componentes/index.js";
import { ContextoError } from "@olula/lib/contexto.ts";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useContext, useState } from "react";
import { Pasillo, ResultadoGenerarUbicaciones } from "../diseño.ts";
import {
    mensajeUbicacionesGeneradas,
    metaGenerarUbicaciones,
    parametrosGenerarUbicacionesIniciales,
} from "../dominio.ts";
import { generarUbicacionesPasillo } from "../infraestructura.ts";
import "./GenerarUbicacionesPasillo.css";
import { useTAlmacen } from "../../i18n/index.ts";

/**
 * Modal de generación de ubicaciones de un pasillo. Tras generar, el formulario deja paso a un
 * aviso con cuántas se han creado; al aceptarlo avisa con "ubicaciones_generadas" para que se
 * cierre y se refresquen las ubicaciones de la zona.
 */
export const GenerarUbicacionesPasillo = ({
    pasillo,
    publicar,
}: {
    pasillo: Pasillo;
    publicar: EmitirEvento;
}) => {
    const t = useTAlmacen();
    const { intentar } = useContext(ContextoError);
    const { modelo, uiProps, valido } = useModelo(
        metaGenerarUbicaciones,
        parametrosGenerarUbicacionesIniciales
    );
    const [resultado, setResultado] = useState<ResultadoGenerarUbicaciones | null>(null);

    const generar = useCallback(async () => {
        const r = await intentar(() => generarUbicacionesPasillo(pasillo.id, modelo));
        setResultado(r);
    }, [intentar, pasillo.id, modelo]);

    const cancelar = useCallback(() => publicar("generacion_cancelada"), [publicar]);
    const terminar = useCallback(() => publicar("ubicaciones_generadas"), [publicar]);

    if (resultado) {
        return (
            <QModalConfirmacion
                nombre="ubicacionesGeneradas"
                abierto={true}
                titulo={t("pasillo.ubicacionesGeneradas")}
                mensaje={mensajeUbicacionesGeneradas(resultado.creadas)}
                mostrarCancelar={false}
                onAceptar={terminar}
                onCerrar={terminar}
            />
        );
    }

    return (
        <QModal
            abierto={true}
            nombre="generarUbicacionesPasillo"
            titulo={t("pasillo.generarUbicacionesDelPasilloCodigo", { codigo: pasillo.codigo })}
            onCerrar={cancelar}
        >
            <quimera-formulario>
                <QInput label={t("pasillo.nivelDesde")} {...uiProps("nivelDesde")} />
                <QInput label={t("pasillo.nivelHasta")} {...uiProps("nivelHasta")} />
                <QInput label={t("pasillo.huecosPorNivel")} {...uiProps("huecosPorNivel")} />
                <TipoUbicacion {...uiProps("tipoUbicacionId")} />
                <QInput label={t("pasillo.moduloDesdeOpcional")} {...uiProps("moduloDesde")} />
                <QInput label={t("pasillo.moduloHastaOpcional")} {...uiProps("moduloHasta")} />
            </quimera-formulario>
            <div className="botones maestro-botones">
                <QBoton onClick={generar} deshabilitado={!valido}>
                    {t("pasillo.generar")}
                </QBoton>
            </div>
        </QModal>
    );
};
