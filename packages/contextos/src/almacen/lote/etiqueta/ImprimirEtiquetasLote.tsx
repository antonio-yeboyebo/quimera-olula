import { abrirPdf } from "#/produccion/comun/pdf.ts";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { ContextoError } from "@olula/lib/contexto.ts";
import { useContext, useState } from "react";
import "./ImprimirEtiquetasLote.css";
import { FormEtiquetaLote, FormatoEtiquetaLote, OpcionesEtiquetaLote } from "../diseño.ts";
import { FORMATOS_ETIQUETA_LOTE, formEtiquetaPorDefecto, opcionesEtiquetaDesdeForm } from "../dominio.ts";
import { tAlmacen, useTAlmacen } from "../../i18n/index.ts";

/**
 * Modal de «Imprimir etiquetas» de un lote: copias, formato (3x9 o 2,5x6) y cantidad opcional
 * (vacía: la pone el servidor). Abre el PDF en una pestaña nueva y se cierra. Lo usan la ficha
 * del lote, la pestaña Lote de la orden y el Terminal (al terminar o declarar la tarea final).
 */
export const ImprimirEtiquetasLote = ({
    titulo = tAlmacen("lote.imprimirEtiquetas"),
    mensaje,
    ayudaCantidad = tAlmacen("lote.vaciaLoFabricadoOSiAun"),
    nombreFichero,
    cargar,
    cerrar,
    labelAceptar = tAlmacen("lote.imprimir"),
    labelCancelar = tAlmacen("lote.cancelar"),
}: {
    titulo?: string;
    mensaje?: string;
    ayudaCantidad?: string;
    nombreFichero: string;
    cargar: (opciones: OpcionesEtiquetaLote) => Promise<Blob>;
    cerrar: () => void;
    labelAceptar?: string;
    labelCancelar?: string;
}) => {
    const t = useTAlmacen();
    const [form, setForm] = useState<FormEtiquetaLote>(formEtiquetaPorDefecto);
    const [aviso, setAviso] = useState("");
    const { intentar } = useContext(ContextoError);
    const cambiar = (campo: keyof FormEtiquetaLote, valor: string) => setForm((f) => ({ ...f, [campo]: valor }));

    const imprimir = async () => {
        const opciones = opcionesEtiquetaDesdeForm(form);
        if (typeof opciones === "string") {
            setAviso(opciones);
            return;
        }
        setAviso("");
        try {
            await intentar(() => abrirPdf(() => cargar(opciones), nombreFichero));
            cerrar();
        } catch {
            // `intentar` ya muestra el error (p. ej. 409: la orden no tiene lote); el modal sigue abierto.
        }
    };

    return (
        <QModalConfirmacion
            nombre="imprimirEtiquetasLote"
            abierto={true}
            titulo={titulo}
            mensaje={mensaje}
            labelAceptar={labelAceptar}
            labelCancelar={labelCancelar}
            onCerrar={cerrar}
            onAceptar={imprimir}
        >
            <quimera-formulario>
                <QInput label={t("lote.copias")} nombre="copiasEtiqueta" valor={form.copias} onChange={(v) => cambiar("copias", String(v ?? ""))} />
                <QSelect
                    label={t("lote.formato")}
                    nombre="formatoEtiqueta"
                    valor={form.formato}
                    opciones={FORMATOS_ETIQUETA_LOTE}
                    onChange={(opcion) => cambiar("formato", (opcion?.valor as FormatoEtiquetaLote | undefined) ?? "3x9")}
                />
                <QInput
                    label={t("lote.cantidad")}
                    nombre="cantidadEtiqueta"
                    valor={form.cantidad}
                    onChange={(v) => cambiar("cantidad", String(v ?? ""))}
                    opcional
                    placeholder={t("lote.automatica")}
                />
            </quimera-formulario>
            <p className="nota-etiqueta">{ayudaCantidad}</p>
            {aviso && <p className="nota-etiqueta aviso" role="alert">{aviso}</p>}
        </QModalConfirmacion>
    );
};
