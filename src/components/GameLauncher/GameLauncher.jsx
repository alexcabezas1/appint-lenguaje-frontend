import React, { Component } from "react";
import {
  Card,
  CardContent,
  CardActionArea,
  Grid,
  Typography,
  Link,
} from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import data from "./data.json";
import { getGame } from "../../services";

function getGameNameBySlug(gameSlug) {
  const { games } = data;
  return games[gameSlug].name;
}

class GameLauncher extends Component {
  constructor(props) {
    super(props);
    this.state = {
      chosenGame: null,
      isGameChosen: false,
      chosenDifficulty: null,
      exit: false,
    };
  }

  onGameChosen(e, chosenGame) {
    e.preventDefault();
    if (this.props.playerLogged) {
      this.setState({ chosenGame, isGameChosen: chosenGame !== null });
    }
  }

  async onDifficultyChosen(chosenDifficulty) {
    this.setState({
      chosenDifficulty,
      exit: true,
    });
    const { chosenGame } = this.state;

    const gameData = await getGame({
      slug: chosenGame,
      difficulty: chosenDifficulty,
    });

    this.props.notifyGameChosen({
      chosenGame,
      chosenDifficulty: chosenDifficulty.toUpperCase(),
      gameData,
    });
  }

  onBackPressed(e) {
    e.preventDefault();
    this.setState({ chosenGame: null, isGameChosen: false });
  }

  render() {
    const { classes } = this.props;
    const { isGameChosen, chosenGame, exit } = this.state;
    const { games, difficulties } = data;
    const gameItems = Object.entries(games).map(([key, value]) => (
      <Grid key={"game-" + key} item>
        <Link
          component="button"
          variant="body2"
          style={{ textDecoration: "none", textAlign: "left" }}
          onClickCapture={(e) => this.onGameChosen(e, value.slug)}
        >
          <Card variant="outlined" className={classes.paper_root}>
            <CardActionArea>
              <CardContent className={classes.paper_content_root}>
                <Typography
                  gutterBottom
                  variant="h5"
                  component="h2"
                  className={classes.primary_font}
                >
                  {value.name}
                </Typography>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  component="p"
                  className={classes.secondary_font}
                  dangerouslySetInnerHTML={{ __html: value.description }}
                ></Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Link>
      </Grid>
    ));

    const difficultiesItems = difficulties.map((value, index) => (
      <Grid key={"difficulty-" + index} item>
        <Link
          component="button"
          variant="body2"
          style={{ textDecoration: "none", textAlign: "left" }}
          onClick={async () => await this.onDifficultyChosen(value.slug)}
        >
          <Card variant="outlined" className={classes.paper_root}>
            <CardActionArea>
              <CardContent>
                <Typography
                  gutterBottom
                  variant="h5"
                  className={classes.primary_font}
                  component="h2"
                >
                  {value.name}
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Link>
      </Grid>
    ));

    return (
      <React.Fragment>
        {!exit && (
          <Grid container className={classes.root} spacing={2}>
            {!isGameChosen && (
              <Grid item xs={12}>
                <Grid container spacing="2">
                  <Grid item>Prueba alguno de estos juegos:</Grid>
                </Grid>
                <Grid
                  container
                  justify="flex-start"
                  alignItems="flex-start"
                  spacing="2"
                >
                  {gameItems}
                </Grid>
              </Grid>
            )}

            {isGameChosen && (
              <Grid item xs={12}>
                <Grid container spacing="2">
                  <Grid item>
                    Te decidiste por el juego{" "}
                    <b>{getGameNameBySlug(chosenGame)}</b>.
                    <br /> Ahora, ¿en qué dificultad lo jugarás?
                  </Grid>
                </Grid>
                <Grid container justify="flex-start" spacing="2">
                  {difficultiesItems}
                </Grid>
                <Grid container spacing="2">
                  <Grid item>
                    <Link
                      component="button"
                      variant="body2"
                      className={classes.secondary_font}
                      onClickCapture={(e) => this.onBackPressed(e)}
                    >
                      {"<<"} Aún estás a tiempo de intentar con otro juego.
                    </Link>
                  </Grid>
                </Grid>
              </Grid>
            )}
          </Grid>
        )}
      </React.Fragment>
    );
  }
}

const fontFamily1 = { fontFamily: "Andika, sans-serif" };
const fontFamily2 = { fontFamily: "Open Sans, sans-serif" };
const defaultStyles = { ...fontFamily2 };
const styles = {
  root: {
    flexGrow: 1,
  },
  paper_root: {
    maxWidth: 345,
    padding: "0",
    fontWeight: "bold",
    ...defaultStyles,
  },
  paper_content_root: {
    minHeight: 170,
    fontSize: "14px",
  },
  primary_font: {
    ...fontFamily1,
  },
  secondary_font: {
    ...fontFamily2,
    fontSize: 15,
  },
};

export default withStyles(styles)(GameLauncher);
export { getGameNameBySlug };
