import { Articulo } from "#/almacen/comun/componentes/Articulo.tsx";
import { TipoArticuloLinea } from "#/ventas/venta/diseño.ts";
import { QIcono, QInput } from "@olula/componentes/index.js";
import { useEffect, useRef } from "react";
import "./ArticuloLinea.css";
import { useTVentas } from "../../../i18n/index.ts";

export type CamposArticuloLinea = {
    tipoArticulo: TipoArticuloLinea;
    idArticulo: string | null;
    descripcionArticulo: string | null;
    descripcion: string;
    porLotes?: boolean;
};

interface ArticuloLineaProps extends CamposArticuloLinea {
    nombre?: string;
    onChange: (cambios: Partial<CamposArticuloLinea>) => void;
    ref?: React.RefObject<HTMLInputElement | null>;
    bloqueado?: boolean;
}

export const ArticuloLinea = ({
    tipoArticulo,
    idArticulo,
    descripcionArticulo,
    descripcion,
    nombre = "idArticulo",
    onChange,
    bloqueado = false,
}: ArticuloLineaProps) => {
    const t = useTVentas();
    const refArticulo = useRef<HTMLInputElement | null>(null);
    const refDescripcionRegistrado = useRef<HTMLInputElement | null>(null);
    const refDescripcionLibre = useRef<HTMLInputElement | null>(null);
    const montado = useRef(false);

    useEffect(() => {
        if (!montado.current) {
            montado.current = true;
            return;
        }
        if (tipoArticulo === "generico") {
            refDescripcionRegistrado.current?.focus();
            refDescripcionRegistrado.current?.select();
        } else if (tipoArticulo === "libre") {
            refDescripcionLibre.current?.focus();
            refDescripcionLibre.current?.select();
        } else if (tipoArticulo === "registrado") {
            refArticulo.current?.focus();
        }
    }, [tipoArticulo]);

    const toggleDescripcion = () => {
        const nuevoTipo = tipoArticulo === "registrado" ? "generico" : "registrado";
        onChange({
            tipoArticulo: nuevoTipo,
            descripcion: descripcionArticulo!
        });
    };

    const abrir = () => {
        onChange({ tipoArticulo: "libre", idArticulo: null, descripcionArticulo: null, descripcion: "" });
    };

    const cerrar = () => {
        onChange({ tipoArticulo: "registrado", idArticulo: null, descripcionArticulo: null, descripcion: "" });
    };

    if (tipoArticulo !== "libre") {
        return (
            <>
                <div className="ArticuloLinea-campo">
                    <Articulo
                        valor={idArticulo ?? ""}
                        descripcion={descripcionArticulo ?? ""}
                        nombre={nombre}
                        onChange={(opcion) =>
                            onChange({
                                idArticulo: opcion?.valor ?? null,
                                descripcionArticulo: opcion?.descripcion ?? null,
                                porLotes: opcion?.datos?.porLotes ?? false,
                            })
                        }
                        ref={refArticulo}
                        soloLectura={bloqueado}
                    />
                    {idArticulo && !bloqueado && (
                        <button
                            type="button"
                            onClick={toggleDescripcion}
                            title={t("comun.linea.editarDescripcion")}
                            aria-label={t("comun.linea.editarDescripcion")}
                            className="ArticuloLinea-boton-candado"
                        >
                            <QIcono nombre="editar_2" tamaño="sm" />
                        </button>
                    )}
                    {!bloqueado &&
                        <button
                            type="button"
                            onClick={abrir}
                            title={t("comun.linea.abrirDescripcionLibre")}
                            aria-label={t("comun.linea.abrirDescripcionLibre")}
                            className="ArticuloLinea-boton-candado"
                        >
                            <QIcono nombre="candado_abierto" tamaño="sm" />
                        </button>
                    }
                </div>
                {tipoArticulo === "generico" && (
                    <QInput
                        nombre="descripcion"
                        label={t("comun.campos.descripcionPersonalizada")}
                        valor={descripcion ?? ""}
                        onChange={(val) => onChange({ descripcion: val })}
                        valido={!!descripcion}
                        ref={refDescripcionRegistrado}
                    />
                )}
            </>
        );
    }

    return (
        <div className="ArticuloLinea-campo">
            <QInput
                nombre="descripcion"
                label={t("comun.campos.descripcion")}
                valor={descripcion ?? ""}
                erroneo={!descripcion}
                onChange={(val) => onChange({ descripcion: val })}
                ref={refDescripcionLibre}
            />
            {!bloqueado &&
                <button
                    type="button"
                    onClick={cerrar}
                    title={t("comun.linea.cerrarDescripcionLibre")}
                    aria-label={t("comun.linea.cerrarDescripcionLibre")}
                    className="ArticuloLinea-boton-candado"
                >
                    <QIcono nombre="candado" tamaño="sm" />
                </button>
            }
        </div>
    );
};
