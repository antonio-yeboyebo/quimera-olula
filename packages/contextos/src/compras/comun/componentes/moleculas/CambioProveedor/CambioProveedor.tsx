import { Proveedor } from "#/compras/comun/componentes/proveedor.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput, QModal } from "@olula/componentes/index.js";
import { Modelo } from "@olula/lib/diseño.ts";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useMemo, useState } from "react";
import "./CambioProveedor.css";
import { useTCompras } from "#/compras/i18n/index.ts";
import { CambioProveedor as Cambio } from "./diseño.ts";
import {
    metaCambioProveedor,
    metaCambioProveedorNoRegistrado,
    proveedorRegistrado,
} from "./dominio.ts";

export type DocumentoConProveedor = {
    proveedorId: string | null;
    nombreProveedor: string;
    idFiscal: string;
};

export const CambioProveedor = ({
    documento,
    onGuardar,
    onCancelar,
    titulo,
}: {
    documento: DocumentoConProveedor;
    onGuardar: (cambio: Cambio) => Promise<void>;
    onCancelar?: () => void;
    titulo?: string;
}) => {
    const t = useTCompras();
    const [registrado, setRegistrado] = useState(
        proveedorRegistrado(documento.proveedorId)
    );

    const inicial = useMemo(
        (): Cambio & Modelo => ({
            proveedorId: documento.proveedorId ?? "",
            nombreProveedor: documento.nombreProveedor ?? "",
            idFiscal: documento.idFiscal ?? "",
        }),
        [documento.proveedorId, documento.nombreProveedor, documento.idFiscal]
    );

    const { modelo, uiProps, valido, set } = useModelo(
        registrado ? metaCambioProveedor : metaCambioProveedorNoRegistrado,
        inicial
    );

    const alternarModo = () => {
        const aRegistrado = !registrado;
        setRegistrado(aRegistrado);
        set({ ...modelo, proveedorId: aRegistrado ? modelo.proveedorId : "" });
    };

    const guardar = async () => {
        await onGuardar(
            registrado
                ? { ...modelo, proveedorId: modelo.proveedorId }
                : { ...modelo, proveedorId: "" }
        );
    };

    return (
        <QModal abierto={true} nombre="cambioProveedorCompra" titulo={titulo ?? t("comun.cambioProveedor.titulo")} onCerrar={onCancelar}>
            <div className="modo-proveedor">
                <QBoton onClick={alternarModo} variante="texto" tipo="button">
                    {registrado ? t("comun.cambioProveedor.noRegistrado") : t("comun.cambioProveedor.registrado")}
                </QBoton>
            </div>
            <div className="CambioProveedor">
                <quimera-formulario>
                    {registrado ? (
                        <Proveedor
                            {...uiProps("proveedorId", "nombreProveedor")}
                            nombre="proveedorIdCambio"
                        />
                    ) : (
                        <>
                            <QInput
                                label={t("comun.cambioProveedor.nombreProveedor")}
                                {...uiProps("nombreProveedor")}
                            />
                            <QInput label={t("comun.campos.idFiscal")} {...uiProps("idFiscal")} />
                        </>
                    )}
                </quimera-formulario>
                <div className="botones maestro-botones">
                    <QBoton onClick={guardar} deshabilitado={!valido}>
                        {t("comun.botones.guardar")}
                    </QBoton>
                </div>
            </div>
        </QModal>
    );
};
