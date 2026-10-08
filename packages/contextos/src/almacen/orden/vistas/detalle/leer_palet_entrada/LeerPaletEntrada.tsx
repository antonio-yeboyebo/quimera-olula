import { Caja } from "#/almacen/comun/componentes/Caja.tsx";
import { pitidoError } from "#/almacen/comun/audio.ts";
import { OrdenAlmacen } from "#/almacen/orden/diseño.ts";
import { registrarLecturaCajaOrden } from "#/almacen/orden/infraestructura.ts";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QEtiqueta } from "@olula/componentes/atomos/qetiqueta.tsx";
import { QModal } from "@olula/componentes/moleculas/qmodal.tsx";
import { ContextoError } from "@olula/lib/contexto.ts";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { ComponentProps, useCallback, useContext, useState } from "react";

type OpcionCaja = NonNullable<Parameters<ComponentProps<typeof Caja>["onChange"]>[0]>;

export const LeerPaletEntrada = ({
    orden,
    publicar,
}: {
    orden: OrdenAlmacen;
    publicar: EmitirEvento;
}) => {
    const { intentar } = useContext(ContextoError);
    const [claveCaja, setClaveCaja] = useState(0);
    const [resultado, setResultado] = useState<{ exito: boolean; mensaje: string } | null>(null);

    const procesarPalet = useCallback(
        async (opcion: OpcionCaja) => {
            let registrado = false;
            await intentar(async () => {
                await registrarLecturaCajaOrden(orden.id, {
                    cajaId: opcion.id,
                    cajaCompleta: true,
                    idUbicacionDestino: null,
                    idCajaDestino: null,
                });
                registrado = true;
                setResultado({ exito: true, mensaje: `Palé ${opcion.lpn} registrado` });
                await publicar("lectura_registrada");
            });
            if (!registrado) pitidoError();
            setClaveCaja((k) => k + 1);
        },
        [orden.id, intentar, publicar],
    );

    return (
        <QModal
            abierto={true}
            nombre="leerPaletEntrada"
            titulo="Leer palé de entrada"
            onCerrar={() => publicar("lectura_palet_entrada_cancelada")}
        >
            <quimera-formulario>
                <Caja
                    key={claveCaja}
                    label="Palé (LPN)"
                    nombre="cajaId"
                    valor=""
                    onChange={(opcion) => {
                        if (opcion) procesarPalet(opcion);
                    }}
                    autoFocus
                />
            </quimera-formulario>
            {resultado && (
                <p>
                    {resultado.exito ? (
                        <QEtiqueta variante="exito">{resultado.mensaje}</QEtiqueta>
                    ) : (
                        <span className="q-texto-error">{resultado.mensaje}</span>
                    )}
                </p>
            )}
            <div className="botones maestro-botones">
                <QBoton onClick={() => publicar("lectura_palet_entrada_cancelada")}>
                    Cerrar
                </QBoton>
            </div>
        </QModal>
    );
};
