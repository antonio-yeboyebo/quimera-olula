import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QModal } from "@olula/componentes/moleculas/qmodal.tsx";
import { ContextoError } from "@olula/lib/contexto.ts";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useCallback, useContext, useState } from "react";
import { Link } from "react-router";
import { OrdenAlmacen } from "../../diseño.ts";
import { postColocacion } from "../../infraestructura.ts";
import { useTAlmacen } from "../../../i18n/index.ts";

export const ColocacionOrden = ({
    publicar,
    orden,
}: {
    publicar: EmitirEvento;
    orden: OrdenAlmacen;
}) => {
    const t = useTAlmacen();
    const { intentar } = useContext(ContextoError);
    const [idOrdenColocacion, setIdOrdenColocacion] = useState<string | null>(null);

    const crearColocacion = useCallback(async () => {
        await intentar(async () => {
            const id = await postColocacion(orden.id);
            setIdOrdenColocacion(id);
        });
    }, [orden.id, intentar]);

    if (idOrdenColocacion) {
        return (
            <QModal
                abierto={true}
                nombre="colocacionCreada"
                titulo={t("orden.ordenDeColocacionCreada")}
                onCerrar={() => publicar("colocacion_creada")}
            >
                <p>{t("orden.ordenDeColocacion")}{" "}<strong>{idOrdenColocacion}</strong>{" "}{t("orden.creadaConExito")}</p>
                <p>
                    <Link to={`/almacen/ordenes?id=${idOrdenColocacion}`} onClick={() => publicar("colocacion_creada")}>
                        {t("orden.irALaOrdenDeColocacion")}
                    </Link>
                </p>
                <div className="maestro-botones">
                    <QBoton onClick={() => publicar("colocacion_creada")}>{t("orden.cerrar")}</QBoton>
                </div>
            </QModal>
        );
    }

    return (
        <QModal
            abierto={true}
            nombre="confirmarColocacion"
            titulo={t("orden.crearOrdenDeColocacion")}
            onCerrar={() => publicar("colocacion_cancelada")}
        >
            <p>{t("orden.seCrearaUnaOrdenDeTraspaso")}</p>
            <div className="maestro-botones">
                <QBoton variante="borde" onClick={() => publicar("colocacion_cancelada")}>{t("orden.cancelar")}</QBoton>
                <QBoton onClick={crearColocacion}>{t("orden.crearOrdenDeColocacion")}</QBoton>
            </div>
        </QModal>
    );
};
