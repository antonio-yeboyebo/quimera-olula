import { QAutocompletar, QAutocompletarProps } from "@olula/componentes/moleculas/qautocompletar.tsx";
import { Criteria } from "@olula/lib/diseño.ts";
import { getItemsListaVariedad } from "../../variedad/infraestructura.ts";

type VariedadProps = Omit<QAutocompletarProps, "obtenerOpciones">


export const Variedad = ({
  descripcion = "",
  valor,
  nombre = "variedad",
  label = "Variedad",
  onChange,
  ...props
}: VariedadProps) => {

    const obtenerOpciones = async (texto: string) => {
        const criteria: Criteria = {
            filtro: [["descripcion", "~", texto]],
            orden: ["id"],
            paginacion: { limite: 10, pagina: 1 },
        };

        const variedades = await getItemsListaVariedad(
            criteria.filtro,
            criteria.orden
        );

        return variedades.map((variedad) => ({
            valor: variedad.id,
            descripcion: variedad.descripcion,
        }));
    };

    return (
        <QAutocompletar
            label={label}
            nombre={nombre}
            onChange={onChange}
            valor={valor}
            descripcion={descripcion}
            obtenerOpciones={obtenerOpciones}
            {...props}
        />
    );
};
