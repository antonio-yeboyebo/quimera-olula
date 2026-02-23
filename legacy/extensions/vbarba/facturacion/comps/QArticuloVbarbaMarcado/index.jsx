import { Field } from "@quimera/comps";
import { useStateValue, util } from "quimera";
import { API } from "quimera/lib";
import React, { useCallback, useEffect, useRef, useState } from "react";

function QArticuloVbarbaMarcado({
  seVende = false,
  codFamilia = null,
  noOptionsText = "Buscar artículo por nombre",
  ...props
}) {
  const [options, setOptions] = useState([]);
  const [_, dispatch] = useStateValue();
  const containerRef = useRef(null);

  // Construir filtros basados en las props
  const getFiltroOptions = useCallback(() => {
    const filters = [];
    if (seVende) {
      filters.push(["sevende", "eq", true]);
    }
    if (codFamilia) {
      filters.push(["codfamilia", "eq", codFamilia]);
    }

    return filters.length > 0 ? filters : null;
  }, [seVende, codFamilia]);

  // Detectar si el valor es probablemente un código de barras
  const isBarcodeValue = value =>
    value && value.length > 8 && !value.includes(" ") && !value.includes("€");

  // Detectar si el valor ya contiene un artículo seleccionado
  const hasSelectedArticle = value => value && value.includes("€");

  // Navegar al siguiente elemento focusable
  const navigateToNextElement = useCallback(currentElement => {
    const form = currentElement.closest("form") || document;
    const focusableElements = form.querySelectorAll(
      'input[type="text"]:not([disabled]), input[type="number"]:not([disabled]), select:not([disabled]), textarea:not([disabled])',
    );

    const currentIndex = Array.from(focusableElements).indexOf(currentElement);
    const nextElement = focusableElements[currentIndex + 1];

    if (nextElement) {
      nextElement.focus();
      if (nextElement.type === "text" || nextElement.type === "number") {
        nextElement.select();
      }
    }
  }, []);

  // Seleccionar artículo automáticamente
  const selectArticle = useCallback(
    article => {
      dispatch({
        type: "onLineaBufferChanged",
        payload: {
          field: "referencia",
          value: article.key,
          option: article.option,
        },
      });
    },
    [dispatch],
  );

  // Procesar resultado de búsqueda para códigos de barras
  const processBarcodeSearch = useCallback(
    searchResults => {
      if (searchResults.length === 1) {
        selectArticle(searchResults[0]);
      }
      // Si no hay resultados o hay múltiples, no hacer nada (usuario debe elegir)
    },
    [selectArticle],
  );

  // Obtener opciones de artículos
  const getOptions = useCallback(
    (text, key, onComplete = null) => {
      const filtroBase = key
        ? ["referencia", "eq", key]
        : {
          or: [
            ["descripcion", "like", text],
            ["referencia", "like", text],
            ["codbarras", "like", text],
          ],
        };

      const filtroOptions = getFiltroOptions();
      const filtro = filtroOptions ? { and: [...filtroOptions, filtroBase] } : filtroBase;

      if (text !== null || key !== null) {
        API("articulos")
          .get()
          .select("referencia,codbarras,descripcion,precioRef")
          .filter(filtro)
          .page({ limit: 100 })
          .success(response => {
            const newOptions = response.data.map(articulo => {
              const pvp = util.euros(articulo.precioRef);

              return {
                key: articulo.referencia,
                value: `${pvp} ${articulo.descripcion} (${articulo.referencia}) / (${articulo.codbarras})`,
                option: articulo,
              };
            });

            setOptions(newOptions);
            onComplete?.(newOptions);
          })
          .error(error => {
            console.error("Error buscando artículos:", error);
            onComplete?.([]);
          })
          .go();
      }
    },
    [getFiltroOptions],
  );

  // Manejar teclas presionadas
  const onKeyDown = useCallback(
    event => {
      const inputValue = event.target.value;

      // Tab: selección automática si hay una sola opción
      if (event.key === "Tab" || event.key === 9) {
        if (options.length === 1) {
          selectArticle(options[0]);
        }

        return;
      }

      // Enter: navegación o búsqueda de código de barras
      if (event.key === "Enter" || event.keyCode === 13) {
        // Si es un código de barras, procesar búsqueda
        if (isBarcodeValue(inputValue)) {
          event.preventDefault(); // Retener el Enter

          // Si ya hay opciones en estado, procesarlas
          if (options.length > 0) {
            processBarcodeSearch(options);

            return;
          }

          // Si no hay opciones, hacer búsqueda y procesar resultado
          getOptions(inputValue, null, processBarcodeSearch);

          return;
        }

        // Para entrada manual o artículo ya seleccionado, navegar normalmente
        setTimeout(() => navigateToNextElement(event.target), 50);
      }
    },
    [options, navigateToNextElement, selectArticle, processBarcodeSearch],
  );

  // Seleccionar texto automáticamente cuando se elige una opción
  const handleClick = useCallback(() => {
    setTimeout(() => {
      const inputElement = containerRef.current?.querySelector('input[type="text"]');
      if (inputElement && hasSelectedArticle(inputElement.value)) {
        inputElement.select();
      }
    }, 100);
  }, []);

  // Observer para detectar cambios y seleccionar texto automáticamente
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const inputElement = containerRef.current?.querySelector('input[type="text"]');
      if (!inputElement) {
        return;
      }

      const currentValue = inputElement.value;
      const isTextAlreadySelected = inputElement.selectionStart !== inputElement.selectionEnd;

      if (hasSelectedArticle(currentValue) && !isTextAlreadySelected) {
        setTimeout(() => inputElement.select(), 50);
      }
    });

    if (containerRef.current) {
      observer.observe(containerRef.current, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["value"],
      });
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} style={{ width: "100%" }} onClick={handleClick}>
      <Field.Select
        getOptions={getOptions}
        options={options}
        noOptionsText={noOptionsText}
        onKeyDown={onKeyDown}
        async
        {...props}
      />
    </div>
  );
}

export default QArticuloVbarbaMarcado;
