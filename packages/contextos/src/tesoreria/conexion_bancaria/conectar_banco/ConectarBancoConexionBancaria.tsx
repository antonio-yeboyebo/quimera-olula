import { ContextoError } from "@olula/lib/contexto.ts";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useContext, useEffect, useState } from "react";
import { proveedorBancario } from "../../comun/banca.js";
import { proveedorBancarioUI } from "../../comun/proveedor_bancario/registro.js";
import { DatosInicioConexionBancaria, TipoProductoBancario } from "../diseño.js";
import { postConexionBancaria, postIniciarConexionBancaria } from "../infraestructura.js";
import { ElegirProductosConexionBancaria } from "./ElegirProductosConexionBancaria.js";
import { useTTesoreria } from "../../i18n/index.ts";

/**
 * Pide al backend los datos para iniciar una conexión nueva y delega en la UI
 * del proveedor bancario activo (ver ../../comun/proveedor_bancario/) para
 * completarla. No renderiza nada visible — la UI la pone el widget del
 * proveedor; el padre solo monta este componente mientras estado ===
 * "CONECTANDO" (ver ../maestro/MaestroConDetalleConexionBancaria.tsx).
 *
 * Si el proveedor cobra por producto leído (Wealth Reader), antes se eligen
 * los tipos de producto a leer (ElegirProductosConexionBancaria).
 *
 * Si el backend devuelve un proveedor sin UI registrada, se reporta como
 * error y se cancela el flujo (no debería ocurrir: solo hay un proveedor
 * activo por instalación y es el mismo backend quien lo informa).
 */
export const ConectarBancoConexionBancaria = ({
    publicar,
}: {
    publicar: EmitirEvento;
}) => {
    const t = useTTesoreria();
    const { intentar } = useContext(ContextoError);
    const [inicio, setInicio] = useState<DatosInicioConexionBancaria | null>(null);
    const eligeTipos = Boolean(proveedorBancarioUI(proveedorBancario() ?? "")?.eligeTiposProducto);
    const [tipos, setTipos] = useState<TipoProductoBancario[] | null>(null);

    const cancelar = () => publicar("conexion_bancaria_conexion_cancelada");

    useEffect(() => {
        if (eligeTipos && !tipos) return;
        let vigente = true;
        intentar(
            async () => {
                const resultado = await postIniciarConexionBancaria(undefined, tipos ?? undefined);
                if (!proveedorBancarioUI(resultado.proveedor)) {
                    throw new Error(t("conexion_bancaria.proveedorBancarioNoSoportadoProveedor", { proveedor: resultado.proveedor }));
                }
                if (vigente) setInicio(resultado);
            },
            cancelar
        );
        return () => {
            vigente = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tipos]);

    if (eligeTipos && !tipos) {
        return <ElegirProductosConexionBancaria onAceptar={setTipos} onCancelar={cancelar} />;
    }

    if (!inicio) return null;

    const ui = proveedorBancarioUI(inicio.proveedor);
    if (!ui) return null;

    const onCompletado = (datos: Record<string, unknown>) => {
        intentar(
            async () => {
                const id = await postConexionBancaria(datos);
                await publicar("conexion_bancaria_creada", id);
            },
            cancelar
        );
    };

    return <ui.Conectar datos={inicio.datos} onCompletado={onCompletado} onCancelado={cancelar} />;
};
