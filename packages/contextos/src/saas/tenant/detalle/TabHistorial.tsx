import { QEtiqueta } from "@olula/componentes/atomos/qetiqueta.tsx";
import { Provision } from "../diseño.js";
import "./TabHistorial.css";

const variante = (p: Provision) =>
    p.estado === "correcta" ? "exito" : p.estado === "error" ? "error" : "primario";

export const TabHistorial = ({ provisiones }: { provisiones: Provision[] }) => (
    <div className="TabHistorial">
        {provisiones.map((p) => (
            <details key={p.id} open={p.estado === "error"}>
                <summary>
                    <QEtiqueta variante={variante(p)}>{p.estado.replace("_", " ")}</QEtiqueta>
                    <strong>{p.tipo}</strong>
                    <span>{p.inicio}{p.fin ? ` → ${p.fin}` : ""}</span>
                </summary>
                {p.error && <div className="provision-error">{p.error}</div>}
                {p.log && <pre className="provision-log">{p.log}</pre>}
            </details>
        ))}
        {provisiones.length === 0 && <p>Sin provisiones registradas.</p>}
    </div>
);
