import React, { Component } from "react";
import { Card, CardContent, Grid } from "@material-ui/core";
import Countdown, { zeroPad } from "react-countdown";
import _ from "lodash";

import arrayMove from "array-move";
import {
  DraggableItem,
  DraggableContainer,
} from "@wuweiweiwu/react-shopify-draggable";
import FittedImage from "react-fitted-image";

import "./SortSentencesGame.css";

const IMAGES_PATH = process.env.PUBLIC_URL + "/images/situations/";
const CHALLENGE_STATUS = {
  SOLVING: "solving",
  SOLVED: "solved",
  UNSOLVED: "unsolved",
};

class SortSentencesChallenge extends Component {
  constructor(props) {
    super(props);
    this.image = props.image;
    this.sentence = props.sentence;
    this.sentenceRightOrder = this.sentence.split(" ");
    this.sentenceShuffled = _.shuffle(this.sentenceRightOrder);
    this.state = {
      status: CHALLENGE_STATUS.SOLVING,
      challenge: this.sentenceShuffled,
      playerMovementCount: 0,
    };
  }

  componentDidMount() {
    this.props.onChallengeLoad();
  }

  getStatusStyle(status) {
    if (status === CHALLENGE_STATUS.SOLVED) {
      return "challenge-solved";
    } else if (status === CHALLENGE_STATUS.UNSOLVED) {
      return "challenge-unsolved";
    } else {
      return "";
    }
  }

  onCountDownComplete() {
    this.setState({
      status: CHALLENGE_STATUS.UNSOLVED,
    });
  }

  onSortableStop(e) {
    if (this.state.status === CHALLENGE_STATUS.UNSOLVED) return;

    const { playerMovementCount } = this.state;
    const progress = arrayMove(
      this.state.challenge,
      e.data.oldIndex,
      e.data.newIndex
    );
    const isSolved = _.isEqual(progress, this.sentenceRightOrder);
    const status = isSolved
      ? CHALLENGE_STATUS.SOLVED
      : CHALLENGE_STATUS.SOLVING;

    this.setState({
      challenge: progress,
      status,
      playerMovementCount: playerMovementCount + 1,
    });

    if (isSolved) {
      this.props.onChallengeSolved(this.props.index, true);
    }
  }

  render() {
    return (
      <div className="challenge">
        <div className="image">
          <FittedImage
            fit="contain"
            loader={<div>Cargando imagen...</div>}
            src={this.image}
          />
        </div>
        <div>
          <DraggableContainer
            as="p"
            type="sortable"
            className={"text " + this.getStatusStyle(this.state.status)}
            onSortableStop={(e) => this.onSortableStop(e)}
          >
            {this.sentenceShuffled.map((value, index) => {
              const key = "sentence-word-" + index;
              return (
                <DraggableItem as="em" className="text__word" key={key}>
                  {value + " "}
                </DraggableItem>
              );
            })}
          </DraggableContainer>
          <span className="clearfix" />
          {this.state.solved && <div>Solved!</div>}
        </div>
      </div>
    );
  }
}

class SortSentencesGame extends Component {
  constructor(props) {
    super(props);

    const { gameData: data } = this.props;
    const { difficulty } = data;

    this.settings = difficulty;
    this.state = {
      currentChallengeIndex: 0,
      points: 0,
      playerMovementCount: 0,
      exit: false,
      challenges: [],
    };
    this.countDownRef = React.createRef();
  }

  componentDidMount() {
    const { gameData: data } = this.props;
    const challenges = this.prepareChallenges(data);
    this.setState({ challenges });
  }

  prepareChallenges(data) {
    const { challengesNumber, sentenceAttribute } = this.settings;
    const situations = data.options;
    const sampleSituations = _.sampleSize(situations, challengesNumber);

    return sampleSituations.map((element) => ({
      image: element.image,
      text: _.sample(element[sentenceAttribute]),
      ref: React.createRef(),
    }));
  }

  computePoints(challenge) {
    const { movementsBonusFactor, pointsPerChallenge } = this.settings;
    const { playerMovementCount } = challenge.ref.current.state;

    const sentenceWordsCount = challenge.text.split(" ").length;

    const movementsBonus = _.floor(sentenceWordsCount * movementsBonusFactor);
    const rate = _.floor(playerMovementCount / movementsBonus);
    const points = rate > 1 ? pointsPerChallenge / rate : pointsPerChallenge;

    console.log(movementsBonus, playerMovementCount, points);
    return points;
  }

  goToNextChallenge(callerChallengeIndex) {
    const { challengesNumber } = this.settings;
    const nextChallengeIndex = callerChallengeIndex + 1;

    if (nextChallengeIndex < challengesNumber) {
      this.setState({
        currentChallengeIndex: nextChallengeIndex,
      });
    } else {
      this.setState({ exit: true });
      const { points } = this.state;
      this.props.notifyPlayCompleted({ points });
    }
  }

  onChallengeSolved(callerChallengeIndex, challengeSolved = false) {
    const { challenges } = this.state;
    const newPoints = this.computePoints(challenges[callerChallengeIndex]);
    this.setState(({ points }) => ({
      points: points + newPoints,
    }));
    setTimeout(() => this.goToNextChallenge(callerChallengeIndex), 3000);
  }

  onChallengeLoad() {
    if (this.settings.countDown >= 0) {
      this.countDownRef.current.getApi().start();
    }
  }

  onCountDownComplete() {
    const { challenges, currentChallengeIndex } = this.state;
    const ref = challenges[currentChallengeIndex].ref;
    ref.current.onCountDownComplete();

    setTimeout(() => this.goToNextChallenge(currentChallengeIndex), 3000);
  }

  render() {
    const { challenges, currentChallengeIndex, points } = this.state;
    const challengesItems = challenges.map((value, index) => (
      <SortSentencesChallenge
        key={"challenge-" + index}
        image={IMAGES_PATH + value.image}
        sentence={value.text}
        index={index}
        ref={value.ref}
        onChallengeSolved={(index, solved) =>
          this.onChallengeSolved(index, solved)
        }
        onChallengeLoad={() => this.onChallengeLoad()}
      />
    ));
    const { countDown } = this.settings;

    return (
      <div className="SortSentencesGame game">
        <Card variant="outlined" className="game__header">
          <CardContent>
            <Grid
              container
              direction="row"
              justify="space-between"
              alignItems="flex-end"
            >
              {countDown >= 0 && (
                <Grid item xs={4}>
                  <Countdown
                    date={Date.now() + 60000 * countDown}
                    intervalDelay={0}
                    precision={3}
                    autoStart={false}
                    ref={this.countDownRef}
                    onComplete={() => this.onCountDownComplete()}
                    renderer={(p) => (
                      <div>
                        <div className="time">Tiempo</div>
                        <div className="time-value">
                          {zeroPad(p.minutes)}:{zeroPad(p.seconds)}
                        </div>
                      </div>
                    )}
                  />
                </Grid>
              )}
              <Grid item xs={6}>
                <div className="points">Puntos</div>
                <div className="points-value">{points}</div>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
        <Card variant="outlined">
          <CardContent>{challengesItems[currentChallengeIndex]}</CardContent>
        </Card>
      </div>
    );
  }
}

export default SortSentencesGame;
