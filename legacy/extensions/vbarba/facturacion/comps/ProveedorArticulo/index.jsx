import { Field } from "@quimera/comps";
import { util } from "quimera";
import { API } from "quimera/lib";
import React, { useCallback, useEffect, useState } from "react";

function ProveedorArticulo({ referencia = null, ...props }) {
  const [options, setOptions] = useState([]);

  const getOptions = useCallback(
    (text, key) => {
      // const schema = schemas.proveedores;
      // const texto = text ?? "";

      // const filtroBase = key
      //   ? ["codproveedor", "eq", key]
      //   : {
      //     or: [
      //       ["nombre", "like", texto],
      //       ["aliasprov", "like", texto],
      //     ],
      //   };

      // const filtro = referencia
      //   ? {
      //     and: [["referencia", "eq", referencia], filtroBase],
      //   }
      //   : filtroBase;
      // console.log("mimensaje_referencia", referencia);
      if (!referencia) {
        setOptions([]);
      } else {
        API("articulos")
          .get(referencia, "get_codiciones_compra")
          .select(
            "id,referencia,descripcion,codproveedor,aliasprov,dto,costereal,pvp,coste,nombre,disponible,pordefecto",
          )
          // .filter(filtroBase)
          .success(response =>
            setOptions(
              response.data.map(proveedor => {
                return {
                  key: proveedor.codproveedor,
                  value: `${proveedor.nombre}${proveedor.aliasprov ? ` (${proveedor.aliasprov})` : ""
                    } (${proveedor.codproveedor}) - ${util.euros(proveedor.costereal)}`,
                  option: proveedor,
                };
              }),
            ),
          )
          .error(error => console.log("Error", error))
          .go();
      }
    },
    [referencia],
  );

  useEffect(() => {
    // para la primera vez
    getOptions("");
  }, [referencia]);

  return (
    <Field.Select
      getOptions={getOptions}
      options={options}
      noOptionsText="Indica el nombre del proveedor"
      {...props}
      async
    />
  );
}

export default ProveedorArticulo;
