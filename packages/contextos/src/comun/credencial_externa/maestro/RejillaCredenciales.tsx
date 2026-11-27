import { QIcono } from "@olula/componentes/atomos/qicono.tsx";
import { CredencialExterna } from "../diseño.js";
import { iconoProveedor } from "../dominio.js";
import "./RejillaCredenciales.css";
import { tComun } from "../../i18n/index.ts";

interface RejillaCredencialesProps {
    titulo: string;
    credenciales: CredencialExterna[];
    onSeleccion: (id: string) => void;
    onCrear: () => void;
    puedeCrear: boolean;
    textoCrear: string;
}

/**
 * Reemplaza la tabla/listado clásico por una rejilla de tiles con el icono del
 * proveedor — un tile por credencial ya dada de alta, más un tile "+" para
 * crear una nueva. El check visible indica `activo`; el clic en un tile abre
 * el mismo detalle de siempre (ver MaestroConDetalleCredencialExterna.tsx).
 */
export const RejillaCredenciales = ({
    titulo,
    credenciales,
    onSeleccion,
    onCrear,
    puedeCrear,
    textoCrear,
}: RejillaCredencialesProps) => {
    return (
        <section className="RejillaCredenciales">
            <h3 className="RejillaCredenciales-titulo">{titulo}</h3>
            <div className="RejillaCredenciales-grid">
                {credenciales.map((credencial) => (
                    <button
                        key={credencial.id}
                        type="button"
                        className="TileCredencial"
                        onClick={() => onSeleccion(credencial.id)}
                    >
                        {credencial.activo && (
                            <span className="TileCredencial-check">
                                <QIcono nombre="check" tamaño="xs" />
                            </span>
                        )}
                        <QIcono nombre={iconoProveedor(credencial.proveedor)} tamaño="xl" />
                        <span className="TileCredencial-nombre">{credencial.nombre}</span>
                        <span className="TileCredencial-proveedor">{credencial.proveedor}</span>
                    </button>
                ))}
                {puedeCrear && (
                    <button type="button" className="TileCredencial TileCredencial-nueva" onClick={onCrear}>
                        <QIcono nombre="crear" tamaño="xl" />
                        <span className="TileCredencial-nombre">{textoCrear}</span>
                    </button>
                )}
            </div>
            {credenciales.length === 0 && !puedeCrear && (
                <p className="RejillaCredenciales-vacio">{tComun("credencialExterna.nadaConfiguradoTodavia")}</p>
            )}
        </section>
    );
};
