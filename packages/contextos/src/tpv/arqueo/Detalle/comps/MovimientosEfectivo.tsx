import { MetaTabla, QBoton } from "@olula/componentes/index.js";
import { ListadoControlado } from "@olula/componentes/maestro/ListadoControlado.js";
import { EmitirEvento, Entidad } from "@olula/lib/diseño.js";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { useCallback, useState } from "react";
import { BorrarMovimientoEfectivo } from "../../borrar_movimiento_efectivo/BorrarMovimientoEfectivo.tsx";
import { ArqueoTpv, MovimientoArqueoTpv } from "../../diseño.ts";
import { EstadoArqueoTpv } from "../diseño.ts";

type BorrarItem = {
    tipo: 'borrar';
    indice: number;
}
type CrearItem = {
    tipo: 'crear';
    ids: string[];
}
type CambiarItem = {
    tipo: 'cambiar';
    id: string
}

type AccionItem = BorrarItem | CrearItem | CambiarItem;

type RespuestaUseItemActivo<I extends Entidad> = [
    itemActivo: I | null,
    setItemActivo: (item: I | null) => void,
    setEstadoSeleccion: (tipo: 'crear' | 'borrar' | 'cambiar') => void
]

const useItemActivo = <E extends Entidad, I extends Entidad>({
    items,
    entidad,
}: {
    items: I[];
    entidad: E;
}): RespuestaUseItemActivo<I> => {

    const [entidadAnterior, setEntidadAnterior] = useState<E | null>(null);

    const [estadoSeleccion, setEstadoSeleccion] = useState<AccionItem | null>(null);

    const [itemActivo, setItemActivo] = useState<I | null>(
        items.length > 0 ? items[0] : null
    );

    const getItemActivo = useCallback(
        (entidadAnterior: E |  null) => {
            let item: I | undefined;
            if (!entidadAnterior || entidadAnterior.id !== entidad.id) {
                console.log('cambio de entidad !!!', items)
                item = items.length > 0 ? items[0] : undefined;
            } else if (estadoSeleccion) {
                if (estadoSeleccion.tipo === 'crear') {
                    item = items.find(m => !estadoSeleccion.ids.includes(m.id));
                } else if (estadoSeleccion.tipo === 'borrar') {
                    item = items.length > estadoSeleccion.indice 
                        ? items[estadoSeleccion.indice]
                        : items.length
                            ? items[items.length - 1] 
                            : undefined;
                } else if (estadoSeleccion.tipo === 'cambiar') {
                    item = items.find(m => m.id === estadoSeleccion.id);
                }
            }
            if (item) {
                setItemActivo(item);
            }
        },
        [estadoSeleccion, entidad, items, setItemActivo]
    );

    const setSiguienteActivo = useCallback(
        (tipo: 'crear' | 'borrar' | 'cambiar') => {
            if (tipo == 'crear') {
                setEstadoSeleccion({
                    tipo: 'crear',
                    ids: items.map(m => m.id),
                });
            } else if (tipo == 'borrar') {
                setEstadoSeleccion({
                    tipo: 'borrar',
                    indice: items.findIndex(m => m.id === itemActivo?.id),
                });
            } else if (tipo == 'cambiar' && itemActivo) {
                setEstadoSeleccion({
                    tipo: 'cambiar',
                    id: itemActivo?.id,
                });
            }
        },
        [itemActivo, items, setEstadoSeleccion]
    );

    if (entidad !== entidadAnterior) {
        getItemActivo(entidadAnterior);
        setEntidadAnterior(entidad);
    }
    return [
        itemActivo,
        setItemActivo,
        setSiguienteActivo,
    ];
}

export const MovimientosEfectivo = ({
    arqueo,
    estado,
    publicar,
}: {
    arqueo: ArqueoTpv;
    estado: EstadoArqueoTpv;
    publicar: EmitirEvento;
}) => {

    const [movimientoActivo, setMovimientoActivo, setSiguienteActivo] = useItemActivo({
        entidad: arqueo,
        items: arqueo.movimientos,
    })

    const crear = () => {
        setSiguienteActivo('crear');
        publicar("creacion_de_movimiento_solicitada");
    }

    const borrar = () => {
        if (movimientoActivo) {
            setSiguienteActivo('borrar');
            publicar("borrado_de_movimiento_solicitado");
        }
    }

    return (
        arqueo.movimientos.length === 0 
        ? estado !== 'CERRADO' && <>
                <QBoton texto='Movimiento de efectivo'
                    onClick={crear}
                />
            </>
        : <>
            <h3>Movimientos de efectivo</h3>
            {estado !== 'CERRADO' && 
                <div className="botones maestro-botones ">
                    <QBoton texto='Crear'
                        onClick={crear}
                    />
                    <QBoton texto='Borrar'
                        deshabilitado={!movimientoActivo}
                        onClick={borrar}
                    />
                </div>
            }
            <ListadoControlado
                metaTabla={getMetaTablaMovimientosEfectivo()}
                cargando={false}
                criteriaInicial={criteriaDefecto}
                idReiniciarCriteria={arqueo.id}
                modo={'tabla'}
                entidades={arqueo.movimientos}
                totalEntidades={arqueo.movimientos.length}
                seleccionada={movimientoActivo}
                onSeleccion={(m)=>setMovimientoActivo(m)}
                onCriteriaChanged={()=>{}}
            />
            {
                estado === "BORRANDO_MOVIMIENTO" && movimientoActivo &&
                <BorrarMovimientoEfectivo
                    arqueo={arqueo}
                    idMovimiento={movimientoActivo.id}
                    publicar={publicar}
                />
            }
        </>
    );
};

const getMetaTablaMovimientosEfectivo = () => {
    const meta:MetaTabla<MovimientoArqueoTpv> =[
        {
            id: "fecha",
            cabecera: "Fecha",
            tipo: "fecha",
        },
        {
            id: "importe",
            cabecera: "Importe",
            tipo: "moneda",
        },
        { id: "idAgente", cabecera: "Agente", 
            render: (movimiento: MovimientoArqueoTpv) => 
                `${movimiento.idAgente} ${movimiento.agente}`
        },
    ];
    return meta;
};
