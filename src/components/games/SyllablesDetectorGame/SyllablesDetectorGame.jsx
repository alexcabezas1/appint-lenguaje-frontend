import React, { Component } from "react";
import {
  Card,
  CardContent,
  Grid,
  Divider,
  List,
  ListItem,
  Typography,
} from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import { withStyles } from "@material-ui/core/styles";
import Countdown, { zeroPad } from "react-countdown";
import _ from "lodash";

import "./SyllablesDetectorGame.css";

const SEARCH_CRITERIA = {
  STARTS_WITH: "startsWith",
  ENDS_WITH: "endsWith",
  INCLUDES: "includes",
};

class SyllablesDetectorChallenge extends Component {
  constructor(props) {
    super(props);
    this.state = {
      foundWords: 0,
      dataForChallenge: {
        searchedTerm: "",
        wordsByParagraph: [],
        words: [],
        offset: 0,
        totalMeetCriteria: 0,
      },
      points: 0,
    };
  }

  componentDidMount() {
    const dataForChallenge = this.prepareChallenge(this.props);
    const { totalMeetCriteria, searchedTerm } = dataForChallenge;
    this.props.onChallengeLoad(searchedTerm, totalMeetCriteria);
    this.setState({ dataForChallenge });
  }

  prepareChallenge({ text, syllables, searchCriteria }) {
    const searchedTerm = _.sample(syllables.split(" "));
    const wordMeetCriteriaArgs = { searchedTerm, searchCriteria };

    let wordsByParagraph = [];
    let words = [];
    let offset = 0;
    let totalMeetCriteria = 0;

    text.split("<br/>").forEach((paragraph) => {
      let wordsFromParagraph = [];

      paragraph.split(" ").forEach((word, index) => {
        const meetCriteria = this.wordMeetCriteria({
          word,
          ...wordMeetCriteriaArgs,
        });
        const baseWord = {
          index: offset + index,
          word,
        };
        const enrichedWord = Object.assign({}, baseWord, {
          className: "text__word",
          chosenByUser: false,
          meetCriteria,
        });

        wordsFromParagraph.push(baseWord);
        words.push(enrichedWord);
        totalMeetCriteria += meetCriteria;
      });

      offset += wordsFromParagraph.length;
      wordsByParagraph.push(wordsFromParagraph);
    });

    const data = {
      wordsByParagraph,
      words,
      offset,
      totalMeetCriteria,
    };

    const moreData = { searchedTerm, ...data };
    return moreData;
  }

  wordMeetCriteria({ word, searchedTerm, searchCriteria }) {
    const lowerWord = word.toLowerCase();
    if (searchCriteria === SEARCH_CRITERIA.INCLUDES) {
      return (lowerWord.match(new RegExp(searchedTerm, "g")) || []).length;
    } else {
      return lowerWord[searchCriteria](searchedTerm);
    }
  }

  getWordByIndex(wordIndex) {
    const { dataForChallenge } = this.state;
    return dataForChallenge.words[wordIndex];
  }

  changeWordState(wordIndex, newState) {
    const { dataForChallenge } = this.state;
    const words = dataForChallenge.words;
    words[wordIndex] = Object.assign({}, words[wordIndex], newState);
    this.setState({ words });
  }

  onWordHover(e, wordIndex) {
    e.preventDefault();
    const word = this.getWordByIndex(wordIndex);
    if (word.meetCriteria && !word.chosenByUser) {
      this.changeWordState(wordIndex, { className: "text__word_clue" });
    }
  }

  onWordHoverOut(e, wordIndex) {
    e.preventDefault();
    const word = this.getWordByIndex(wordIndex);
    if (!word.chosenByUser) {
      this.changeWordState(wordIndex, { className: "text__word" });
    }
  }

  onWordPressed(e, wordIndex) {
    e.preventDefault();
    const { dataForChallenge } = this.state;
    const words = dataForChallenge.words;
    const { totalMeetCriteria } = dataForChallenge;
    const { meetCriteria, chosenByUser } = words[wordIndex];
    const solvedState = { className: "text__word_solved", chosenByUser: true };

    if (meetCriteria && !chosenByUser) {
      const foundWords = this.state.foundWords + 1;
      this.changeWordState(wordIndex, solvedState);
      this.props.onPlayerSelection(meetCriteria);
      this.setState({ foundWords });

      const solved = foundWords === totalMeetCriteria;
      console.log(foundWords, totalMeetCriteria);
      if (solved) {
        this.props.onChallengeSolved(solved);
      }
    }
  }

  onCountDownComplete() {
    console.log("time is up");
  }

  renderText() {
    const { dataForChallenge } = this.state;
    return dataForChallenge.wordsByParagraph.map((words) => {
      const p = words.map((value) => (
        <em
          key={"word-" + value.index}
          className={dataForChallenge.words[value.index].className}
          onClickCapture={(e) => this.onWordPressed(e, value.index)}
          onMouseOverCapture={(e) => this.onWordHover(e, value.index)}
          onMouseOutCapture={(e) => this.onWordHoverOut(e, value.index)}
        >
          {value.word + " "}
        </em>
      ));
      return <p>{p}</p>;
    });
  }

  render() {
    return (
      <div className="challenge">
        <div className="text">{this.renderText()}</div>
      </div>
    );
  }
}

class SyllablesDetectorGame extends Component {
  constructor(props) {
    super(props);

    const { gameData: data } = props;
    const { difficulty } = data;

    this.settings = difficulty;
    this.state = {
      currentChallengeIndex: 0,
      points: 0,
      wordsToFindPerChallenge: [{ word: "", number: 0 }],
      exit: false,
      challenges: [],
    };
    this.countDownRef = React.createRef();
  }

