import { CamposLibroIva } from "#/contabilidad/comun/componentes/CamposLibroIva.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useFocus } from "@olula/lib/useFocus.ts";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useMemo } from "react";
import { admiteNumeroDesde, admitePorcentaje } from "../dominio.ts";
import { postLibroFacturasRecibidas } from "../infraestructura.ts";
import {
    metaNuevoLibroFacturasRecibidas,
    nuevoLibroFacturasRecibidasInicial,
} from "./crear.ts";
import { useTContabilidad } from "../../i18n/index.ts";

export const CrearLibroFacturasRecibidas = ({
    publicar,
    ejercicioId,
}: {
    publicar: EmitirEvento;
    ejercicioId: string;
}) => {
    // Memoizado: useModelo reinicia el formulario cada vez que cambia la
    // identidad del inicial, así que pasarlo en línea entra en bucle.
    const t = useTContabilidad();
    const inicial = useMemo(
        () => nuevoLibroFacturasRecibidasInicial(ejercicioId),
        [ejercicioId]
    );

    const {
        modelo: informe,
        uiProps,
        valido,
    } = useModelo(metaNuevoLibroFacturasRecibidas, inicial);

    const crear_ = useCallback(async () => {
        const id = await postLibroFacturasRecibidas(informe);
        publicar("informe_creado", id);
    }, [informe, publicar]);

    const cancelar_ = useCallback(
        () => publicar("alta_de_informe_cancelada"),
        [publicar]
    );

    const [crear, cancelar] = useForm(crear_, cancelar_);

    const focus = useFocus();

    return (
        <QModal
            abierto={true}
            nombre="crearLibroFacturasRecibidas"
            titulo={t("libro_facturas_recibidas.nuevoLibroDeFacturasRecibidas")}
            onCerrar={cancelar}
        >
            <div className="CrearLibroFacturasRecibidas">
                <quimera-formulario>
                    <CamposLibroIva
                        uiProps={uiProps}
                        porcentajeEditable={admitePorcentaje(informe)}
                        numeroDesdeEditable={admiteNumeroDesde(informe)}
                        conSerie
                        refDescripcion={focus}
                    />
                </quimera-formulario>

                <div className="botones maestro-botones">
                    <QBoton onClick={crear} deshabilitado={!valido}>
                        {t("libro_facturas_recibidas.crear")}
                    </QBoton>
                </div>
            </div>
        </QModal>
    );
};
