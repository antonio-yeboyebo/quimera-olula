import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { AUTH_STORAGE_CHANGED_EVENT } from "@olula/lib/api/auth_storage_events.ts";
import { useEffect, useRef, useState } from "react";
import { whoAmIStorage } from "../../auth/login/infraestructura.ts";
import { empresaActual } from "../../valores/empresaActual.ts";
import { tComun, useTComun } from "../i18n/index.ts";

type ItemEmpresa = { id: string; nombre: string };

type DatosEmpresa = {
    empresas: ItemEmpresa[];
    idActual: string;
};

const leerDatosEmpresa = (): DatosEmpresa => {
    const raw = whoAmIStorage.obtener();
    if (!raw) return { empresas: [], idActual: "" };
    try {
        const whoAmI = JSON.parse(raw) as { empresas?: ItemEmpresa[] };
        return {
            empresas: whoAmI.empresas ?? [],
            idActual: empresaActual(),
        };
    } catch {
        return { empresas: [], idActual: "" };
    }
};

interface EmpresaActualProps {
    nombre?: string;
    label?: string;
    onChange?: (valor: string) => void;
}

/**
 * Campo de solo lectura que refleja la empresa activa del usuario.
 *
 * - 1 empresa en whoami: asigna empresa_id al modelo, no renderiza nada.
 * - Varias empresas: asigna empresa_id al modelo y muestra QInput soloLectura.
 * - Sin empresa disponible: muestra error y no asigna valor.
 */
export const EmpresaActual = ({
    nombre = "empresa_id",
    label = tComun("componentes.empresa"),
    onChange,
}: EmpresaActualProps) => {
    const t = useTComun();
    const [datos, setDatos] = useState<DatosEmpresa>(leerDatosEmpresa);

    useEffect(() => {
        const actualizar = () => setDatos(leerDatosEmpresa());
        window.addEventListener(AUTH_STORAGE_CHANGED_EVENT, actualizar);
        return () => window.removeEventListener(AUTH_STORAGE_CHANGED_EVENT, actualizar);
    }, []);

    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;

    useEffect(() => {
        if (datos.idActual) {
            onChangeRef.current?.(datos.idActual);
        }
    }, [datos.idActual]);

    const { empresas, idActual } = datos;

    if (!idActual || empresas.length === 0) {
        return (
            <span style={{ color: "var(--color-error)", display: "block", whiteSpace: "nowrap" }}>
                {t("componentes.sinEmpresaActiva")}
            </span>
        );
    }

    if (empresas.length === 1) {
        return null;
    }

    const nombreEmpresa = empresas.find((e) => e.id === idActual)?.nombre ?? "";

    return (
        <QInput
            label={label}
            nombre={nombre}
            valor={nombreEmpresa}
            soloLectura
        />
    );
};
