import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { Detalle } from "@olula/componentes/detalle/Detalle.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { QuimeraAcciones } from "@olula/componentes/moleculas/qacciones.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { puede } from "@olula/lib/dominio.ts";
import { useModelo } from "@olula/lib/useModelo.js";
import { useCallback, useEffect } from "react";
import { BorrarBanco } from "../borrar/BorrarBanco.tsx";
import { BorrarSucursalBanco } from "../borrar_sucursal/BorrarSucursalBanco.tsx";
import { CambiarSucursalBanco } from "../cambiar_sucursal/CambiarSucursalBanco.tsx";
import { CrearSucursalBanco } from "../crear_sucursal/CrearSucursalBanco.tsx";
import { Banco } from "../diseño.ts";
import { etiquetaBanco, metaBanco, REGLA_BANCO } from "../dominio.ts";
import { CamposBanco } from "./CamposBanco.tsx";
import { contextoDetalleBancoInicial, guardarBanco } from "./detalle.ts";
import { getMaquina } from "./maquina.ts";
import { SucursalesBanco } from "./sucursales/SucursalesBanco.tsx";
import { useTTesoreria } from "../../i18n/index.ts";

/** Formulario de Eneboo `bancos.ui`. */
export const DetalleBanco = ({
    id,
    publicar = async () => {},
}: {
    id?: string;
    publicar?: EmitirEvento;
}) => {
    const t = useTTesoreria();
    const { ctx, emitir } = useMaquina(getMaquina, contextoDetalleBancoInicial, publicar);

    const autoGuardar = useCallback(
        async (banco: Banco) => {
            await guardarBanco(ctx, banco);
            await emitir("banco_guardado");
        },
        [ctx, emitir]
    );

    const formModelo = useModelo(metaBanco, ctx.banco, autoGuardar);

    const { estado, banco, sucursalActiva } = ctx;

    useEffect(() => {
        emitir("banco_id_cambiado", id, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    if (!banco.id) return null;

    const autorizado = puede(REGLA_BANCO);

    const acciones = [
        {
            texto: t("banco.borrar"),
            onClick: () => emitir("borrado_solicitado"),
            deshabilitado: !autorizado,
            advertencia: true,
        },
    ];

    return (
        <Detalle
            id={id}
            obtenerTitulo={etiquetaBanco}
            setEntidad={() => {}}
            entidad={banco}
            cerrarDetalle={() => emitir("banco_deseleccionado", null, true)}
        >
            <div className="DetalleBanco">
                <div className="maestro-botones">
                    <QuimeraAcciones acciones={acciones} vertical />
                </div>
                <quimera-formulario>
                    <QInput label={t("banco.nDeEntidad")} nombre="id" valor={banco.id} soloLectura />
                    <CamposBanco uiProps={formModelo.uiProps} nombreProveedor={banco.nombreProveedor} />
                </quimera-formulario>
                <SucursalesBanco banco={banco} publicar={emitir} editable={autorizado} />
            </div>

            {estado === "CREANDO_SUCURSAL" && <CrearSucursalBanco banco={banco} publicar={emitir} />}
            {estado === "CAMBIANDO_SUCURSAL" && sucursalActiva && (
                <CambiarSucursalBanco banco={banco} sucursal={sucursalActiva} publicar={emitir} />
            )}
            {estado === "BORRANDO_SUCURSAL" && sucursalActiva && (
                <BorrarSucursalBanco banco={banco} sucursal={sucursalActiva} publicar={emitir} />
            )}
            {estado === "BORRANDO" && <BorrarBanco banco={banco} publicar={emitir} />}
        </Detalle>
    );
};
