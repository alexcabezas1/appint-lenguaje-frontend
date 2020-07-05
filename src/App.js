import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import {
  SortSentencesGame,
  SyllablesDetectorGame,
  ReadingComprehensionGame,
} from "./components/games";
import GameLauncher, {
  ScoreScreen,
  RankingTable,
} from "./components/GameLauncher";
import { SignUp, Login, UserPanel } from "./components/User";
import "./App.css";
import _ from "lodash";

const SCREEN = {
  LOGIN: "login",
  SIGNUP: "signup",
  LAUNCHER: "game-launcher",
  GAME: "game-time",
  SCORE: "score-screen",
  RANKING: "ranking",
};

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      chosenGame: null,
      chosenDifficulty: null,
      pointsOfLastPlay: 0,
      screen: SCREEN.LAUNCHER,
      player: {
        logged: false,
      },
      gameData: {},
    };
  }

  onGameChosen({ chosenGame, chosenDifficulty, gameData }) {
    this.setState({
      chosenGame,
      chosenDifficulty,
      screen: SCREEN.GAME,
      pointsOfLastPlay: 0,
      gameData,
    });
  }

  onPlayCompleted({ points }) {
    console.log(points);
    this.setState({ pointsOfLastPlay: points, screen: SCREEN.SCORE });
  }

  onNext(screen, playerData = {}) {
    const player = _.merge(this.state.player, playerData);
    this.setState({ screen, player });
  }

  onDisconnect() {
    this.setState({
      player: { logged: false },
      gameData: {},
      pointsOfLastPlay: 0,
      chosenDifficulty: null,
      chosenGame: null,
    });
    window.location.reload();
  }

  render() {
    const { classes } = this.props;
    const {
      chosenGame,
      chosenDifficulty,
      screen,
      pointsOfLastPlay,
      player,
      gameData,
    } = this.state;

    const gameProps = {
      difficulty: chosenDifficulty,
      gameData,
      notifyPlayCompleted: (data) => this.onPlayCompleted(data),
    };
    //const gameName = chosenGame ? getGameNameBySlug(chosenGame) : "";

    const userPanel = (
      <UserPanel
        loginPressed={() => this.onNext(SCREEN.LOGIN)}
        signUpPressed={() => this.onNext(SCREEN.SIGNUP)}
        rankingTablePressed={() => this.onNext(SCREEN.RANKING)}
        disconnect={() => this.onDisconnect()}
        player={player}
      />
    );

    return (
      <div className="App">
        <div className={classes.marginAutoContainer}>
          {screen === SCREEN.SIGNUP && (
            <SignUp next={(data) => this.onNext(SCREEN.LAUNCHER, data)} />
          )}
          {screen == SCREEN.LOGIN && (
            <Login next={(data) => this.onNext(SCREEN.LAUNCHER, data)} />
          )}
          {screen === SCREEN.LAUNCHER && (
            <React.Fragment>
              {userPanel}
              <GameLauncher
                notifyGameChosen={(data) => this.onGameChosen(data)}
                playerLogged={player.logged}
              />
            </React.Fragment>
          )}
          {screen === SCREEN.GAME && chosenGame === "sort-sentences" && (
            <SortSentencesGame {...gameProps} />
          )}
          {screen === SCREEN.GAME && chosenGame === "syllables-detector" && (
            <SyllablesDetectorGame {...gameProps} />
          )}
          {screen === SCREEN.GAME && chosenGame === "reading-comprehension" && (
            <ReadingComprehensionGame {...gameProps} />
          )}
          {screen === SCREEN.SCORE && (
            <ScoreScreen
              gameData={gameData}
              player={player}
              difficulty={chosenDifficulty}
              points={pointsOfLastPlay}
              next={() => this.onNext(SCREEN.LAUNCHER)}
            />
          )}
          {screen === SCREEN.RANKING && (
            <RankingTable next={() => this.onNext(SCREEN.LAUNCHER)} />
          )}
        </div>
      </div>
    );
  }
}

const fontFamily1 = { fontFamily: "Andika, sans-serif" };
const fontFamily2 = { fontFamily: "Open Sans, sans-serif" };
const defaultStyles = { ...fontFamily2 };
const styles = {
  marginAutoContainer: {
    margin: "0 auto",
    width: "90%",
  },
  headline: {
    ...fontFamily2,
    marginBottom: 0,
  },
};

export default withStyles(styles)(App);
