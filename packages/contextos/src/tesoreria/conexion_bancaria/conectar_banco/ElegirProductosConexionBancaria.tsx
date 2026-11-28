import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QCheckbox } from "@olula/componentes/atomos/qcheckbox.tsx";
import { QModal } from "@olula/componentes/moleculas/qmodal.tsx";
import { useState } from "react";
import { TipoProductoBancario } from "../diseño.js";
import { TIPOS_PRODUCTO_BANCARIO, conTipoProducto, etiquetaTipoProducto } from "../dominio.js";
import { useTTesoreria } from "../../i18n/index.ts";

/**
 * Paso previo al widget de los proveedores que cobran por producto leído
 * (Wealth Reader): qué tipos de producto se leen de la conexión. Cada cuenta o
 * préstamo que devuelva el banco es un producto.
 */
export const ElegirProductosConexionBancaria = ({
    onAceptar,
    onCancelar,
}: {
    onAceptar: (tipos: TipoProductoBancario[]) => void;
    onCancelar: () => void;
}) => {
    const t = useTTesoreria();
    const [tipos, setTipos] = useState<TipoProductoBancario[]>(["accounts"]);

    return (
        <QModal abierto={true} nombre="elegirProductosConexionBancaria" titulo={t("conexion_bancaria.conectarBanco")} onCerrar={onCancelar}>
            <p>
                {t("conexion_bancaria.eligeQueProductosQuieresLeerDel")}
            </p>
            <quimera-formulario>
                {TIPOS_PRODUCTO_BANCARIO.map((tipo) => (
                    <QCheckbox
                        key={tipo}
                        nombre={`tipo_producto_${tipo}`}
                        label={etiquetaTipoProducto(tipo)}
                        valor={tipos.includes(tipo)}
                        onChange={(valor) => setTipos(conTipoProducto(tipos, tipo, valor === "true"))}
                    />
                ))}
            </quimera-formulario>
            <div className="botones maestro-botones">
                <QBoton onClick={() => onAceptar(tipos)} deshabilitado={tipos.length === 0}>
                    {t("conexion_bancaria.continuar")}
                </QBoton>
            </div>
        </QModal>
    );
};
