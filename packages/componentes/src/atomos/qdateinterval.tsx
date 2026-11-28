import "./_forminput.css";
import { QBoton } from "./qboton.tsx";
import { QDate, QDateProps } from "./qdate.tsx";
import { Opcion } from "./qmulticheckbox.tsx";
import { QSelect } from "./qselect.tsx";
import { tComponentes } from "../i18n/textos.ts";

const opcionesIntervaloFechas: Opcion[][] = [
  [
    { valor: "grupo", get descripcion() { return tComponentes("ui.atomos.dias"); } },
    { valor: "@hoy", get descripcion() { return tComponentes("ui.atomos.hoy"); } },
    { valor: "@ayer", get descripcion() { return tComponentes("ui.atomos.ayer"); } },
    { valor: "@mañana", get descripcion() { return tComponentes("ui.atomos.manana"); } },
  ],
  [
    { valor: "grupo", get descripcion() { return tComponentes("ui.atomos.semanas"); } },
    { valor: "@esta-semana", get descripcion() { return tComponentes("ui.atomos.estaSemana"); } },
    { valor: "@semana-anterior", get descripcion() { return tComponentes("ui.atomos.semanaAnterior"); } },
    { valor: "@semana-siguiente", get descripcion() { return tComponentes("ui.atomos.semanaSiguiente"); } },
  ],
  [
    { valor: "grupo", get descripcion() { return tComponentes("ui.atomos.meses"); } },
    { valor: "@este-mes", get descripcion() { return tComponentes("ui.atomos.esteMes"); } },
    { valor: "@mes-anterior", get descripcion() { return tComponentes("ui.atomos.mesAnterior"); } },
    { valor: "@mes-siguiente", get descripcion() { return tComponentes("ui.atomos.mesSiguiente"); } },
  ],
  [
    { valor: "grupo", get descripcion() { return tComponentes("ui.atomos.anos"); } },
    { valor: "@este-año", get descripcion() { return tComponentes("ui.atomos.esteAno"); } },
    { valor: "@año-anterior", get descripcion() { return tComponentes("ui.atomos.anoAnterior"); } },
    { valor: "@año-siguiente", get descripcion() { return tComponentes("ui.atomos.anoSiguiente"); } },
  ],
];

type QDateIntervalProps = QDateProps;

export const QDateInterval = ({
  label,
  nombre,
  valor,
  onChange,
  ...props
}: QDateIntervalProps) => {
  const manual = Array.isArray(valor);

  const manejarChangeIntervalo = (
    opcion: Opcion | null,
    e: React.ChangeEvent<HTMLElement>
  ) => {
    onChange?.(
      opcion?.valor ?? "",
      e as unknown as React.ChangeEvent<HTMLInputElement>
    );
  };

  const manejarChangeManual = () => {
    onChange?.(
      [undefined, undefined] as unknown as string,
      undefined as unknown as React.ChangeEvent<HTMLInputElement>
    );
  };

  if (!manual) {
    return (
      <>
        <QSelect
          label={label}
          nombre={nombre}
          valor={valor}
          onChange={manejarChangeIntervalo}
          opciones={opcionesIntervaloFechas}
        />
        <QBoton onClick={manejarChangeManual}>{tComponentes("ui.atomos.manual")}</QBoton>
      </>
    );
  }

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
        {...props}
        label={label + " desde"}
        nombre={nombre + "__desde"}
        valor={desde}
        onChange={manejarChangeFecha}
      />
      <QDate
        {...props}
        label={label + " hasta"}
        nombre={nombre + "__hasta"}
        valor={hasta}
        onChange={manejarChangeFecha}
      />
    </div>
  );
};
