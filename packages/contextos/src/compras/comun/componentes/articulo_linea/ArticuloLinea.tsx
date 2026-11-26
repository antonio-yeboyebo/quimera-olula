import { Articulo } from "#/compras/comun/componentes/articulo.tsx";
import { QIcono } from "@olula/componentes/atomos/qicono.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { useEffect, useRef } from "react";
import { ArticuloDeLineaConTipo } from "../../diseño.ts";
import "./ArticuloLinea.css";
import { useTCompras } from "#/compras/i18n/index.ts";

export type CamposArticuloLinea = ArticuloDeLineaConTipo;

type TipoArticuloAlternable = "registrado" | "libre";

type ArticuloLineaProps = CamposArticuloLinea & {
    nombre?: string;
    onChange: (cambios: Partial<CamposArticuloLinea>) => void;
    bloqueado?: boolean;
    autoFocus?: boolean;
};

export const ArticuloLinea = ({
    tipoArticulo,
    referencia,
    descripcionArticulo,
    descripcion,
    nombre = "referencia",
    onChange,
    bloqueado = false,
    autoFocus = false,
}: ArticuloLineaProps) => {
    const t = useTCompras();
    const refArticulo = useRef<HTMLInputElement | null>(null);
    const refDescripcionGenerica = useRef<HTMLInputElement | null>(null);
    const refDescripcionLibre = useRef<HTMLInputElement | null>(null);
    const montado = useRef(false);

    useEffect(() => {
        const primerRender = !montado.current;
        montado.current = true;
        if (primerRender && !autoFocus) return;

        const campo =
            tipoArticulo === "generico"
                ? refDescripcionGenerica.current
                : tipoArticulo === "libre"
                    ? refDescripcionLibre.current
                    : refArticulo.current;
        campo?.focus();
        if (tipoArticulo !== "registrado") campo?.select();
    }, [tipoArticulo, autoFocus]);

    const personalizarDescripcion = () => {
        onChange({
            tipoArticulo: tipoArticulo === "registrado" ? "generico" : "registrado",
            descripcion: descripcionArticulo ?? descripcion,
        });
    };

    const cambiarATipo = (nuevoTipo: TipoArticuloAlternable) => () =>
        onChange({
            tipoArticulo: nuevoTipo,
            referencia: null,
            descripcionArticulo: null,
            descripcion: "",
        });

    if (tipoArticulo === "libre") {
        return (
            <div className="ArticuloLinea-campo">
                <QInput
                    nombre="descripcion"
                    label={t("comun.campos.descripcion")}
                    valor={descripcion}
                    onChange={(valor) => onChange({ descripcion: valor })}
                    ref={refDescripcionLibre}
                />
                {!bloqueado && (
                    <button
                        type="button"
                        onClick={cambiarATipo("registrado")}
                        title={t("comun.articuloLinea.usarCatalogo")}
                        aria-label={t("comun.articuloLinea.usarCatalogo")}
                        className="ArticuloLinea-boton-candado"
                    >
                        <QIcono nombre="candado" tamaño="sm" />
                    </button>
                )}
            </div>
        );
    }

    return (
        <>
            <div className="ArticuloLinea-campo">
                <Articulo
                    valor={referencia ?? ""}
                    descripcion={descripcionArticulo ?? ""}
                    nombre={nombre}
                    onChange={(opcion) =>
                        onChange({
                            referencia: opcion?.valor ?? null,
                            descripcionArticulo: opcion?.descripcion ?? null,
                            descripcion: opcion?.descripcion ?? "",
                        })
                    }
                    ref={refArticulo}
                    soloLectura={bloqueado}
                />
                {referencia && (
                    <button
                        type="button"
                        onClick={personalizarDescripcion}
                        title={t("comun.articuloLinea.editarDescripcion")}
                        aria-label={t("comun.articuloLinea.editarDescripcion")}
                        className="ArticuloLinea-boton-candado"
                    >
                        <QIcono nombre="editar_2" tamaño="sm" />
                    </button>
                )}
                {!bloqueado && (
                    <button
                        type="button"
                        onClick={cambiarATipo("libre")}
                        title={t("comun.articuloLinea.sinArticulo")}
                        aria-label={t("comun.articuloLinea.sinArticulo")}
                        className="ArticuloLinea-boton-candado"
                    >
                        <QIcono nombre="candado_abierto" tamaño="sm" />
                    </button>
                )}
            </div>
            {tipoArticulo === "generico" && (
                <QInput
                    nombre="descripcion"
                    label={t("comun.articuloLinea.descripcionPersonalizada")}
                    valor={descripcion}
                    onChange={(valor) => onChange({ descripcion: valor })}
                    ref={refDescripcionGenerica}
                />
            )}
        </>
    );
};
