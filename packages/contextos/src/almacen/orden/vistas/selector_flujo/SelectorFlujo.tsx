import { Flujo, flujoPorCodigo, flujosDeTipo } from "../../pasos/flujos.ts";
import "./SelectorFlujo.css";
import { tAlmacen } from "../../../i18n/index.ts";

const Explicacion = ({ texto }: { texto: string }) => (
    <p className="SelectorFlujo__explicacion">{texto}</p>
);

/** Selector del flujo de lectura de una línea u orden, con la explicación de sus pasos. */
export const SelectorFlujo = ({
    tipo,
    valor,
    onChange,
    label = tAlmacen("orden.flujo"),
    excluirPalet = false,
}: {
    tipo: string;
    valor: string | null;
    onChange: (flujo: Flujo | null) => void;
    label?: string;
    excluirPalet?: boolean;
}) => {
    const opciones = flujosDeTipo(tipo).filter((f) => !excluirPalet || !f.palet);
    const elegido = flujoPorCodigo(valor);
    return (
        <div className="SelectorFlujo">
            <label>{label}</label>
            <select value={valor ?? ""} onChange={(e) => onChange(flujoPorCodigo(e.target.value || null))}>
                {opciones.map((f) => (
                    <option key={f.codigo} value={f.codigo}>{f.nombre}</option>
                ))}
            </select>
            {elegido && <Explicacion texto={elegido.explicacion} />}
        </div>
    );
};

/** Flujo de una línea que no se puede cambiar, o pasos que no corresponden a ningún flujo. */
export const DescripcionFlujo = ({
    flujo,
    pasosPick,
    pasosDrop,
    label = tAlmacen("orden.flujo"),
}: {
    flujo: Flujo | null;
    pasosPick: string | null;
    pasosDrop: string | null;
    label?: string;
}) => (
    <div className="SelectorFlujo">
        <label>{label}</label>
        {flujo ? (
            <>
                <strong>{flujo.nombre}</strong>
                <Explicacion texto={flujo.explicacion} />
            </>
        ) : (
            <Explicacion texto={tAlmacen("orden.pasosPersonalizadosPickValorDropValor2", { valor: pasosPick ?? "—", valor2: pasosDrop ?? "—" })} />
        )}
    </div>
);
