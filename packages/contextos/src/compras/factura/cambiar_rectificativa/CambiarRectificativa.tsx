import { FacturaCompra } from "#/compras/comun/componentes/factura.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useForm } from "@olula/lib/useForm.ts";
import { useCallback, useState } from "react";
import { Factura } from "../diseño.ts";
import "./CambiarRectificativa.css";
import { useTCompras } from "#/compras/i18n/index.ts";

export const CambiarRectificativa = ({
    factura,
    publicar,
}: {
    factura: Factura;
    publicar: EmitirEvento;
}) => {
    const t = useTCompras();
    const [rectificativaId, setRectificativaId] = useState(factura.rectificativaId ?? "");
    const [codigo, setCodigo] = useState(factura.codigoRectificativa ?? "");

    const cambiar_ = useCallback(
        async () => publicar("rectificativa_cambiada", rectificativaId || null),
        [publicar, rectificativaId]
    );

    const cancelar_ = useCallback(
        () => publicar("cambio_rectificativa_cancelado"),
        [publicar]
    );

    const [cambiar, cancelar] = useForm(cambiar_, cancelar_);

    const esLaPropiaFactura = rectificativaId === factura.id;

    return (
        <QModal
            abierto={true}
            nombre="cambiarRectificativaCompra"
            titulo={t("factura.rectificativa.titulo")}
            onCerrar={cancelar}
        >
            <div className="CambiarRectificativa">
                <quimera-formulario>
                    <FacturaCompra
                        label={t("factura.rectificativa.rectificaA")}
                        nombre="rectificativaId"
                        valor={rectificativaId}
                        descripcion={codigo}
                        onChange={(opcion) => {
                            setRectificativaId(opcion?.valor ?? "");
                            setCodigo(opcion?.descripcion ?? "");
                        }}
                    />
                </quimera-formulario>
                <div className="botones maestro-botones">
                    <QBoton onClick={cambiar} deshabilitado={esLaPropiaFactura}>
                        {t("comun.botones.guardar")}
                    </QBoton>
                </div>
            </div>
        </QModal>
    );
};
