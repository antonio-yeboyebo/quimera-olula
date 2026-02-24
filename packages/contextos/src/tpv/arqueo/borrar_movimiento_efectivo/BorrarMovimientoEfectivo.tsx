import { QModalConfirmacion } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useCallback } from "react";
import { ArqueoTpv } from "../diseño.ts";
import { patchBorrarMovimiento } from "../infraestructura.ts";
// import "./BorrarMovimientoEfectivo.css";

export const BorrarMovimientoEfectivo = ({
  publicar,
  idMovimiento,
  arqueo,
}: {
  publicar: EmitirEvento;
  idMovimiento: string;
  arqueo: ArqueoTpv;
}) => {

    const borrar = useCallback(
        async () => {
            await patchBorrarMovimiento(
                arqueo.id, idMovimiento
            );
            publicar("movimiento_borrado");
        },
        [publicar]
    );

    const cancelar = useCallback(
        () => publicar("borrado_de_movimiento_cancelado"),
        [publicar]
    );

    return (
        <QModalConfirmacion
            nombre="borrarMovimientoEfectivo"
            abierto={true}
            titulo="Borrar movimiento de efectivo"
            mensaje={`¿Está seguro de que desea borrar el movimiento?`}
            onCerrar={cancelar}
            onAceptar={borrar}
        />
    );
};
