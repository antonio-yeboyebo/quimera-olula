import { QEtiqueta } from "@olula/componentes/atomos/qetiqueta.tsx";
import { QAutocompletar } from "@olula/componentes/moleculas/qautocompletar.tsx";
import { buscarProductos } from "../../nueva_tarea/infraestructura.ts";
import "./ListaArticulos.css";

export type ArticuloElegido = {
    codigo: string;
    descripcion: string;
};

type ListaArticulosProps = {
    label: string;
    nombre: string;
    articulos: ArticuloElegido[];
    onChange: (articulos: ArticuloElegido[]) => void;
};

export const ListaArticulos = ({ label, nombre, articulos, onChange }: ListaArticulosProps) => (
    <>
        <QAutocompletar
            label={label}
            nombre={nombre}
            opcional
            valor=""
            obtenerOpciones={async (texto) =>
                (await buscarProductos("articulo", texto))
                    .filter((p) => !articulos.some((a) => a.codigo === p.codigo))
                    .map((p) => ({ valor: p.codigo, descripcion: p.descripcion }))
            }
            onChange={(opcion) => opcion && onChange([...articulos, { codigo: opcion.valor, descripcion: opcion.descripcion }])}
        />
        {articulos.length > 0 && (
            <ul className="ListaArticulos">
                {articulos.map((articulo) => (
                    <li key={articulo.codigo}>
                        <QEtiqueta variante="neutro">
                            {articulo.descripcion}
                            <button
                                type="button"
                                aria-label={`Quitar ${articulo.descripcion}`}
                                onClick={() => onChange(articulos.filter((a) => a.codigo !== articulo.codigo))}
                            >
                                ×
                            </button>
                        </QEtiqueta>
                    </li>
                ))}
            </ul>
        )}
    </>
);
