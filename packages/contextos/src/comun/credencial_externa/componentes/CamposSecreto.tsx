import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { CuentaBancariaSelect } from "#/tesoreria/comun/componentes/cuenta_bancaria_select.tsx";
import { SecretoCredencialExterna, TipoAuthCredencialExterna } from "../diseño.js";
import { buscarProveedorConocido } from "../dominio.js";

interface CamposSecretoProps {
    proveedor: string;
    tipoAuth: TipoAuthCredencialExterna;
    valor: SecretoCredencialExterna;
    onChange: (valor: SecretoCredencialExterna) => void;
}

/**
 * Campos del secreto en claro. Si `proveedor` es uno conocido (ver
 * PROVEEDORES_CONOCIDOS en dominio.ts) se renderiza su forma específica;
 * si no, se cae en el formulario genérico según `tipoAuth` (caso "Otro").
 * Se gestionan como estado local simple (no vía useModelo/MetaModelo) porque
 * son un dict de forma variable, no un conjunto fijo de campos del dominio —
 * el secreto nunca se guarda tal cual, se cifra en el backend antes de
 * persistir.
 */
export const CamposSecreto = ({ proveedor, tipoAuth, valor, onChange }: CamposSecretoProps) => {
    const set = (clave: string) => (v: string) => onChange({ ...valor, [clave]: v });

    const proveedorConocido = buscarProveedorConocido(proveedor);
    if (proveedorConocido) {
        return (
            <>
                {proveedorConocido.campos.map((campo) => campo.tipo === "cuenta_bancaria" ? (
                    <CuentaBancariaSelect
                        key={campo.clave}
                        label={campo.etiqueta}
                        nombre={campo.clave}
                        valor={valor[campo.clave] ?? ""}
                        onChange={(opcion) => set(campo.clave)(opcion?.valor ?? "")}
                    />
                ) : campo.opciones ? (
                    <QSelect
                        key={campo.clave}
                        label={campo.etiqueta}
                        nombre={campo.clave}
                        opciones={campo.opciones}
                        valor={valor[campo.clave] ?? ""}
                        onChange={(opcion) => set(campo.clave)(opcion?.valor ?? "")}
                    />
                ) : (
                    <QInput
                        key={campo.clave}
                        label={campo.etiqueta}
                        tipo={campo.contraseña ? "contraseña" : undefined}
                        nombre={campo.clave}
                        valor={valor[campo.clave] ?? ""}
                        onChange={set(campo.clave)}
                    />
                ))}
            </>
        );
    }

    switch (tipoAuth) {
        case "api_key":
            return (
                <QInput
                    label="API key"
                    tipo="contraseña"
                    nombre="api_key"
                    valor={valor.api_key ?? ""}
                    onChange={set("api_key")}
                />
            );
        case "bearer":
            return (
                <QInput
                    label="Token"
                    tipo="contraseña"
                    nombre="token"
                    valor={valor.token ?? ""}
                    onChange={set("token")}
                />
            );
        case "basic":
            return (
                <>
                    <QInput
                        label="Usuario"
                        nombre="usuario"
                        valor={valor.usuario ?? ""}
                        onChange={set("usuario")}
                    />
                    <QInput
                        label="Contraseña"
                        tipo="contraseña"
                        nombre="password"
                        valor={valor.password ?? ""}
                        onChange={set("password")}
                    />
                </>
            );
        case "oauth2":
            return (
                <>
                    <QInput
                        label="Client ID"
                        nombre="client_id"
                        valor={valor.client_id ?? ""}
                        onChange={set("client_id")}
                    />
                    <QInput
                        label="Client secret"
                        tipo="contraseña"
                        nombre="client_secret"
                        valor={valor.client_secret ?? ""}
                        onChange={set("client_secret")}
                    />
                </>
            );
    }
};
