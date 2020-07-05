import React, { Component } from "react";
import { Card, CardContent, Typography, Link } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import { savePlay } from "../../services";

class ScoreScreen extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.savePlayScore();
  }

  onTryAgainPressed(e) {
    e.preventDefault();
    this.props.next();
  }

  savePlayScore() {
    const { gameData, player, difficulty, points } = this.props;
    const { id: gameId } = gameData;
    const { id: playerId } = player;
    savePlay({ playerId, gameId, difficulty, points }).then((response) => {
      console.log(response);
    });
  }

  render() {
    const { classes, gameData, points } = this.props;
    const { name: gameName } = gameData;

    return (
      <React.Fragment>
        <Card variant="outlined" className={classes.paper_root}>
          <CardContent className={classes.paper_content_root}>
            <Typography
              className={classes.title}
              color="textSecondary"
              gutterBottom
            >
              Has ganado estos puntos durante la última partida de{" "}
              <b>{gameName}</b>:
            </Typography>
            <Typography
              gutterBottom
              variant="h3"
              component="h2"
              className={classes.headline}
            >
              {points}
            </Typography>
            <Typography
              variant="body2"
              color="textSecondary"
              className={classes.secondary_font}
              component="p"
            >
              Continúa jugando para seguir mejorando y conseguir más puntos. De
              esa forma podrás superar a otros en la tabla de posiciones.
              <br />
              <br />
              <Link
                component="button"
                variant="body2"
                className={classes.secondary_font}
                onClickCapture={(e) => this.onTryAgainPressed(e)}
              >
                {"<<"} Intenta otra vez
              </Link>
            </Typography>
          </CardContent>
        </Card>
      </React.Fragment>
    );
  }
}

const fontFamily1 = { fontFamily: "Andika, sans-serif" };
const fontFamily2 = { fontFamily: "Open Sans, sans-serif" };
const defaultStyles = { ...fontFamily2 };
const styles = {
  paper_root: {
    maxWidth: 345,
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
};

export default withStyles(styles)(ScoreScreen);
