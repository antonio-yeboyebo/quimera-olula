import { useState } from "react";
import { useParams } from "react-router";
import estilos from "../../../../componentes/detalle/detalle.module.css";
import { Detalle } from "../../../../componentes/detalle/Detalle.tsx";
import {
  Input,
  InputSelect,
} from "../../../../componentes/detalle/FormularioGenerico.tsx";
import { Tab, Tabs } from "../../../../componentes/detalle/tabs/Tabs.tsx";
import { Entidad } from "../../../comun/diseño.ts";
import { Presupuesto } from "../diseño.ts";
import { presupuestoVacio } from "../dominio.ts";
import {
  camposPresupuesto,
  getPresupuesto,
  patchCambiarAgente,
  patchCambiarDivisa,
} from "../infraestructura.ts";
import { Cliente } from "./Cliente.tsx";
import { Lineas } from "./Lineas.tsx";

export const DetallePresupuesto = ({
  presupuestoInicial = null,
  onEntidadActualizada: onEntidadActualizada = () => {},
}: {
  presupuestoInicial?: Presupuesto | null;
  onEntidadActualizada?: (entidad: Presupuesto) => void;
}) => {
  const { detalle } = estilos;


  const params = useParams();

  const [guardando, setGuardando] = useState(false);

  const presupuestoId = presupuestoInicial?.id ?? params.id;

  const sufijoTitulo = guardando ? " (Guardando...)" : "";
  const titulo = (presupuesto: Entidad) =>
    `${presupuesto.codigo} ${sufijoTitulo}` as string;

  const [presupuesto, setPresupuesto] = useState<Presupuesto>(
    presupuestoVacio()
  );

  const onCampoCambiado = async (campo: string, valor: string) => {
    setGuardando(true);

    if (presupuestoId) {
      // await guardar(presupuestoId, {
      //   [campo]: valor,
      // });
    }
    setGuardando(false);
    const nuevoPresupuesto: Presupuesto = { ...presupuesto, [campo]: valor };
    setPresupuesto(nuevoPresupuesto);
    onEntidadActualizada(nuevoPresupuesto);
  };

  const onAgenteIdCambiado = async (_: string, valor: string) => {
    setGuardando(true);
    if (!presupuestoId) {
      return;
    }
    await patchCambiarAgente(presupuestoId, valor);
    const nuevoPresupuesto = await getPresupuesto(presupuestoId);
    setGuardando(false);
    setPresupuesto(nuevoPresupuesto);
    onEntidadActualizada(nuevoPresupuesto);
  };

  const onDivisaIdCambiado = async (_: string, valor: string) => {
    setGuardando(true);
    if (!presupuestoId) {
      return;
    }
    await patchCambiarDivisa(presupuestoId, valor);
    const nuevoPresupuesto = await getPresupuesto(presupuestoId);
    setGuardando(false);
    setPresupuesto(nuevoPresupuesto);
    onEntidadActualizada(nuevoPresupuesto);
  };

  // const onClienteCambiadoCallback = async (_: TipoCliente) => {
  //   const nuevoPresupuesto = await getPresupuesto(presupuesto.id);
  //   setPresupuesto(nuevoPresupuesto);
  //   onEntidadActualizada(nuevoPresupuesto);
  // };

  const recargarCabecera = async () => {
    const nuevoPresupuesto = await getPresupuesto(presupuesto.id);
    setPresupuesto(nuevoPresupuesto);
    onEntidadActualizada(nuevoPresupuesto);
  };

  return (
    <div className={detalle}>
      <Detalle
        id={presupuestoId}
        obtenerTitulo={titulo}
        setEntidad={(p) => setPresupuesto(p as Presupuesto)}
        entidad={presupuesto}
        cargar={getPresupuesto}
      >
        <Tabs
          children={[
            <Tab
              key="tab-1"
              label="Cliente"
              children={
                <>
                  <Cliente
                    presupuesto={presupuesto}
                    onClienteCambiadoCallback={recargarCabecera}
                  />
                  <Input
                    campo={camposPresupuesto.nombre_cliente}
                    onCampoCambiado={onCampoCambiado}
                    valorEntidad={presupuesto.nombre_cliente}
                  />
                  <Input
                    campo={camposPresupuesto.id_fiscal}
                    onCampoCambiado={onCampoCambiado}
                    valorEntidad={presupuesto.id_fiscal}
                  />
                </>
              }
            />,
            <Tab
              key="tab-2"
              label="Datos"
              children={
                <>
                  <InputSelect
                    campo={camposPresupuesto.divisa_id}
                    onCampoCambiado={onDivisaIdCambiado}
                    valorEntidad={presupuesto.divisa_id}
                  />
                  <Input
                    campo={camposPresupuesto.agente_id}
                    onCampoCambiado={onAgenteIdCambiado}
                    valorEntidad={presupuesto.agente_id}
                  />
                  <label>{presupuesto.nombre_agente}</label>
                </>
              }
            />,
            <Tab
              key="tab-3"
              label="Observaciones"
              children={<div> Observaciones contenido </div>}
            />,
          ]}
        ></Tabs>
        <div
          style={{
            marginTop: "1rem",
            padding: "1rem",
            border: "1px solid #ccc",
            borderRadius: "8px",
            backgroundColor: "#f9f9f9",
            marginBottom: "1rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
          }}
        >
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <label style={{ fontWeight: "bold", marginRight: "0.5rem" }}>
              Neto:
            </label>
            <span>
              {new Intl.NumberFormat("es-ES", {
                style: "currency",
                currency: "EUR",
              }).format(Number(presupuesto?.neto ?? 0))}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <label style={{ fontWeight: "bold", marginRight: "0.5rem" }}>
              Total IVA:
            </label>
            <span>
              {new Intl.NumberFormat("es-ES", {
                style: "currency",
                currency: "EUR",
              }).format(Number(presupuesto?.total_iva ?? 0))}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <label style={{ fontWeight: "bold", marginRight: "0.5rem" }}>
              Total:
            </label>
            <span>
              {new Intl.NumberFormat("es-ES", {
                style: "currency",
                currency: (presupuesto?.coddivisa as string) ?? "EUR",
              }).format(Number(presupuesto?.total ?? 0))}
            </span>
          </div>
        </div>
        <Lineas
          presupuestoId={presupuesto.id}
          onCabeceraModificada={recargarCabecera}
        />
      </Detalle>
    </div>
  );
};
