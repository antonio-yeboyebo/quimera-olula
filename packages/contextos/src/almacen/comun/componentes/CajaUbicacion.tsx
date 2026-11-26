import {
    buscarCajaCompletaPorTexto,
    buscarUbicacionPorTexto,
    CajaCompletaResuelta,
    UbicacionResuelta,
} from "#/almacen/comun/voz_resolvers.ts";
import { QInput } from "@olula/componentes/index.js";
import { useState } from "react";
import { tAlmacen } from "../../i18n/index.ts";

export type ResultadoCajaUbicacion =
    | ({ tipo: "caja" } & CajaCompletaResuelta)
    | ({ tipo: "ubicacion" } & UbicacionResuelta);

interface CajaUbicacionProps {
    onChange: (resultado: ResultadoCajaUbicacion | null) => void;
    label?: string;
    autoFocus?: boolean;
}

export const CajaUbicacion = ({
    onChange,
    label = tAlmacen("comun.cajaUbicacion"),
    autoFocus,
}: CajaUbicacionProps) => {
    const [valor, setValor] = useState("");

    const buscar = async () => {
        const texto = valor.trim();
        if (!texto) return;
        setValor("");

        const caja = await buscarCajaCompletaPorTexto(texto);
        if (caja) {
            onChange({ tipo: "caja", ...caja });
            return;
        }

        const ubicacion = await buscarUbicacionPorTexto(texto);
        if (ubicacion) {
            onChange({ tipo: "ubicacion", ...ubicacion });
            return;
        }

        onChange(null);
    };

    return (
        <div onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); buscar(); } }}>
            <QInput
                label={label}
                nombre="cajaUbicacion"
                tipo="texto"
                valor={valor}
                onChange={(v) => setValor(v)}
                autoFocus={autoFocus}
            />
        </div>
    );
};
