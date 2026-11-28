import "./_forminput.css";
import { Etiqueta, FormFieldProps, Validacion } from "./_forminput.tsx";
import { QBoton } from "./qboton.tsx";
import { QDate } from "./qdate.tsx";
import { tComponentes } from "../i18n/textos.ts";

export type QMonthYearProps = Omit<FormFieldProps, "label"> & {
  label?: string;
};

export const QMonthYear = ({
  label,
  nombre,
  deshabilitado,
  textoValidacion = "",
  erroneo,
  advertido,
  valido,
  opcional,
  condensado,
  valor,
  onChange,
}: QMonthYearProps) => {
  const manual = Array.isArray(valor);

  const manejarChangeManual = () => {
    onChange?.(
      [undefined, undefined] as unknown as string,
      undefined as unknown as React.ChangeEvent<HTMLInputElement>
    );
  };

  if (manual) {
    const [desde, hasta] = valor as unknown as [string, string];

    const manejarChangeFecha = (
      v: string,
      e: React.ChangeEvent<HTMLInputElement>
    ) => {
      const clave = e.target.name.split("__")[1];

      const nuevoValor = [
        clave === "desde" ? v : desde,
        clave === "hasta" ? v : hasta,
      ] as [string, string];

      onChange?.(nuevoValor as unknown as string, e);
    };

    return (
      <div className="interval">
        <QDate
          label={label + " desde"}
          nombre={nombre + "__desde"}
          valor={desde}
          onChange={manejarChangeFecha}
        />
        <QDate
          label={label + " hasta"}
          nombre={nombre + "__hasta"}
          valor={hasta}
          onChange={manejarChangeFecha}
        />
      </div>
    );
  }

  const attrs = {
    nombre,
    erroneo,
    advertido,
    valido,
    opcional,
    condensado,
    deshabilitado,
  };

  const manejarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value, e);
  };

  return (
    <>
      <quimera-date {...attrs}>
        <label>
          {label && <Etiqueta label={label} />}
          <input
            type="month"
            name={nombre}
            disabled={deshabilitado}
            required={!opcional}
            value={valor ?? ""}
            onChange={manejarChange}
          />
          <Validacion textoValidacion={textoValidacion} />
        </label>
      </quimera-date>
      <QBoton onClick={manejarChangeManual}>{tComponentes("ui.atomos.manual")}</QBoton>
    </>
  );
};
