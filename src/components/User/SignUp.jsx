import React, { Component } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  Button,
  TextField,
  FormControl,
} from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import { signUp } from "../../services";
import _ from "lodash";

class SignUp extends Component {
  constructor(props) {
    super(props);
    this.cleanForm = {
      fullname: "",
      playerName: "",
      username: "",
      password: "",
      passwordConfirmation: "",
      birthdate: "",
      email: "",
    };

    this.state = {
      flash: "",
      form: {
        ...this.cleanForm,
      },
      exit: false,
    };
  }

  resetForm() {
    this.setState({
      form: {
        ...this.cleanForm,
      },
    });
  }

  showFlash(message) {
    this.setState({ flash: message });
    setTimeout(() => this.setState({ flash: "" }), 5000);
  }

  finish(data = {}) {
    this.setState({ exit: true });
    this.props.next(data);
  }

  onBackPressed() {
    this.finish();
  }

  onTextFieldChange(e) {
    e.preventDefault();

    const form = _.merge(this.state.form, {
      [e.target.id]: e.target.value,
    });
    this.setState({ form });
  }

  async onFormSubmit(e) {
    e.preventDefault();

    try {
      const { form } = this.state;

      const player = await signUp(form);
      this.resetForm();
      this.showFlash("Tu jugador fue creado. Ya puedes empezar a jugar.");
      setTimeout(() => this.finish({ logged: true, ...player }), 5000);
    } catch (err) {
      let flash;
      if (err.name === "PlayerAlreadyExistsError") {
        flash =
          "Ya existe un jugador registrado con ese nombre. Intenta con otro.";
      }
      if (err.name === "UsernameAlreadyExistsError") {
        flash =
          "Ya existe un usuario registrado con ese nombre de usuario. Intenta con otro.";
      }
      this.showFlash(flash);
    }
  }

  render() {
    const { classes } = this.props;
    const { flash, form, exit } = this.state;

    return (
      <React.Fragment>
        {!exit && (
          <Card variant="outlined" className={classes.paper_root}>
            <CardHeader
              className={classes.header_root}
              title="Registra tu Jugador"
            />
            <CardContent className={classes.paper_content_root}>
              <form
                className={classes.root}
                onSubmit={(e) => this.onFormSubmit(e)}
              >
                <FormControl variant="outlined">
                  <TextField
                    id="playerName"
                    label="Tu nombre de Jugador"
                    className={classes.textField1}
                    value={form.playerName}
                    onChangeCapture={(e) => this.onTextFieldChange(e)}
                  />
                </FormControl>
                <FormControl variant="outlined">
                  <TextField
                    id="email"
                    label="Email"
                    className={classes.textField1}
                    value={form.email}
                    onChangeCapture={(e) => this.onTextFieldChange(e)}
                  />
                </FormControl>
                <FormControl variant="outlined">
                  <TextField
                    id="fullname"
                    label="Nombre Completo"
                    className={classes.textField2}
                    value={form.fullname}
                    onChangeCapture={(e) => this.onTextFieldChange(e)}
                  />
                </FormControl>
                <FormControl variant="outlined">
                  <TextField
                    id="birthdate"
                    label="Fecha de Nacimiento"
                    type="date"
                    className={classes.textField2}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    value={form.birthdate}
                    onChangeCapture={(e) => this.onTextFieldChange(e)}
                  />
                </FormControl>
                <FormControl variant="outlined">
                  <TextField
                    id="username"
                    label="Usuario"
                    className={classes.textField1}
                    value={form.username}
                    onChangeCapture={(e) => this.onTextFieldChange(e)}
                  />
                </FormControl>
                <FormControl variant="outlined">
                  <TextField
                    id="password"
                    label="Clave"
                    type="password"
                    className={classes.textField1}
                    value={form.password}
                    onChangeCapture={(e) => this.onTextFieldChange(e)}
                  />
                </FormControl>
                <FormControl variant="outlined">
                  <TextField
                    id="passwordConfirmation"
                    label="Confirmacion de Clave"
                    type="password"
                    className={classes.textField1}
                    value={form.passwordConfirmation}
                    onChangeCapture={(e) => this.onTextFieldChange(e)}
                  />
                </FormControl>
                <Button
                  type="button"
                  variant="outlined"
                  color="primary"
                  onClickCapture={(e) => this.onBackPressed(e)}
                >
                  Volver
                </Button>
                <Button type="submit" variant="contained" color="primary">
                  Enviar
                </Button>
                <p>{flash}</p>
              </form>
            </CardContent>
          </Card>
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
    "& > *": {
      margin: 8,
    },
    color: "#9e9e9e",
  },
  header_root: {
    paddingBottom: "0",
  },
  paper_root: {
    maxWidth: 415,
    padding: "0",
    fontWeight: "bold",
    ...defaultStyles,
  },
  paper_content_root: {
    minHeight: 170,
    paddingTop: "0",
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
};

export default withStyles(styles)(SignUp);
