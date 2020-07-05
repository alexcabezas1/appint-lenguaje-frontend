class Error {
  constructor(message) {
    this.message = message;
    this.name = "Error";
  }
}

class ApiError extends Error {
  constructor(message) {
    super(message);
    this.source = "api";
  }
}

class UnknownError extends Error {
  static message = "something wrong happened";
  constructor() {
    super(UnknownError.message);
    this.name = "UnknownError";
  }
}

class PlayerAlreadyExistsError extends ApiError {
  static message = "a player with the same name already exists";
  constructor() {
    super(PlayerAlreadyExistsError.message);
    this.name = "PlayerAlreadyExistsError";
  }
}

class UsernameAlreadyExistsError extends ApiError {
  static message = "a user with the same username already exists";
  constructor() {
    super(UsernameAlreadyExistsError.message);
    this.name = "UsernameAlreadyExistsError";
  }
}

class InvalidUsernamePasswordError extends ApiError {
  static message = "invalid username/password";
  constructor() {
    super(UsernameAlreadyExistsError.message);
    this.name = "InvalidUsernamePasswordError";
  }
}

class GameNotFoundError extends ApiError {
  static message = "game not found";
  constructor() {
    super(GameNotFoundError.message);
    this.name = "GameNotFoundError";
  }
}

class PlayerNotFoundError extends ApiError {
  static message = "player not found";
  constructor() {
    super(PlayerNotFoundError.message);
    this.name = "PlayerNotFoundError";
  }
}

export {
  UnknownError,
  PlayerAlreadyExistsError,
  UsernameAlreadyExistsError,
  InvalidUsernamePasswordError,
  GameNotFoundError,
  PlayerNotFoundError,
};
