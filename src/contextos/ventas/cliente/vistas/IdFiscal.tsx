import { useEffect, useState } from "react";
import { idFiscalValido, tipoIdFiscalValido } from "../dominio.ts";

import { QBoton } from "../../../../componentes/atomos/qboton.tsx";
import { QForm } from "../../../../componentes/atomos/qform.tsx";
import { QInput } from "../../../../componentes/atomos/qinput.tsx";
import { QSelect } from "../../../../componentes/atomos/qselect.tsx";
import { Cliente } from "../diseño.ts";
import { camposCliente } from "../infraestructura.ts";
import "./IdFiscal.css";

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

  useEffect(() => {
    setModoLectura(true);
  }, [cliente]);

  return modoLectura ? (
    <IdFiscalLectura
      cliente={cliente}
      onEditarCallback={() => setModoLectura(false)}
    />
  ) : (
    <IdFiscalEdicion
      cliente={cliente}
      onIdFiscalCambiadoCallback={onIdFiscalCambiadoCallback}
      canceladoCallback={() => setModoLectura(true)}
    />
  );
};

const opcionesTipoIdFiscal = camposCliente.tipo_id_fiscal.opciones!.map(
  ([valor, descripcion]) => ({
    valor,
    descripcion,
  })
);

const IdFiscalLectura = ({
  cliente,
  onEditarCallback,
}: {
  cliente: Cliente;
  onEditarCallback: () => void;
}) => {
  return (
    <>
      <label>
        {cliente.tipo_id_fiscal}: {cliente.id_fiscal}
      </label>
      <button onClick={onEditarCallback}>Editar</button>
    </>
  );
};

const IdFiscalEdicion = ({
  cliente,
  onIdFiscalCambiadoCallback,
  canceladoCallback,
}: {
  cliente: Cliente;
  onIdFiscalCambiadoCallback: (idFiscal: IdFiscal) => void;
  canceladoCallback: () => void;
}) => {
  const [estado, setEstado] = useState({} as Record<string, string>);

  const validacion = (datos: Record<string, string>) => {
    return {
      tipo_id_fiscal: tipoIdFiscalValido(datos.tipo_id_fiscal)
        ? ""
        : "Tipo de ID fiscal no válido.",
      id_fiscal: idFiscalValido(datos.tipo_id_fiscal)(datos.id_fiscal)
        ? ""
        : "ID fiscal no válido.",
    };
  };

  const guardarIdFiscalClicked = async (datos: Record<string, string>) => {
    const nuevoEstado = validacion(datos);
    setEstado(nuevoEstado);

    if (Object.values(nuevoEstado).some((v) => v.length > 0)) return;

    // patchCliente(cliente.id, datos).then(() => {
    //   onIdFiscalCambiadoCallback({
    //     id_fiscal: datos.id_fiscal,
    //     tipo_id_fiscal: datos.tipo_id_fiscal,
    //   });
    // });
  };

  return (
    <QForm onSubmit={guardarIdFiscalClicked} onReset={canceladoCallback}>
      <div className="container">
        <div style={{ gridColumn: 'span 2' }}>
          <QSelect
            label="Tipo ID Fiscal"
            nombre="tipo_id_fiscal"
            condensado
            valor={cliente.tipo_id_fiscal}
            opciones={opcionesTipoIdFiscal}
            erroneo={!!estado.tipo_id_fiscal && estado.tipo_id_fiscal.length > 0}
            textoValidacion={estado.tipo_id_fiscal}
          />
          {/* <QInput
            label="Tipo Id Fiscal"
            nombre="id_fiscal"
            valor={cliente.id_fiscal}
            erroneo={!!estado.id_fiscal && estado.id_fiscal.length > 0}
            textoValidacion={estado.id_fiscal}
          /> */}
        </div>
        <div style={{ gridColumn: 'span 2' }}>
          <QInput
            label="CIF/NIF"
            nombre="id_fiscal"
            valor={cliente.id_fiscal}
            erroneo={!!estado.id_fiscal && estado.id_fiscal.length > 0}
            textoValidacion={estado.id_fiscal}
          />
        </div>
        {/* <div style={{ gridColumn: 'span 2' }}>
          <QInput
            label="CIF/NIF"
            nombre="id_fiscal"
            valor={cliente.id_fiscal}
            erroneo={!!estado.id_fiscal && estado.id_fiscal.length > 0}
            textoValidacion={estado.id_fiscal}
          />
        </div>
        <div style={{ gridColumn: 'span 2' }}>
          <QInput
            label="CIF/NIF"
            nombre="id_fiscal"
            valor={cliente.id_fiscal}
            erroneo={!!estado.id_fiscal && estado.id_fiscal.length > 0}
            textoValidacion={estado.id_fiscal}
          />
        </div>
        <div style={{ gridColumn: 'span 4' }}>1
        </div>
        <div style={{ gridColumn: 'span 12' }}>
          <QInput
            label="Nombre"
            nombre="nombre"
            valor={cliente.nombre}
          />
        </div>
        <div style={{ gridColumn: 'span 6' }}>
          <QInput
            label="Nombre"
            nombre="nombre"
            valor={cliente.nombre}
            deshabilitado={true}
          />
        </div>
        <div style={{ gridColumn: 'span 6' }}>
          <QInput
            label="Nombre"
            nombre="nombre"
            valor={cliente.nombre}
            valido
          />
        </div>
        <div style={{ gridColumn: 'span 12' }}>
          <QInput
            label="Nombre"
            nombre="nombre"
            valor={cliente.nombre}
            erroneo={true}
          />
        </div> */}
      </div>
        <div className='botones'>
          <QBoton
            tipo="submit"
            deshabilitado={Object.values(estado).some((v) => v.length > 0)}
          >
          Guardar
          </QBoton>
          <QBoton tipo="reset" variante="texto">
            Cancelar
          </QBoton>
      </div>
      {/* <div className="flex-container">
      <div style={{ flexGrow: 2 }}>

        
        <QSelect
          label="Tipo ID Fiscal"
          nombre="tipo_id_fiscal"
          condensado
          valor={cliente.tipo_id_fiscal}
          opciones={opcionesTipoIdFiscal}
          erroneo={!!estado.tipo_id_fiscal && estado.tipo_id_fiscal.length > 0}
          textoValidacion={estado.tipo_id_fiscal}
        />
        </div>
        <div style={{ flexGrow: 3 }}>
        <QInput
          label="CIF/NIF"
          nombre="id_fiscal"
          valor={cliente.id_fiscal}
          erroneo={!!estado.id_fiscal && estado.id_fiscal.length > 0}
          textoValidacion={estado.id_fiscal}
        />
      </div>
      </div>
      <div className="flex-container">
      <div style={{ flexGrow: 2 }}>
        <QInput
          label="Nombe"
          nombre="nombre"
          valor={cliente.nombre}
        />
      </div>
      <div style={{ flexGrow: 3 }}>
        <QBoton
          tipo="submit"
          deshabilitado={Object.values(estado).some((v) => v.length > 0)}
        >
          Guardar
        </QBoton>
        <QBoton tipo="reset" variante="texto">
          Cancelar
        </QBoton>
      </div>
      </div> */}
    </QForm>
  );
};
