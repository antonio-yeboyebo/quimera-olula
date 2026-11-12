import { Box, QListItem, Typography } from "@quimera/comps";
import { makeStyles } from "@quimera/styles";
import { CircularProgress, InfiniteScroll, List } from "@quimera/thirdparty";
import { navigate } from "quimera";

const valorTrato = v => {
  if (v < 1_000) {
    return v;
  }
  if (v < 1_000_000) {
    return v / 1_000;
  }

  return v / 1_000_000;
};

const valorTratoFormatter = v => {
  return Number(valorTrato(v)).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
};
const udTratoFormatter = v => {
  if (v < 1_000) {
    return "€";
  }
  if (v < 1_000_000) {
    return "k.";
  }

  return "m.";
};

const useStyles = makeStyles(theme => ({
  box: {
    display: "flex",
    flexDirection: "column",
    gap: "0.03em",
    height: "auto",
    overflow: "auto",
  },
  centerBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: theme.spacing(1),
    padding: theme.spacing(2),
    overflow: "hidden",
    flexShrink: 0,
  },
  card: {
    "&:hover": {
      cursor: "pointer",
    },
  },
}));

export default function ListContactos({ contactos, onNext, maxHeight }) {
  const classes = useStyles();

  return (
    <Box id={`scrollableBoxListContactosActivos`} className={classes.box} style={{ maxHeight }}>
      <InfiniteScroll
        dataLength={contactos?.list?.length}
        next={onNext}
        hasMore={contactos?.page?.next !== null}
        // loader={<h4>Loading...</h4>}
        scrollableTarget={`scrollableBoxListContactosActivos`}
      >
        <List disablePadding>
          {contactos?.list?.map(contacto => (
            <QListItem
              key={contacto?.codContacto}
              onClick={() => navigate(`/ss/contacto/${contacto?.codContacto}`)}
              className={classes.card}
              style={{ borderBottom: "1px solid grey" }}
              alignActions="flex-end"
              tl={<Box display={"flex"}>{contacto?.nombre}</Box>}
              tr={
                <Typography
                  component="span"
                  variant="caption"
                  color="textPrimary"
                  style={{ textOverflow: "ellipsis" }}
                >
                  {`${contacto?.numEventos?.toString()?.padStart(2, "0")} curso${contacto?.numEventos > 1 ? "s" : ""
                    }`}
                </Typography>
              }
            />
          ))}
        </List>
      </InfiniteScroll>
      {contactos?.loading && (
        <Box className={classes.centerBox}>
          <Typography variant="subtitle1">Cargando contactos</Typography>
          <CircularProgress />
        </Box>
      )}
      {!contactos?.loading && !contactos?.list?.length && (
        <Typography variant="subtitle1">No hay contactos</Typography>
      )}
    </Box>
  );
}
