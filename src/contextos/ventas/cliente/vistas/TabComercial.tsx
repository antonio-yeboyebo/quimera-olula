import { useState } from "react";
import { QBoton } from "../../../../componentes/atomos/qboton.tsx";
import { QInput } from "../../../../componentes/atomos/qinput.tsx";
import { Accion, entidadModificada, EstadoEntidad, puedoGuardarEntidad } from "../../../comun/dominio.ts";
import { Cliente } from "../diseño.ts";
import { getCliente, patchCliente } from "../infraestructura.ts";
import "./DetalleCliente.css";



export const TabComercial = ({
  getProps,
  setCampo,
  cliente,
  dispatch,
  onEntidadActualizada,
}: {
    getProps: (campo: string) => any;
    setCampo: (campo: string) => any;
    cliente: EstadoEntidad<Cliente>;
    dispatch: (action: Accion<Cliente>) => void;
    onEntidadActualizada: (entidad: Cliente) => void;
}) => {

  const [_, setGuardando] = useState(false);

  const onGuardarClicked = async() => {
    setGuardando(true);
    await patchCliente(cliente.valor.id, cliente.valor);
    const cliente_guardado = await getCliente(cliente.valor.id);
    dispatch({ type: "init", payload: {entidad: cliente_guardado }});
    setGuardando(false);
    onEntidadActualizada(cliente.valor);
  };

  return (
      <div className="container">
        <div style={{ gridColumn: 'span 12' }}>
          <QInput
            label="Nombre"
            onChange={setCampo("nombre")}
            {...getProps("nombre")}
          />
        </div>
        <div style={{ gridColumn: 'span 12' }}>
          <QInput
            label="Nombre Comercial"
            onChange={setCampo("nombre_comercial")}
            {...getProps("nombre_comercial")}
            />
        </div>
        <div style={{ gridColumn: 'span 1' }}>
          <QInput
            label="Tipo Id Fiscal"
            onChange={setCampo("tipo_id_fiscal")}
            {...getProps("tipo_id_fiscal")}
          />
        </div>
        <div style={{ gridColumn: 'span 2' }}>
          <QInput
            label="Id Fiscal"
            onChange={setCampo("id_fiscal")}
            {...getProps("id_fiscal")}
          />
        </div>
        <div style={{ gridColumn: 'span 8' }}>
        </div>
        <div style={{ gridColumn: 'span 2' }}>
          <QInput
            label="Agente"
            onChange={setCampo("agente_id")}
            {...getProps("agente_id")}
          />
        </div>
        <div style={{ gridColumn: 'span 10' }}>
          <QInput
            label="Nombre"
            {...getProps("nombre_agente")}
          />
        </div>
        <div style={{ gridColumn: 'span 1' }}>
          <QInput
            label="Divisa"
            onChange={setCampo("divisa_id")}
            {...getProps("divisa_id")}
          />
        </div>
        <div style={{ gridColumn: 'span 11' }}>
        </div>
        <div style={{ gridColumn: 'span 12' }}>
          <div className='botones'>
            <QBoton
              onClick={onGuardarClicked}
              deshabilitado={!puedoGuardarEntidad(cliente)} 
            >
            Guardar
            </QBoton>
            <QBoton tipo="reset" variante="texto"
              onClick={() => {
                dispatch({ type: "init", payload: {entidad: cliente.valor_inicial }});
              }}
              deshabilitado={!entidadModificada(cliente)} 
            >
              Cancelar
            </QBoton>
          </div>
        </div>

      </div>

  );
};
