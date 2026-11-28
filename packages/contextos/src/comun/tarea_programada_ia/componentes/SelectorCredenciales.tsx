import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { criteriaDefecto } from "@olula/lib/dominio.ts";
import { useEffect, useState } from "react";
import { CredencialExterna } from "../../credencial_externa/diseño.js";
import { getCredencialesExterna } from "../../credencial_externa/infraestructura.js";
import "./SelectorCredenciales.css";
import { useTComun } from "../../i18n/index.ts";

interface SelectorCredencialesProps {
    valor: string[];
    onChange: (valor: string[]) => void;
}

/**
 * Selector múltiple de las credenciales (ver comun/credencial_externa) que esta
 * tarea puede usar — necesario para desambiguar cuando hay más de una credencial
 * del mismo proveedor (dos cuentas de Telegram, dos buzones de correo...). Solo
 * lista credenciales activas; el backend ya filtra a las de la empresa más las
 * personales del usuario actual (ver credencial_externa/dominio.ts).
 */
export const SelectorCredenciales = ({ valor, onChange }: SelectorCredencialesProps) => {
    const t = useTComun();
    const [credenciales, setCredenciales] = useState<CredencialExterna[]>([]);

    useEffect(() => {
        getCredencialesExterna(criteriaDefecto).then((respuesta) => {
            setCredenciales(respuesta.datos.filter((credencial) => credencial.activo));
        });
    }, []);

    const alternar = (id: string) => (marcado: string) => {
        onChange(marcado === "true" ? [...valor, id] : valor.filter((v) => v !== id));
    };

    return (
        <div className="SelectorCredenciales">
            <span className="SelectorCredenciales-etiqueta">{t("tareaProgramadaIa.credencialesPermitidas")}</span>
            {credenciales.length === 0 && (
                <p className="SelectorCredenciales-vacio">{t("tareaProgramadaIa.noHayCredencialesExternasDadasDe")}</p>
            )}
            {credenciales.map((credencial) => (
                <QInput
                    key={credencial.id}
                    label={`${credencial.nombre} (${credencial.proveedor})`}
                    tipo="checkbox"
                    nombre={`credencial_${credencial.id}`}
                    valor={valor.includes(credencial.id) ? "true" : "false"}
                    onChange={alternar(credencial.id)}
                />
            ))}
        </div>
    );
};
