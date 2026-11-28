import { Cliente } from "#/crm/comun/componentes/cliente_con_nombre.tsx";
import { EstadoAccion } from "#/crm/comun/componentes/estado_accion.tsx";
import { OportunidadVenta } from "#/crm/comun/componentes/oportunidad_venta.tsx";
import { TipoAccion } from "#/crm/comun/componentes/tipo_accion.tsx";
import { ContactoSelector } from "#/ventas/comun/componentes/contacto.tsx";
import { QAvatar } from "@olula/componentes/atomos/qavatar.tsx";
import { QIcono } from "@olula/componentes/atomos/qicono.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QTarjetaGenerica } from "@olula/componentes/moleculas/qtarjeta_generica.tsx";
import { HookModelo } from "@olula/lib/useModelo.ts";
import { Accion } from "../../diseño.ts";
import { tCrm } from "../../../i18n/index.ts";

const limpiarTelefono = (telefono: string) => telefono.replace(/[^+\d]/g, "");
const telefonoWhatsapp = (telefono: string) => telefono.replace(/\D/g, "");

const AccionesRapidas = ({
  telefono,
  email,
}: {
  telefono?: string | null;
  email?: string | null;
}) => {
  const telefonoLimpio = limpiarTelefono(telefono ?? "");
  const telefonoWa = telefonoWhatsapp(telefono ?? "");

  if (!telefonoLimpio && !telefonoWa && !email) return null;

  return (
    <div className="contacto-acciones">
      {telefonoLimpio && (
        <a href={`tel:${telefonoLimpio}`} title={tCrm("accion.llamar")} aria-label={tCrm("accion.llamar")}>
          <QIcono nombre="telefono" tamaño="sm" />
        </a>
      )}
      {telefonoWa && (
        <a
          href={`https://wa.me/${telefonoWa}`}
          target="_blank"
          rel="noreferrer"
          title={tCrm("accion.whatsapp")}
          aria-label={tCrm("accion.whatsapp")}
        >
          <QIcono nombre="whatsapp" tamaño="sm" />
        </a>
      )}
      {email && (
        <a href={`mailto:${email}`} title={tCrm("accion.email")} aria-label={tCrm("accion.email")}>
          <QIcono nombre="correo" tamaño="sm" />
        </a>
      )}
    </div>
  );
};

const TarjetaContacto = ({
  nombre,
  cargo,
  email,
  telefono,
}: {
  nombre: string;
  cargo?: string | null;
  email?: string | null;
  telefono?: string | null;
}) => (
  <div className="contacto-tarjeta">
    <QTarjetaGenerica
      avatar={<QAvatar nombre={nombre} tamaño="sm" />}
      arribaIzquierda={nombre}
      arribaDerecha={cargo}
      abajoIzquierda={[telefono, email].filter(Boolean).join(" · ")}
      abajoDerecha={<AccionesRapidas telefono={telefono} email={email} />}
    />
  </div>
);

export const TabDatos = ({ accion }: { accion: HookModelo<Accion> }) => {
  const { uiProps, modelo } = accion;
  const cliente = modelo.cliente;
  const contactosCliente = cliente?.contactos ?? [];
  const esTarjeta = !modelo.cliente_id && Boolean(modelo.tarjeta_id);

  const tieneOportunidad = Boolean(modelo.oportunidad_id);

  return (
    <div className="TabDatos">
      <quimera-formulario>
        <QInput label={tCrm("accion.tarea")} {...uiProps("descripcion")} />
        <QInput label={tCrm("accion.fecha")} {...uiProps("fecha")} />
        <EstadoAccion {...uiProps("estado")} />
        <TipoAccion {...uiProps("tipo")} />
      </quimera-formulario>

      <quimera-formulario>
        <ContactoSelector {...uiProps("contacto_id", "nombre_contacto")} />
        {tieneOportunidad ? (
          <OportunidadVenta
            valor={modelo.oportunidad_id}
            descripcion={modelo.descripcion_oportunidad ?? ""}
            deshabilitado
          />
        ) : (
          <Cliente
            valor={modelo.cliente_id}
            descripcion={modelo.nombre_cliente ?? ""}
            deshabilitado
          />
        )}
      </quimera-formulario>

      {cliente ? (
        <div className="cliente-resumen">
          <TarjetaContacto
            nombre={cliente.nombre}
            email={cliente.email}
            telefono={cliente.telefono}
          />

          <h4>{tCrm("accion.contactos")}</h4>
          {contactosCliente.length === 0 && (
            <p className="contactos-vacio">
              {esTarjeta
                ? tCrm("accion.estaTarjetaNoTieneContactos")
                : tCrm("accion.esteClienteNoTieneContactos")}
            </p>
          )}

          {contactosCliente.map((contacto, index) => (
            <TarjetaContacto
              key={`${contacto.nombre}-${contacto.email ?? ""}-${index}`}
              nombre={contacto.nombre}
              cargo={contacto.cargo}
              email={contacto.email}
              telefono={contacto.telefono}
            />
          ))}
        </div>
      ) : (
        <p className="contactos-vacio">{tCrm("accion.sinClienteVinculadoEnEstaAccion")}</p>
      )}
    </div>
  );
};
