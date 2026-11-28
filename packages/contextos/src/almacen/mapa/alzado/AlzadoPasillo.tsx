import { CapaMapa, Lado, PasilloMapa, UbicacionMapa } from "../diseño.ts";
import {
    huecosDe, ladosDePasillo, letraUbicacion, modulosDeLado, resumenUbicacion, tonoUbicacion, ubicacionesPorModulo,
} from "../dominio.ts";
import { tAlmacen } from "../../i18n/index.ts";

type Props = {
    pasillo: PasilloMapa;
    ubicaciones: UbicacionMapa[];
    capa: CapaMapa;
    paleta: Map<string, number>;
    ubicacionId: string | null;
    onUbicacion: (ubicacionId: string) => void;
};

const textoLado: Record<Lado, string> = {
    get IZQUIERDA() { return tAlmacen("mapa.caraIzquierdaImpares"); },
    get DERECHA() { return tAlmacen("mapa.caraDerechaPares"); },
};

/** Alzado de las caras de un pasillo: módulos en el sentido de avance, niveles de abajo arriba. */
export const AlzadoPasillo = ({ pasillo, ubicaciones, capa, paleta, ubicacionId, onUbicacion }: Props) => {
    const porModulo = ubicacionesPorModulo(ubicaciones, pasillo.pasilloId);
    const niveles = Array.from({ length: pasillo.niveles }, (_, i) => pasillo.niveles - 1 - i);

    if (pasillo.niveles === 0) return <p>{tAlmacen("mapa.elPasilloPasilloNoTieneUbicaciones", { pasillo: pasillo.pasillo })}</p>;

    return (
        <div className="mapa-alzado">
            {ladosDePasillo(pasillo).map((lado) => {
                const modulos = modulosDeLado(pasillo, lado);
                return (
                    <div key={lado} className="mapa-alzado-cara">
                        <h4>{textoLado[lado]}</h4>
                        <div className="mapa-alzado-scroll">
                            <table className="mapa-alzado-rejilla">
                                <tbody>
                                    {niveles.map((nivel) => (
                                        <tr key={nivel}>
                                            <th scope="row">{tAlmacen("mapa.nNivel", { nivel })}</th>
                                            {modulos.map((modulo) => {
                                                const huecos = huecosDe(porModulo.get(modulo) ?? [], nivel);
                                                return (
                                                    <td key={modulo}>
                                                        <div className="mapa-alzado-modulo">
                                                            {huecos.map((u) => (
                                                                <button
                                                                    key={u.ubicacionId}
                                                                    type="button"
                                                                    className={`mapa-hueco tono-${tonoUbicacion(u, capa, paleta)}${u.ubicacionId === ubicacionId ? " seleccionada" : ""}`}
                                                                    title={resumenUbicacion(u)}
                                                                    aria-label={resumenUbicacion(u).replace(/\n/g, ". ")}
                                                                    onClick={() => onUbicacion(u.ubicacionId)}
                                                                >
                                                                    {letraUbicacion(u, capa)}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <th aria-hidden="true" />
                                        {modulos.map((m) => <th key={m} scope="col">{m}</th>)}
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
