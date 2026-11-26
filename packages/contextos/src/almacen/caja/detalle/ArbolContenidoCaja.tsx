import { urlFicha } from "#/almacen/comun/fichas.ts";
import { ValorConEnlace } from "@olula/componentes/atomos/qenlace_ficha.tsx";
import { CajaContenido, ComponenteCaja, MaterialCaja, MovimientoCaja } from "../diseño.ts";
import { esMaterial, esSubcaja } from "./dominio.ts";
import { tAlmacen } from "../../i18n/index.ts";

const formatearFechaHora = (fecha: Date): { fecha: string; hora: string } => {
    const d = fecha instanceof Date ? fecha : new Date(fecha);
    const fechaStr = d.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
    const horaStr = d.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
    });
    return { fecha: fechaStr, hora: horaStr };
};

const NodoMovimiento = ({ movimiento }: { movimiento: MovimientoCaja }) => {
    const { fecha, hora } = formatearFechaHora(movimiento.fechaHora);
    return (
        <div className="arbol-movimiento">
            <span className="arbol-movimiento-cantidad">{movimiento.cantidad}</span>
            <span className="arbol-movimiento-concepto">{movimiento.concepto}</span>
            <span className="arbol-movimiento-ubicacion">
                <ValorConEnlace href={urlFicha.ubicacion(movimiento.idUbicacion)} etiqueta={tAlmacen("caja.abrirUbicacionUbicacion", { ubicacion: movimiento.ubicacion })}>
                    {movimiento.ubicacion}
                </ValorConEnlace>
            </span>
            <span className="arbol-movimiento-fecha">
                <span className="arbol-movimiento-fecha-dia">{fecha}</span>
                <span className="arbol-movimiento-fecha-sep">·</span>
                <span className="arbol-movimiento-fecha-hora">{hora}</span>
            </span>
        </div>
    );
};

const NodoMaterial = ({ material }: { material: MaterialCaja }) => (
    <details className="arbol-nodo arbol-material">
        <summary>
            <span className="arbol-material-indicador" aria-hidden="true" />
            <span className="arbol-material-principal">
                <span className="arbol-material-sku">
                    <ValorConEnlace href={urlFicha.articulo(material.sku)} etiqueta={tAlmacen("caja.abrirArticuloSku", { sku: material.sku })}>
                        {material.sku}
                    </ValorConEnlace>
                </span>
                <span className="arbol-material-descripcion">{material.descripcion}</span>
            </span>
            <span className="arbol-material-cantidad">
                <span className="arbol-material-cantidad-valor">{material.cantidad}</span>
                <span className="arbol-material-cantidad-label">{tAlmacen("caja.ud")}</span>
            </span>
        </summary>
        <div className="arbol-material-movimientos">
            {material.movimientos.length === 0 ? (
                <span className="arbol-vacio">{tAlmacen("caja.sinMovimientos")}</span>
            ) : (
                material.movimientos.map((mov) => (
                    <NodoMovimiento key={mov.id} movimiento={mov} />
                ))
            )}
        </div>
    </details>
);

const NodoSubcaja = ({ subcaja }: { subcaja: CajaContenido }) => (
    <details className="arbol-nodo arbol-subcaja" open>
        <summary className="arbol-subcaja-id">
            <ValorConEnlace href={urlFicha.caja(subcaja.id)} etiqueta={tAlmacen("caja.abrirCajaLpn", { lpn: subcaja.lpn })}>{subcaja.lpn}</ValorConEnlace>
        </summary>
        <div className="arbol-subcaja-contenido">
            {subcaja.contenido.map((comp) => (
                <NodoComponente key={comp.id} componente={comp} />
            ))}
            {subcaja.contenido.length === 0 && (
                <span className="arbol-vacio">{tAlmacen("caja.vacia")}</span>
            )}
        </div>
    </details>
);

const NodoComponente = ({ componente }: { componente: ComponenteCaja }) => {
    if (esMaterial(componente)) return <NodoMaterial material={componente} />;
    if (esSubcaja(componente)) return <NodoSubcaja subcaja={componente} />;
    return null;
};

export const ArbolContenidoCaja = ({
    contenido,
}: {
    contenido: ComponenteCaja[];
}) => (
    <div className="ArbolContenidoCaja">
        {contenido.length === 0 ? (
            <p className="arbol-vacio">{tAlmacen("caja.cajaVacia")}</p>
        ) : (
            contenido.map((comp) => (
                <NodoComponente key={comp.id} componente={comp} />
            ))
        )}
    </div>
);
