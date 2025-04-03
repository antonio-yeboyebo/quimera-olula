import { useEffect, useState } from "react";
import {
    idFiscalValido,
    idFiscalValidoGeneral,
    tipoIdFiscalValido
} from "../dominio.ts";

import { QBoton } from "../../../../componentes/atomos/qboton.tsx";
import { QInput2 } from "../../../../componentes/atomos/qinput.tsx";
import { Cliente } from "../diseño.ts";
interface IdFiscalProps {
  cliente: Cliente;
  onIdFiscalCambiadoCallback: (idFiscal: IdFiscal) => void;
}

interface IdFiscal {
  id_fiscal: string;
  tipo_id_fiscal: string;
}




export const IdFiscal = ({
    cliente,
    onIdFiscalCambiadoCallback,
  }: IdFiscalProps) => {

    const [modoLectura, setModoLectura] = useState(true);

    useEffect(
        () => {
            setModoLectura(true);
        }
        , [cliente]
    );

    return modoLectura
        ? <IdFiscalLectura
            cliente={cliente} 
            onEditarCallback={() => setModoLectura(false)}
        />
        : <IdFiscalEdicion
            cliente={cliente}
            onIdFiscalCambiadoCallback={onIdFiscalCambiadoCallback}
            canceladoCallback={() => setModoLectura(true)}
        />
  };

const IdFiscalLectura = (
    {
        cliente,
        onEditarCallback,
    } : {
        cliente: Cliente;
        onEditarCallback: () => void;
    }
) => {

    return  (
    <>
        <label>{cliente.tipo_id_fiscal}: {cliente.id_fiscal}</label>
        <button
            onClick={onEditarCallback}
        >
            Editar
        </button>
    </>
    )
    
};


const IdFiscalEdicion = (
    {
        cliente,
        onIdFiscalCambiadoCallback,
        canceladoCallback,
    }: {
        cliente: Cliente;
        onIdFiscalCambiadoCallback: (idFiscal: IdFiscal) => void;
        canceladoCallback: () => void;
    }
) => {
    
    const [idFiscal, setIdFiscal] = useState<IdFiscal>({
        id_fiscal: cliente.id_fiscal,
        tipo_id_fiscal: cliente.tipo_id_fiscal,
        });

    // const [guardando, setGuardando] = useState(false);

    useEffect(
        () => {
            setIdFiscal({
                id_fiscal: cliente.id_fiscal,
                tipo_id_fiscal: cliente.tipo_id_fiscal,
            });
        },
        [cliente]
    );

    const onIdFiscalCambiado = (campo: string, valor: string) => {
        const idFiscalNuevo = {
            ...idFiscal,
            [campo]: valor,
        };
        setIdFiscal(idFiscalNuevo);
    }


    const guardarIdFiscalClicked = async() => {
        onIdFiscalCambiadoCallback(idFiscal)
    }
    

    return (
        <>
            <QInput2
                controlado
                label="Tipo"
                nombre="tipo_id_fiscal"
                valor={idFiscal.tipo_id_fiscal}
                onChange={(v: string) => onIdFiscalCambiado('tipo_id_fiscal', v)}
                valido={tipoIdFiscalValido}
            />
            <QInput2
                controlado
                label="ID"
                nombre="id_fiscal"
                valor={idFiscal.id_fiscal}
                onChange={(v: string) => onIdFiscalCambiado('id_fiscal', v)}
                valido={idFiscalValido(idFiscal.tipo_id_fiscal)}
            />

            <QBoton
                deshabilitado={!idFiscalValidoGeneral(idFiscal.tipo_id_fiscal, idFiscal.id_fiscal)}
                onClick={guardarIdFiscalClicked}
            >
                Guardar
            </QBoton>
            <QBoton
                variante="borde"
                onClick={canceladoCallback}
            >
                Cancelar
            </QBoton>
        </>
    );
};