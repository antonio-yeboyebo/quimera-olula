import { ContextoError } from "@olula/lib/contexto.ts";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useContext, useEffect, useState } from "react";
import { proveedorBancarioUI } from "../../comun/proveedor_bancario/registro.js";
import { ConexionBancaria, DatosInicioConexionBancaria } from "../diseño.js";
import {
    patchReautenticarConexionBancaria,
    postIniciarConexionBancaria,
} from "../infraestructura.js";
import { useTTesoreria } from "../../i18n/index.ts";

/**
 * Reautenticación de una conexión existente: pide al backend los datos para
 * reautenticar (para Plaid, un `link_token` en modo actualización) y delega
 * en la UI del proveedor activo para completarla. El access_token no cambia;
 * al terminar solo se avisa al backend (PATCH reautenticar) para reactivar
 * la conexión. Misma forma que ConectarBancoConexionBancaria (sin UI propia).
 */
export const ReautenticarBancoConexionBancaria = ({
    conexion,
    publicar,
}: {
    conexion: ConexionBancaria;
    publicar: EmitirEvento;
}) => {
    const t = useTTesoreria();
    const { intentar } = useContext(ContextoError);
    const [inicio, setInicio] = useState<DatosInicioConexionBancaria | null>(null);

    const cancelar = () => publicar("reautenticacion_cancelada");

    useEffect(() => {
        let vigente = true;
        intentar(
            async () => {
                const resultado = await postIniciarConexionBancaria(conexion.id);
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
    }, []);

    if (!inicio) return null;

    const ui = proveedorBancarioUI(inicio.proveedor);
    if (!ui) return null;

    const onCompletado = (datos: Record<string, unknown>) => {
        intentar(
            async () => {
                await patchReautenticarConexionBancaria(conexion.id, datos);
                await publicar("conexion_bancaria_reautenticada", conexion.id);
            },
            cancelar
        );
    };

    return <ui.Conectar datos={inicio.datos} onCompletado={onCompletado} onCancelado={cancelar} />;
};