  componentDidMount() {
    const { gameData: data } = this.props;
    const wordAndNumber = { word: "", number: 0 };
    const challenges = this.prepareChallenges(data);
    const wordsToFindPerChallenge = _.times(
      challenges.length,
      _.constant(wordAndNumber)
    );
    this.setState({ challenges, wordsToFindPerChallenge });
  }

  prepareChallenges(data) {
    const { challengesNumber } = this.settings;
    const stories = data.options;
    const sampleStories = _.sampleSize(stories, challengesNumber);

    return sampleStories.map((element) => ({
      text: element.text,
      syllables: element.syllables,
      searchCriteria: SEARCH_CRITERIA.INCLUDES,
      ref: React.createRef(),
    }));
  }

  onCountDownComplete() {
    const { challenges, currentChallengeIndex } = this.state;
    const ref = challenges[currentChallengeIndex].ref;
    ref.current.onCountDownComplete();

    setTimeout(() => this.goToNextChallenge(currentChallengeIndex), 3000);
  }

  onChallengeLoad(challengeIndex, word, totalWordsToFind) {
    const { wordsToFindPerChallenge } = this.state;
    const { countDown } = this.settings;

    wordsToFindPerChallenge[challengeIndex] = {
      word,
      number: totalWordsToFind,
    };
    this.setState({ wordsToFindPerChallenge });

    if (countDown >= 0) {
      this.countDownRef.current.getApi().start();
    }
  }

  computePoints(multiplierFactor, totalWordsToFind) {
    const { pointsPerChallenge } = this.settings;
    if (totalWordsToFind === 1) {
      return pointsPerChallenge;
    } else {
      const points = _.ceil(pointsPerChallenge / totalWordsToFind);
      const modifiedPoints = points * multiplierFactor;
      return modifiedPoints;
    }
  }

  onPlayerSelection(challengeIndex, multiplierFactor) {
    const { wordsToFindPerChallenge, challenges } = this.state;
    const { ref } = challenges[challengeIndex];
    const { number } = wordsToFindPerChallenge[challengeIndex];

    const newPoints = this.computePoints(multiplierFactor, number);
    ref.current.setState(({ points }) => ({
      points: points + newPoints,
    }));
  }

  goToNextChallenge(callerChallengeIndex) {
    const { challengesNumber } = this.settings;
    const { challenges } = this.state;
    const { ref } = challenges[callerChallengeIndex];
    const { points: newPoints } = ref.current.state;
    console.log(newPoints);
    const nextChallengeIndex = callerChallengeIndex + 1;

    if (nextChallengeIndex < challengesNumber) {
      this.setState(({ points }) => ({
        currentChallengeIndex: nextChallengeIndex,
        points: points + newPoints,
      }));
    } else {
      this.setState(({ points }) => ({
        exit: true,
        points: points + newPoints,
      }));
      const { points: finalPoints } = this.state;
      this.props.notifyPlayCompleted({ points: finalPoints });
    }
  }

  onChallengeSolved(challengeIndex, solved = false) {
    setTimeout(() => this.goToNextChallenge(challengeIndex), 3000);
  }

  render() {
    const {
      currentChallengeIndex,
      wordsToFindPerChallenge,
      points,
      challenges,
    } = this.state;
    const word = wordsToFindPerChallenge[currentChallengeIndex];
    const { countDown } = this.settings;
    const { classes } = this.props;

    const challengesItems = challenges.map((value, index) => (
      <SyllablesDetectorChallenge
        key={"challenge-" + index}
        text={value.text}
        syllables={value.syllables}
        searchCriteria={value.searchCriteria}
        index={index}
        ref={value.ref}
        onChallengeLoad={(word, totalWordsToFind) =>
          this.onChallengeLoad(index, word, totalWordsToFind)
        }
        onPlayerSelection={(multiplierFactor) =>
          this.onPlayerSelection(index, multiplierFactor)
        }
        onChallengeSolved={(solved) => this.onChallengeSolved(index, solved)}
      />
    ));

    return (
      <div className="SyllablesDetectorGame game">
        <Card variant="outlined" className={classes.paper_root}>
          <CardContent className={classes.paper_content_root}>
            <List className={classes.list_root}>
              <ListItem>
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
              </ListItem>
              <Divider component="li" />
              <ListItem>
                <Typography
                  gutterBottom
                  variant="h5"
                  component="h2"
                  className={classes.headline}
                >
                  <p
                    dangerouslySetInnerHTML={{
                      __html:
                        "Lee la historia y encuentra el término o sílaba '<b>" +
                        word.word +
                        "</b>'. Trata de encontrar todo lo que puedas. " +
                        "La cantidad que puedes encontrar es: <b>" +
                        word.number +
                        "</b>",
                    }}
                  ></p>
                </Typography>
              </ListItem>
            </List>
          </CardContent>
        </Card>
        <Card variant="outlined">
          <CardContent>{challengesItems[currentChallengeIndex]}</CardContent>
        </Card>
      </div>
    );
  }
}

const styles = {
  paper_root: {
    padding: "0",
    fontFamily: "Open Sans, sans-serif",
    fontWeight: "bold",
    fontSize: "30px",
  },
  paper_content_root: {
    padding: "10px",
    "&:last-child": {
      padding: "10px",
    },
  },
  list_root: {
    padding: "0",
  },
};

export default withStyles(styles)(SyllablesDetectorGame);
