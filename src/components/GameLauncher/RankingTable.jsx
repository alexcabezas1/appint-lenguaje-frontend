import React, { Component } from "react";
import {
  Card,
  CardContent,
  Typography,
  Link,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
} from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import { getRanking } from "../../services";

class RankingTable extends Component {
  constructor(props) {
    super(props);
    this.initialGame = "sort-sentences";
    this.state = {
      value: this.initialGame,
      rows: [],
      exit: false,
    };
  }

  componentDidMount() {
    getRanking({ slug: this.initialGame }).then((res) => {
      this.setState({
        rows: res,
      });
    });
  }

  sampleData(position, player, totalPoints) {
    return { position, player: { name: player }, totalPoints };
  }

  async onGameChange(e, value) {
    e.preventDefault();
    const rows = await getRanking({ slug: value });
    this.setState({ value, rows });
  }

  finish(data = {}) {
    this.setState({ exit: true });
    this.props.next(data);
  }

  onBackPressed() {
    this.finish();
  }

  render() {
    const { classes } = this.props;
    const { value, rows, exit } = this.state;

    return (
      <React.Fragment>
        {!exit && (
          <Card variant="outlined" className={classes.paper_root}>
            <CardContent className={classes.paper_content_root}>
              <Typography
                gutterBottom
                variant="h5"
                component="h2"
                className={classes.headline}
              >
                Ranking por Juego
              </Typography>

              <Typography className={classes.padding} />
              <AntTabs
                value={value}
                onChange={async (e, v) => await this.onGameChange(e, v)}
                aria-label="ant example"
                variant="scrollable"
                scrollButtons="auto"
                aria-label="scrollable auto tabs example"
              >
                <AntTab
                  label="Organizador de Oraciones"
                  value="sort-sentences"
                />
                <AntTab
                  label="Detector de Sílabas"
                  value="syllables-detector"
                />
                <AntTab
                  label="Comprender las Lecturas"
                  value="reading-comprehension"
                />
              </AntTabs>
              <Typography className={classes.padding} />
              <TableContainer component={Paper}>
                <Table className={classes.table} aria-label="customized table">
                  <TableHead>
                    <TableRow>
                      <StyledTableCell>Posición</StyledTableCell>
                      <StyledTableCell align="center">Jugador</StyledTableCell>
                      <StyledTableCell align="right">
                        Puntos Acumulados
                      </StyledTableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map((row) => (
                      <StyledTableRow key={row.position}>
                        <StyledTableCell component="th" scope="row">
                          {row.position}
                        </StyledTableCell>
                        <StyledTableCell align="center">
                          {row.player.name}
                        </StyledTableCell>
                        <StyledTableCell align="right">
                          {row.totalPoints}
                        </StyledTableCell>
                      </StyledTableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Typography className={classes.padding} />
              <Link
                component="button"
                variant="body2"
                className={classes.secondary_font}
                onClickCapture={(e) => this.onBackPressed(e)}
              >
                {"<<"} Volver
              </Link>
            </CardContent>
          </Card>
        )}
      </React.Fragment>
    );
  }
}

const AntTabs = withStyles({
  root: {
    borderBottom: "1px solid #e8e8e8",
  },
  indicator: {
    backgroundColor: "#1890ff",
  },
})(Tabs);

const AntTab = withStyles((theme) => ({
  root: {
    textTransform: "none",
    minWidth: 72,
    fontWeight: theme.typography.fontWeightRegular,
    marginRight: theme.spacing(4),
    fontFamily: [
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(","),
    "&:hover": {
      color: "#40a9ff",
      opacity: 1,
    },
    "&$selected": {
      color: "#1890ff",
      fontWeight: theme.typography.fontWeightMedium,
    },
    "&:focus": {
      color: "#40a9ff",
    },
  },
  selected: {},
}))((props) => <Tab disableRipple {...props} />);

const StyledTableCell = withStyles((theme) => ({
  head: {
    backgroundColor: "#2F3F9F",
    color: theme.palette.common.white,
  },
  body: {
    fontSize: 14,
  },
}))(TableCell);

const StyledTableRow = withStyles((theme) => ({
  root: {
    "&:nth-of-type(odd)": {
      backgroundColor: theme.palette.action.hover,
    },
  },
}))(TableRow);

const fontFamily1 = { fontFamily: "Andika, sans-serif" };
const fontFamily2 = { fontFamily: "Open Sans, sans-serif" };
const defaultStyles = { ...fontFamily2 };
const styles = {
  paper_root: {
    maxWidth: 500,
    padding: "0",
    fontWeight: "bold",
    ...defaultStyles,
  },
  paper_content_root: {
    minHeight: 170,
  },
  primary_font: {
    ...fontFamily1,
  },
  secondary_font: {
    fontSize: 15,
    ...fontFamily2,
  },
  headline: {
    ...fontFamily2,
    marginBottom: 0,
  },
  title: {
    fontSize: 15,
    ...fontFamily2,
  },
  body1: {
    fontSize: 14,
  },
  padding: {
    paddingBottom: 9,
  },
};

export default withStyles(styles)(RankingTable);
