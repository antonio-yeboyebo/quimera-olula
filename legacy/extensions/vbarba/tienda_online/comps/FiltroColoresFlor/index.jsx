import { Avatar, Grid, Icon, IconButton, Typography } from "@quimera/comps";
import { makeStyles } from "@quimera/styles";
import { util } from "quimera";
import { useFilterValue } from "quimera/hooks";
import React from "react";
import { QExpandButton } from "../";

const useStyles = makeStyles(theme => ({
  avatar: {
    backgroundColor: theme.palette.grey[300],
    border: `2px solid ${theme.palette.grey[300]}`,
    maxWidth: 34,
    maxHeight: 34,
  },
  avatarSeleccionado: {
    backgroundColor: theme.palette.grey[300],
    border: `2px solid ${theme.palette.primary.main}`,
    maxWidth: 34,
    maxHeight: 34,
  },
  cajaAvatares: {
    backgroundColor: theme.palette.grey[300],
    borderRadius: 5,
    border: `1px solid ${theme.palette.primary.main}`,
    minHeight: '75px',
    marginTop: '8px',
    padding: '0px 0px 10px 10px'
  },
  sincolor: {
    color: "rgba(0, 0, 0, 0.54)",
    fontSize: "0.9rem",
    paddingLeft: "5px",
    paddingTop: "3px",
  },
}));

const refsVisibiles = 2;
function FiltroColoresFlor({ id, label, operator, options, selected = false }) {
  const [{ filter, schema }, addFilter, removeFilter] = useFilterValue();

  const classes = useStyles();

  const schemaObj = schema?._get?.();
  const fieldsObj = schemaObj?._getFields?.();
  const fieldSchema = id ? fieldsObj?.[id.replace(/\//g, ".").split(".").pop()] : undefined;
  const fieldName = fieldSchema?._name;

  const seleccionadas = filter[id] ? filter[id].value : [];

  const onChange = option => {
    const nuevaSeleccion = seleccionadas.includes(option.value)
      ? seleccionadas.filter(value => value != option.value)
      : [...seleccionadas, option.value];

    if (nuevaSeleccion.length == 0) {
      removeFilter(id);
    } else {
      addFilter(id, {
        filter: { or: nuevaSeleccion.map(option => [fieldName, operator, option]) },
        value: nuevaSeleccion,
      });
    }
  };

  const renderSeleccionados = () => {
    let selected = options.filter(option => seleccionadas.includes(option.value)).map(option => (
      <Grid item key={option.value}>
        <Avatar
          className={
            seleccionadas.includes(option.value) ? classes.avatarSeleccionado : classes.avatar
          }
        >
          <IconButton id="selectColor" onClick={() => onChange(option)}>
            <Icon style={{ color: option.rgb, fontSize: 30 }}>filter_vintage</Icon>
          </IconButton>
        </Avatar>
      </Grid>
    ));

    if (selected.length === 0) {
      selected = <Typography variant="" className={classes.sincolor}>No hay colores seleccionados.</Typography>;
    }

    return (
      <Grid container spacing={1} direction="column" >
        {selected}
      </Grid>
    );
  };

  return (
    <QExpandButton
      titulo={util.translate(label)}
      className={classes.cajaAvatares}
      repose={renderSeleccionados}>
      <Grid container spacing={1} direction="column" >
        {options.map(option => (
          <Grid item key={option.value}>
            <Avatar
              className={
                seleccionadas.includes(option.value) ? classes.avatarSeleccionado : classes.avatar
              }
            >
              <IconButton id="selectColor" onClick={() => onChange(option)}>
                <Icon style={{ color: option.rgb, fontSize: 30 }}>filter_vintage</Icon>
              </IconButton>
            </Avatar>
          </Grid>
        ))}
      </Grid>
    </QExpandButton>
  );
}

export default FiltroColoresFlor;
