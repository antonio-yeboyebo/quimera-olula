import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { QAutocompletar } from "@olula/componentes/moleculas/qautocompletar.tsx";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { posicionActual } from "../../comun/geolocalizacion.ts";
import { rutasSmartsales } from "../../comun/rutas.ts";
import { LayoutSmartsales } from "../../comun/componentes/LayoutSmartsales.tsx";
import { ListaArticulos } from "../../comun/componentes/ListaArticulos.tsx";
import { buscarProductos } from "../../nueva_tarea/infraestructura.ts";
import { CAPITALES } from "../capitales.ts";
import { FiltrosProspeccion as Filtros } from "../diseño.ts";
import { capitalMasCercana, capitalPorNombre, filtrosAUrl, filtrosDesdeUrl, filtrosIniciales, OPCIONES_ULTIMA_COMPRA } from "../dominio.ts";
import { buscarClientesMapa, guardarUltimaCapital, leerUltimaCapital } from "../infraestructura.ts";
import "./Prospeccion.css";

const ESPERA_CONTADOR = 600;

const numeroONulo = (texto: string) => (texto.trim() === "" ? null : Number(texto) || 0);

export const FiltrosProspeccion = () => {
    const navigate = useNavigate();
    const [parametros] = useSearchParams();
    const [filtros, setFiltros] = useState<Filtros>(() => filtrosDesdeUrl(parametros) ?? filtrosIniciales());
    const [total, setTotal] = useState<number | null>(null);
    const [masFiltros, setMasFiltros] = useState(filtros.articulos.length > 0);

    const cambiar = (cambios: Partial<Filtros>) => setFiltros((actuales) => ({ ...actuales, ...cambios }));

    useEffect(() => {
        if (filtros.capital) return;
        let activo = true;
        posicionActual().then((posicion) => {
            if (!activo) return;
            cambiar({ capital: posicion ? capitalMasCercana(posicion).nombre : (leerUltimaCapital() ?? "Madrid") });
        });
        return () => {
            activo = false;
        };
    }, [filtros.capital]);

    useEffect(() => {
        const capital = capitalPorNombre(filtros.capital);
        if (!capital) return;
        setTotal(null);
        let activo = true;
        const espera = setTimeout(() => {
            buscarClientesMapa(capital, filtros, true)
                .then((resultado) => activo && setTotal(resultado.total))
                .catch(() => undefined);
        }, ESPERA_CONTADOR);
        return () => {
            activo = false;
            clearTimeout(espera);
        };
    }, [filtros]);

    const verClientes = () => {
        if (filtros.capital) guardarUltimaCapital(filtros.capital);
        navigate(`${rutasSmartsales.mapa}?${filtrosAUrl(filtros)}`);
    };

    return (
        <LayoutSmartsales>
            <div className="Prospeccion">
                <header>
                    <h1>Filtros</h1>
                </header>

                <QSelect
                    label="Zona"
                    nombre="capital"
                    valor={filtros.capital ?? ""}
                    opciones={CAPITALES.map((c) => ({ valor: c.nombre, descripcion: c.nombre }))}
                    onChange={(opcion) => opcion && cambiar({ capital: opcion.valor })}
                />
                <QInput label="Radio (km)" nombre="radio" valor={String(filtros.radio)} onChange={(valor) => cambiar({ radio: Number(valor) || 1 })} />
                <QInput
                    label="Afinidad mínima (%)"
                    nombre="afinidad"
                    opcional
                    valor={filtros.afinidadMin === null ? "" : String(Math.round(filtros.afinidadMin * 100))}
                    onChange={(valor) => {
                        const porcentaje = numeroONulo(valor);
                        cambiar({ afinidadMin: porcentaje === null ? null : porcentaje / 100 });
                    }}
                />
                <QSelect
                    label="Última compra"
                    nombre="ultima_compra"
                    valor={filtros.sinCompraMeses === null ? "" : String(filtros.sinCompraMeses)}
                    opciones={OPCIONES_ULTIMA_COMPRA}
                    onChange={(opcion) => cambiar({ sinCompraMeses: opcion?.valor ? Number(opcion.valor) : null })}
                />
                <QInput
                    label="Ventas de 12 meses mínimas (€)"
                    nombre="ventas"
                    opcional
                    valor={filtros.ventasMin === null ? "" : String(filtros.ventasMin)}
                    onChange={(valor) => cambiar({ ventasMin: numeroONulo(valor) })}
                />
                <QAutocompletar
                    label="Subfamilia a recomendar"
                    nombre="subfamilia"
                    opcional
                    valor={filtros.subfamilia?.codigo ?? ""}
                    descripcion={filtros.subfamilia?.descripcion}
                    obtenerOpciones={async (texto) => (await buscarProductos("subfamilia", texto)).map((p) => ({ valor: p.codigo, descripcion: p.descripcion }))}
                    onChange={(opcion) => cambiar({ subfamilia: opcion ? { codigo: opcion.valor, descripcion: opcion.descripcion } : null })}
                />

                {masFiltros ? (
                    <ListaArticulos label="Han comprado alguno de estos artículos" nombre="articulos" articulos={filtros.articulos} onChange={(articulos) => cambiar({ articulos })} />
                ) : (
                    <QBoton variante="borde" tamaño="pequeño" onClick={() => setMasFiltros(true)}>
                        Más filtros
                    </QBoton>
                )}

                <div className="acciones">
                    <QBoton variante="borde" onClick={() => setFiltros(filtrosIniciales(filtros.capital))}>
                        Limpiar
                    </QBoton>
                    <QBoton deshabilitado={!filtros.capital} onClick={verClientes}>
                        {total === null ? "Ver clientes" : `Ver ${total} clientes`}
                    </QBoton>
                </div>
            </div>
        </LayoutSmartsales>
    );
};
