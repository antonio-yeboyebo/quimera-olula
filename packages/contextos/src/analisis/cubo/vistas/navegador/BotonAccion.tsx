import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QIcono } from "@olula/componentes/atomos/qicono.tsx";

type BotonAccionProps = {
    icono: string;
    texto: string;
    soloIcono?: boolean;
    destructivo?: boolean;
    deshabilitado?: boolean;
    onClick: () => void;
};

export const BotonAccion = ({ icono, texto, soloIcono, destructivo, deshabilitado, onClick }: BotonAccionProps) => (
    <QBoton
        tamaño="pequeño"
        variante="borde"
        destructivo={destructivo}
        deshabilitado={deshabilitado}
        onClick={onClick}
        props={{ title: texto, "aria-label": texto }}
    >
        <span className="analisis-boton">
            <QIcono nombre={icono} tamaño="sm" />
            {!soloIcono && texto}
        </span>
    </QBoton>
);
