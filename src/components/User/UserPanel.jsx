import React, { Component } from "react";
import { Card, CardContent, Button, Typography, Link } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import { logout } from "../../services/users.service";

class UserPanel extends Component {
  constructor(props) {
    super(props);
  }

  onLoginPressed(e) {
    e.preventDefault();
    this.props.loginPressed();
  }

  onSignUpPressed(e) {
    e.preventDefault();
    this.props.signUpPressed();
  }

  onRankingTablePressed(e) {
    e.preventDefault();
    this.props.rankingTablePressed();
  }

  onDisconnect(e) {
    e.preventDefault();
    logout();
    this.props.disconnect();
  }

  render() {
    const { classes, player } = this.props;

    return (
      <React.Fragment>
        <Card variant="outlined" className={classes.paper_root}>
          <CardContent className={classes.paper_content_root}>
            <Typography
              gutterBottom
              variant="h5"
              component="h2"
              className={classes.headline}
            >
              Juegos de Lenguaje
            </Typography>
            <br />
            {!player.logged && (
              <React.Fragment>
                <Typography
                  className={classes.title}
                  color="textSecondary"
                  gutterBottom
                >
                  Para empezar debes estar conectado como jugador
                </Typography>
                <br />
                <Button
                  type="button"
                  variant="outlined"
                  color="primary"
                  onClickCapture={(e) => this.onLoginPressed(e)}
                >
                  Conectar
                </Button>
                <span>&nbsp;&nbsp;ó&nbsp;&nbsp;</span>
                <Button
                  type="button"
                  variant="contained"
                  color="primary"
                  onClickCapture={(e) => this.onSignUpPressed(e)}
                >
                  Registrar
                </Button>
              </React.Fragment>
            )}
            {player.logged && (
              <React.Fragment>
                <Typography
                  className={classes.title}
                  color="textSecondary"
                  gutterBottom
                >
                  Hola, <b>{player.fullname}</b>
                  <br />
                  Estas conectado con el usuario:
                  <br />
                  <b>{player.username}</b>
                  <br />
                  Tu jugador es: <br />
                  <b>{player.name}</b>
                </Typography>
                <Link
                  component="button"
                  variant="body2"
                  className={classes.secondary_font}
                  onClickCapture={(e) => this.onDisconnect(e)}
                >
                  Desconectarse
                </Link>
              </React.Fragment>
            )}
            <Typography className={classes.extraSpace} />
            <Link
              component="button"
              variant="body2"
              className={classes.secondary_font}
              onClickCapture={(e) => this.onRankingTablePressed(e)}
            >
              Ranking por Juego
            </Link>
          </CardContent>
        </Card>
        <br />
      </React.Fragment>
    );
  }
}

const fontFamily1 = { fontFamily: "Andika, sans-serif" };
const fontFamily2 = { fontFamily: "Open Sans, sans-serif" };
const defaultStyles = { ...fontFamily2 };
const styles = {
  root: {
    "& > *": {
      margin: 8,
    },
    color: "#9e9e9e",
  },
  header_root: {
    paddingBottom: "0",
  },
  paper_root: {
    maxWidth: 345,
    padding: "0",
    fontWeight: "bold",
    ...defaultStyles,
  },
  paper_content_root: {
    minHeight: 50,
  },
  textField1: {
    width: "40ch",
  },
  textField2: {
    width: "19ch",
  },
  primary_font: {
    ...fontFamily1,
  },
  secondary_font: {
    ...fontFamily2,
    fontSize: 15,
  },
  extraSpace: {
    paddingBottom: 9,
  },
};

export default withStyles(styles)(UserPanel);
