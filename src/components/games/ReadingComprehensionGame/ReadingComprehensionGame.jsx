import React, { Component } from "react";
import {
  Card,
  CardContent,
  Grid,
  Divider,
  List,
  ListItem,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Button,
} from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import { withStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import Countdown, { zeroPad } from "react-countdown";
import _ from "lodash";

import "./ReadingComprehensionGame.css";

class ReadingComprehensionChallenge extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataForChallenge: {
        text: "",
        questionsToShow: [],
        rightAnswers: [],
        answerState: [],
        answerClassesState: [],
      },
      playerAnswers: [],
      playerAnswersClasses: [],
    };
  }

  componentDidMount() {
    const dataForChallenge = this.prepareChallenge(this.props);
    const { rightAnswers, answerState, answerClassesState } = dataForChallenge;
    this.props.onChallengeLoad(rightAnswers);
    this.setState({
      dataForChallenge,
      playerAnswers: answerState,
      playerAnswersClasses: answerClassesState,
    });
  }

  prepareChallenge({ text, questions }) {
    const textToShow = "<p>" + text.replace(/<br\/>/g, "</p><p>") + "</p>";
    const questionsShuffled = _.shuffle(questions);
    let questionsToShow = [];
    let rightAnswers = [];

    const rightAnswerCheck = (question) => (answer) =>
      question.right_answer === answer;

    questionsShuffled.forEach((question) => {
      const answersShuffled = _.shuffle(question.answers);
      const q = {
        question: question.question,
        answers: answersShuffled,
      };
      questionsToShow.push(q);

      const answerCheck = rightAnswerCheck(question);
      const rightAnswerIndex = answersShuffled.findIndex(answerCheck);
      rightAnswers.push(rightAnswerIndex);
    });

    const answerState = _.times(rightAnswers.length, _.constant(-1));
    const answerClassesState = _.times(rightAnswers.length, _.constant(""));
    const data = {
      text: textToShow,
      questionsToShow,
      rightAnswers,
      answerState,
      answerClassesState,
    };

    return data;
  }

  onCountDownComplete() {
    console.log("time is up");
  }

  onAnswerSelection(e, questionIndex) {
    e.preventDefault();
    const answerIndex = Number(e.target.value);
    const { playerAnswers } = this.state;
    playerAnswers[questionIndex] = answerIndex;
    this.setState({
      playerAnswers,
    });
  }

  getDeltaIndexes(array1, array2) {
    let delta = [];
    array1.forEach((e1, index) => {
      if (e1 !== array2[index]) {
        delta.push(e1);
      }
    });
    return delta;
  }

  onFormSubmit(e) {
    e.preventDefault();
    const { playerAnswers, dataForChallenge } = this.state;
    const { rightAnswers } = dataForChallenge;
    const badAnswers = this.getDeltaIndexes(playerAnswers, rightAnswers);
    const numberOfRights = rightAnswers.length - badAnswers.length;

    const solved = badAnswers.length === 0;
    this.props.onChallengeSolved(solved, numberOfRights);
  }

  renderQuestions() {
    const { dataForChallenge, playerAnswers } = this.state;
    const { questionsToShow } = dataForChallenge;
    const { classes } = this.props;

    return questionsToShow.map(({ question, answers }, qIndex) => (
      <div>
        <FormControl component="fieldset">
          <FormLabel component="legend">
            <p>{question}</p>
          </FormLabel>
          <RadioGroup
            aria-label={"question-" + qIndex}
            name={"question-" + qIndex}
            onChangeCapture={(e) => this.onAnswerSelection(e, qIndex)}
            value={playerAnswers[qIndex]}
          >
            {answers.map((answer, aIndex) => (
              <FormControlLabel
                className={classes.formcontrol_label_root}
                value={aIndex}
                control={<Radio />}
                label={answer}
              />
            ))}
          </RadioGroup>
        </FormControl>
      </div>
    ));
  }

  render() {
    const { dataForChallenge } = this.state;
    const { text } = dataForChallenge;
    return (
      <div className="challenge">
        <div className="text" dangerouslySetInnerHTML={{ __html: text }}></div>
        <Card variant="outlined">
          <CardContent>
            <div>
              <p>Ahora, responde las siguientes preguntas:</p>
              <form onSubmit={(e) => this.onFormSubmit(e)}>
                {this.renderQuestions()}
                <br />
                <Button type="submit" variant="outlined" color="primary">
                  Envía tus respuestas
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
}

class ReadingComprehensionGame extends Component {
  constructor(props) {
    super(props);

    const { gameData: data } = props;
    const { difficulty } = data;

    this.settings = difficulty;

    this.state = {
      currentChallengeIndex: 0,
      points: 0,
      challengesDone: [],
      challenges: [],
      questionsToAnswerPerChallenge: [],
      exit: false,
    };
    this.countDownRef = React.createRef();
  }

  componentDidMount() {
    const { gameData: data } = this.props;
    const challenges = this.prepareChallenges(data);
    const questionsToAnswerPerChallenge = _.times(
      challenges.length,
      _.constant(0)
    );

    this.setState({ challenges, questionsToAnswerPerChallenge });
  }

  prepareChallenges(data) {
    const { challengesNumber } = this.settings;
    const stories = data.options;
    const sampleStories = _.sampleSize(stories, challengesNumber);

    return sampleStories.map((element) => ({
      text: element.text,
      questions: element.questions,
      ref: React.createRef(),
    }));
  }

  onChallengeLoad(challengeIndex, questionsToAnswer) {
    const { questionsToAnswerPerChallenge } = this.state;
    questionsToAnswerPerChallenge[challengeIndex] = questionsToAnswer.length;
    this.setState({ questionsToAnswerPerChallenge });

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

  computePoints(numberOfRights, numberOfQuestions) {
    const { pointsPerChallenge } = this.settings;
    const points = _.ceil(pointsPerChallenge / numberOfQuestions);
    const modifiedPoints = points * numberOfRights;
    return modifiedPoints;
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

  onChallengeSolved(challengeIndex, solved = false, numberOfRights) {
    const { questionsToAnswerPerChallenge } = this.state;
    const numberOfQuestions = questionsToAnswerPerChallenge[challengeIndex];
    const newPoints = this.computePoints(numberOfRights, numberOfQuestions);
    this.setState(({ points }) => ({
      points: points + newPoints,
    }));
    setTimeout(() => this.goToNextChallenge(challengeIndex), 3000);
  }

  render() {
    const { currentChallengeIndex, points, challenges, exit } = this.state;
    const { countDown } = this.settings;
    const { classes } = this.props;

    const challengesItems = challenges.map((value, index) => (
      <ReadingComprehensionChallenge
        key={"challenge-" + index}
        text={value.text}
        questions={value.questions}
        index={index}
        ref={value.ref}
        onChallengeLoad={(questionToAnswer) =>
          this.onChallengeLoad(index, questionToAnswer)
        }
        onChallengeSolved={(solved, numberOfRights) =>
          this.onChallengeSolved(index, solved, numberOfRights)
        }
        classes={classes}
      />
    ));

    return (
      <React.Fragment>
        {!exit && (
          <div className="ReadingComprehensionGame game">
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
                    <Alert severity="info">
                      <p
                        dangerouslySetInnerHTML={{
                          __html: "Lee la historia y responde las preguntas",
                        }}
                      ></p>
                    </Alert>
                  </ListItem>
                </List>
              </CardContent>
            </Card>
            <Card variant="outlined">
              <CardContent>
                {challengesItems[currentChallengeIndex]}
              </CardContent>
            </Card>
          </div>
        )}
      </React.Fragment>
    );
  }
}

const defaultStyles = { fontFamily: "Open Sans, sans-serif" };
const styles = {
  paper_root: {
    padding: "0",
    fontWeight: "bold",
    fontSize: "30px",
    ...defaultStyles,
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
  formcontrol_label_root: {
    ...defaultStyles,
  },
  radio_root: {
    "&$checked": {
      color: green[600],
    },
  },
};

export default withStyles(styles)(ReadingComprehensionGame);
