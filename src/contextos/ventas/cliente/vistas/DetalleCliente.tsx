import { useState } from "react";
import { useParams } from "react-router";
import { Detalle } from "../../../../componentes/detalle/Detalle.tsx";
import { Input } from "../../../../componentes/detalle/FormularioGenerico.tsx";
import { Tab, Tabs } from "../../../../componentes/detalle/tabs/Tabs.tsx";
import { Entidad } from "../../../comun/diseño.ts";
import { Cliente, IdFiscal as TipoIdFiscal } from "../diseño.ts";
import { clienteVacio, guardar } from "../dominio.ts";
import { camposCliente, getCliente } from "../infraestructura.ts";
import { IdFiscal } from "./IdFiscal.tsx";
import { TabDirecciones } from "./TabDirecciones.tsx";

export const DetalleCliente = (
  {
    clienteInicial=null,
    onEntidadActualizada=()=>{},
  }: {
    clienteInicial?: Cliente | null;
    onEntidadActualizada?: (entidad: Cliente) => void;
  }
) => {
  const params = useParams();

  const [guardando, setGuardando] = useState(false);

  const clienteId = clienteInicial?.id ?? params.id;

  const sufijoTitulo = guardando ? " (Guardando...)" : "";
  const titulo = (cliente: Entidad) => `${cliente.nombre} ${sufijoTitulo}` as string;

  const [cliente, setCliente] = useState<Cliente>(clienteVacio());

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
  }

  const onCampoCambiado = async (campo: string, valor: string) => {
    if (!clienteId) {
      return;
    }
    setGuardando(true);
    await guardar(clienteId,{
      [campo]: valor
    })
    setGuardando(false);
    const nuevoCliente: Cliente = { ...cliente, [campo]: valor };
    setCliente(nuevoCliente);
    onEntidadActualizada(nuevoCliente);
  };

  return (

     <Detalle
       id={clienteId}
       obtenerTitulo={titulo}
       setEntidad={(c) => setCliente(c as Cliente)}
       entidad={cliente}
       cargar={getCliente}
     >
     <Input
        campo={camposCliente.nombre}
        onCampoCambiado={onCampoCambiado}
        valorEntidad={cliente?.nombre ?? ''}
      />
      <IdFiscal
        cliente={cliente}
        onIdFiscalCambiadoCallback={onIdFiscalCambiadoCallback}
      />
      <Input
        campo={camposCliente.agente_id}
        onCampoCambiado={onCampoCambiado}
        valorEntidad={cliente?.agente_id ?? ''}
      />

      {!!clienteId && (
        <Tabs
          children={[
            <Tab
              key="tab-1"
              label="Comercial"
              children={<div> Comercial contenido </div>}
            />,
            <Tab
              key="tab-2"
              label="Direcciones"
              children={
                <TabDirecciones clienteId={clienteId} />
              }
            />,
            <Tab
              key="tab-3"
              label="Cuentas Bancarias"
              children={<div> Cuentas Bancarias Master contenido </div>}
            />,
            <Tab
              key="tab-4"
              label="Agenda"
              children={<div> Agenda contenido </div>}
            />,
            <Tab
              key="tab-5"
              label="Descuentos"
              children={<div> Descuentos contenido</div>}
            />,
            <Tab
              key="tab-6"
              label="Documentos"
              children={<div> Documentos contenido</div>}
            />,
            <Tab
              key="tab-7"
              label="Contabilidad"
              children={<div> Contabilidad contenido</div>}
            />,
            <Tab
              key="tab-8"
              label="Factura-e"
              children={<div> Factura-e contenido</div>}
            />,
          ]}
        ></Tabs>
      )}
    </Detalle>
  );
};
