import { AgenteTpv as CompAgenteTpv } from "#/tpv/comun/componentes/AgenteTpv.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { Detalle } from "@olula/componentes/detalle/Detalle.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { QInput } from "@olula/componentes/index.js";
import { EmitirEvento, Entidad } from "@olula/lib/diseño.ts";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback } from "react";
import { useParams } from "react-router";
import { BorrarArqueoTpv } from "../borrar/BorrarArqueoTpv.tsx";
import { CerrarArqueoTpv } from "../cerrar/CerrarArqueoTpv.tsx";
import { CrearMovimientoEfectivo } from "../crear_movimiento_efectivo/CrearMovimientoEfectivo.tsx";
import { ArqueoTpv } from "../diseño.ts";
import { moneda } from "../dominio.ts";
import { patchArqueo } from "../infraestructura.ts";
import { ReabrirArqueoTpv } from "../Reabrir/ReabrirArqueoTpv.tsx";
import { RecuentoArqueoTpv } from "../Recuento/RecuentoArqueoTpv.tsx";
import "./ArqueoTpv.css";
import { ListaPagos } from "./comps/ListaPagos.tsx";
import { MovimientosEfectivo } from "./comps/MovimientosEfectivo.tsx";
import { ResumenRecuento } from "./comps/ResumenRecuento.tsx";
import { TotalesArqueo } from "./comps/TotalesArqueo.tsx";
import { arqueoTpvVacio, ContextoArqueoTpv, metaArqueoTpv } from "./diseño.ts";
import { getMaquina } from "./maquina.ts";

export const DetalleArqueoTpv = ({
    arqueoIdProp,
    publicar = async () => {},
}: {
    arqueoIdProp?: string;
    publicar?: EmitirEvento;
}) => {
    const params = useParams();

    const arqueoId = arqueoIdProp ?? params.id;
    const contextoInicial:ContextoArqueoTpv = {
        estado: 'INICIAL',
        arqueo: arqueoTpvVacio,
    }
    
    const { ctx, emitir } = useMaquina(
        getMaquina,
        contextoInicial,
        publicar
    )
    
    const autoGuardar = useCallback(
        async (arqueo: ArqueoTpv) => {
            await patchArqueo(ctx.arqueo, arqueo);
            await emitir("arqueo_guardado", arqueo);
        },
        [ctx, emitir]
    );
    
    const { uiProps } = useModelo(metaArqueoTpv, ctx.arqueo, autoGuardar);
    
    if (arqueoId && arqueoId !== ctx.arqueo.id) {
        emitir("id_arqueo_cambiado", arqueoId, true);
    }
    
    const { estado, arqueo } = ctx;

    const titulo = (arqueo: Entidad) => `Arqueo ${arqueo.id} estado: ${estado}`; 
  
    return (
        <Detalle
            id={arqueoId}
            obtenerTitulo={titulo}
            setEntidad={() => {}}
            entidad={arqueo}
            cerrarDetalle={()=> emitir("arqueo_deseleccionado", null, true)}
        >
        {!!arqueoId && (
            <div className="DetalleArqueo">

                <quimera-formulario>
                    <CompAgenteTpv label='Agente de apertura'
                        {...uiProps("idAgenteApertura", "agente")}
                        deshabilitado={estado !== "ABIERTO"}
                    />
                    <QInput label='Efectivo inicial' 
                        {...uiProps("efectivoInicial")}
                        deshabilitado={estado !== "ABIERTO"}
                    />
                </quimera-formulario>

                { estado === "ABIERTO" && (
                    <div className="botones maestro-botones ">
                        <QBoton onClick={() => emitir("recuento_solicitado")}>
                            Recuento de caja
                        </QBoton> 
                        <QBoton onClick={() => emitir("cierre_solicitado")}>
                            Cerrar
                        </QBoton> 
                        <QBoton onClick={() => emitir("borrar_solicitado")}>
                            Borrar
                        </QBoton> 
                    </div>
                )}

                { estado === "CERRADO" && (
                    <div className="botones maestro-botones ">
                        <QBoton onClick={() => emitir("reapertura_solicitada")}>
                            Reabrir
                        </QBoton> 
                    </div>
                )}

                <ResumenRecuento
                    arqueo={arqueo}
                />
                {`Diferencias Efectivo: ${moneda(arqueo.recuentoEfectivo - arqueo.pagosEfectivo)}  -  `}
                {`Diferencias Tarjeta: ${moneda(arqueo.recuentoTarjeta - arqueo.pagosTarjeta)}  -  `}
                {`Diferencias Vale: ${moneda(arqueo.recuentoVales - arqueo.pagosVale)}`}
                <TotalesArqueo
                    arqueo={arqueo}
                />
                <ListaPagos
                    arqueoId={arqueo.id}
                />
                <MovimientosEfectivo
                    arqueo={arqueo}
                    estado={estado}
                    publicar={emitir}
                /> 
                {
                    estado === "CERRANDO" &&
                    <CerrarArqueoTpv
                        arqueo={arqueo}
                        publicar={emitir}
                    />
                }
                {
                    estado === "CREANDO_MOVIMIENTO" &&
                    <CrearMovimientoEfectivo
                        arqueo={arqueo}
                        publicar={emitir}
                    />
                }
                {/* {
                    estado === "BORRANDO_MOVIMIENTO" &&
                    <BorrarMovimientoEfectivo
                        arqueo={arqueo}
                        publicar={emitir}
                    />
                } */}
                {
                    estado === "REABRIENDO" &&
                    <ReabrirArqueoTpv
                        arqueo={arqueo}
                        publicar={emitir}
                    />
                }
                {
                    estado === "RECONTANDO" &&
                    <RecuentoArqueoTpv
                        arqueo={arqueo}
                        publicar={emitir}
                    />
                }
                {
                    estado === "BORRANDO_ARQUEO" &&
                    <BorrarArqueoTpv
                        arqueo={arqueo}
                        publicar={emitir}
                    />
                }

            </div>
        )}
        </Detalle>
    );
};
