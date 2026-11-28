import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useMemo } from "react";
import { Banco } from "../diseño.ts";
import { metaSucursal, nuevaSucursalVacia } from "../dominio.ts";
import { postSucursal } from "../infraestructura.ts";
import { CamposSucursal } from "./CamposSucursal.tsx";
import { useTTesoreria } from "../../i18n/index.ts";

export const CrearSucursalBanco = ({ banco, publicar }: { banco: Banco; publicar: EmitirEvento }) => {
    const t = useTTesoreria();
    const inicial = useMemo(nuevaSucursalVacia, []);

    const { modelo, uiProps, valido } = useModelo(metaSucursal, inicial);

    const crear_ = useCallback(async () => {
        const id = await postSucursal(banco.id, modelo);
        publicar("sucursal_creada", id);
    }, [banco.id, modelo, publicar]);

    const cancelar_ = useCallback(() => publicar("alta_de_sucursal_cancelada"), [publicar]);

    const [crear, cancelar] = useForm(crear_, cancelar_);

    return (
        <QModal abierto={true} nombre="crearSucursalBanco" titulo={t("banco.nuevaSucursalDeNombre", { nombre: banco.nombre })} onCerrar={cancelar}>
            <div className="CrearSucursalBanco">
                <quimera-formulario>
                    <CamposSucursal uiProps={uiProps} />
                </quimera-formulario>
                <div className="botones maestro-botones">
                    <QBoton onClick={crear} deshabilitado={!valido}>
                        {t("banco.crear")}
                    </QBoton>
                </div>
            </div>
        </QModal>
    );
};
