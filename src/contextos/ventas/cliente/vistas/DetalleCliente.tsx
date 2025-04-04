import { useState } from "react";
import { useParams } from "react-router";
import { QBoton } from "../../../../componentes/atomos/qboton.tsx";
import { QInput } from "../../../../componentes/atomos/qinput.tsx";
import { Detalle } from "../../../../componentes/detalle/Detalle.tsx";
import { Input } from "../../../../componentes/detalle/FormularioGenerico.tsx";
import { Tab, Tabs } from "../../../../componentes/detalle/tabs/Tabs.tsx";
import { Entidad } from "../../../comun/diseño.ts";
import { Cliente, IdFiscal as TipoIdFiscal } from "../diseño.ts";
import { clienteVacio, guardar, idFiscalValido, tipoIdFiscalValido } from "../dominio.ts";
import { camposCliente, getCliente } from "../infraestructura.ts";
import "./DetalleCliente.css";
import { IdFiscal } from "./IdFiscal.tsx";
import { TabDirecciones } from "./TabDirecciones.tsx";

type Validacion = Record<
  string,{
    valido: boolean;
    advertido: boolean;
    erroneo: boolean;
    textoValidacion: string;
  }
>;


const validar = (validacion: Validacion, cliente: Cliente, campo: string): Validacion => {
  switch (campo) {
    case "nombre": {
      const vacio = cliente.nombre.length == 0;
      const valido = !vacio
      const datos = {
        valido: valido,
        advertido: false,
        erroneo: !valido,
        textoValidacion: vacio ? "El nombre no puede estar vacío" : "",
      }
      return {
        ...validacion,
        [campo]: datos,
      };
      break
    }
    case "tipo_id_fiscal": {
      const tipoIdFiscalEsValido = tipoIdFiscalValido(cliente.tipo_id_fiscal)
      const idFiscalEsValido = !tipoIdFiscalEsValido || idFiscalValido(cliente.tipo_id_fiscal)(cliente.id_fiscal)
      const validacionTipoIdFiscal = {
        valido: tipoIdFiscalEsValido,
        advertido: false,
        erroneo: !tipoIdFiscalEsValido,
        textoValidacion: !tipoIdFiscalEsValido ? "El tipo de ID Fiscal no es válido" : "",
      }
      const validacionIdFiscal = {
        valido: idFiscalEsValido,
        advertido: false,
        erroneo: !idFiscalEsValido,
        textoValidacion: !idFiscalEsValido ? "El ID Fiscal no es válido para el tipo indicado" : "",
      }
      return {
        ...validacion,
        tipo_id_fiscal: validacionTipoIdFiscal,
        id_fiscal: validacionIdFiscal,
      };
      break
    }
  }
    return validacion
}

export const DetalleCliente = ({
  clienteInicial = null,
  onEntidadActualizada = () => {},
  cancelarSeleccionada,
}: {
  clienteInicial?: Cliente | null;
  onEntidadActualizada?: (entidad: Cliente) => void;
  cancelarSeleccionada?: () => void;
}) => {
  const params = useParams();

  const [guardando, setGuardando] = useState(false);

  const clienteId = clienteInicial?.id ?? params.id;

  const sufijoTitulo = guardando ? " (Guardando...)" : "";
  const titulo = (cliente: Entidad) =>
    `${cliente.nombre} ${sufijoTitulo}` as string;

  const [cliente, setCliente] = useState<Cliente>(clienteVacio());
  const [validacion, setValidacion] = useState<Validacion>({
    nombre: {
      valido: true,
      advertido: false,
      erroneo: false,
      textoValidacion: "",
    },
    
  });

  const onIdFiscalCambiadoCallback = async(idFiscal: TipoIdFiscal) => {
    setGuardando(true);
    await guardar(cliente.id, {
        id_fiscal: idFiscal.id_fiscal,
        tipo_id_fiscal: idFiscal.tipo_id_fiscal
    });
    const nuevoCliente = { ...cliente, ...idFiscal };
    setCliente(nuevoCliente);
    setGuardando(false);
    onEntidadActualizada(nuevoCliente);
  };

  const onCampoCambiado = async (campo: string, valor: string) => {
    const nuevoCliente = { ...cliente, [campo]: valor };
    setCliente(nuevoCliente);
    setValidacion(validar(validacion, nuevoCliente, campo))
    // if (!clienteId) {
    //   return;
    // }
    // setGuardando(true);
    // const nuevoCliente: Cliente = { ...cliente, [campo]: valor };
    // await patchCliente(clienteId, nuevoCliente);
    // setGuardando(false);
    // setCliente(nuevoCliente);
    // onEntidadActualizada(nuevoCliente);
  };

  return (
    <Detalle
      id={clienteId}
      obtenerTitulo={titulo}
      setEntidad={(c) => setCliente(c as Cliente)}
      entidad={cliente}
      cargar={getCliente}
      className="detalle-cliente"
      cerrarDetalle={cancelarSeleccionada}
    >
      {/* <h2 className="detalle-cliente-titulo">{titulo(cliente)}</h2> */}
      <div className="container">
        <div style={{ gridColumn: 'span 12' }}>
          <QInput
            label="Nombre"
            nombre="nombre"
            valor={cliente.nombre}
            onChange={(v) => onCampoCambiado("nombre", v)}
            {...validacion.nombre}
          />
        </div>
        <div style={{ gridColumn: 'span 12' }}>
          <QInput
            label="Nombre Comercial"
            nombre="nombre comercial"
            valor={cliente.nombre_comercial ?? ""}
          />
        </div>
        <div style={{ gridColumn: 'span 1' }}>
          <QInput
            label="Tipo Id Fiscal"
            nombre="tipo_id_fiscal"
            valor={cliente.tipo_id_fiscal}
            onChange={(v) => onCampoCambiado("tipo_id_fiscal", v)}
            {...validacion.tipo_id_fiscal}
          />
        </div>
        <div style={{ gridColumn: 'span 2' }}>
          <QInput
            label="Id Fiscal"
            nombre="id_fiscal"
            valor={cliente.id_fiscal}
            onChange={(v) => onCampoCambiado("id_fiscal", v)}
            {...validacion.id_fiscal}
          />
        </div>
        <div style={{ gridColumn: 'span 8' }}>
        </div>
        <div style={{ gridColumn: 'span 2' }}>
          <QInput
            label="Agente"
            nombre="agente_id"
            valor={cliente.agente_id ?? ""}
          />
        </div>
        <div style={{ gridColumn: 'span 10' }}>
          <QInput
            label="Nombre"
            nombre="nombre_agente"
            valor={cliente.nombre_agente ?? ""}
          />
        </div>
        <div style={{ gridColumn: 'span 1' }}>
          <QInput
            label="Divisa"
            nombre="divisa"
            valor={cliente.divisa_id ?? ""}
          />
        </div>
        <div style={{ gridColumn: 'span 11' }}>
        </div>
        <div style={{ gridColumn: 'span 12' }}>
          <div className='botones'>
            <QBoton
              tipo="submit"
              // deshabilitado={Object.values(estado).some((v) => v.length > 0)}
            >
            Guardar
            </QBoton>
            <QBoton tipo="reset" variante="texto">
              Cancelar
            </QBoton>
          </div>
        </div>

      </div>
      <IdFiscal
        cliente={cliente}
        onIdFiscalCambiadoCallback={onIdFiscalCambiadoCallback}
      />
      <Input
        campo={camposCliente.agente_id}
        onCampoCambiado={onCampoCambiado}
        valorEntidad={cliente?.agente_id ?? ""}
      />

      {!!clienteId && (
        <Tabs
          className="detalle-cliente-tabs"
          children={[
            <Tab
              key="tab-1"
              label="Comercial"
              children={
                <div className="detalle-cliente-tab-contenido">
                  Comercial contenido
                </div>
              }
            />,
            <Tab
              key="tab-2"
              label="Direcciones"
              children={
                <div className="detalle-cliente-tab-contenido">
                  <TabDirecciones clienteId={clienteId} />
                </div>
              }
            />,
            <Tab
              key="tab-3"
              label="Cuentas Bancarias"
              children={
                <div className="detalle-cliente-tab-contenido">
                  Cuentas Bancarias Master contenido
                </div>
              }
            />,
            <Tab
              key="tab-4"
              label="Agenda"
              children={
                <div className="detalle-cliente-tab-contenido">
                  Agenda contenido
                </div>
              }
            />,
            <Tab
              key="tab-5"
              label="Descuentos"
              children={
                <div className="detalle-cliente-tab-contenido">
                  Descuentos contenido
                </div>
              }
            />,
            <Tab
              key="tab-6"
              label="Documentos"
              children={
                <div className="detalle-cliente-tab-contenido">
                  Documentos contenido
                </div>
              }
            />,
            <Tab
              key="tab-7"
              label="Contabilidad"
              children={
                <div className="detalle-cliente-tab-contenido">
                  Contabilidad contenido
                </div>
              }
            />,
            <Tab
              key="tab-8"
              label="Factura-e"
              children={
                <div className="detalle-cliente-tab-contenido">
                  Factura-e contenido
                </div>
              }
            />,
          ]}
        ></Tabs>
      )}
    </Detalle>
  );
};
