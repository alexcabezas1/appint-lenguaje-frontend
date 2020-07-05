import { getAxiosClient, tokenName } from "./shared/utils";
import {
  UnknownError,
  PlayerAlreadyExistsError,
  UsernameAlreadyExistsError,
  InvalidUsernamePasswordError,
} from "./shared/errors";
import storage from "./shared/storage";

export const signUp = async ({
  fullname,
  playerName,
  username,
  password,
  birthdate,
  email,
}) => {
  const api = getAxiosClient();
  const data = { fullname, playerName, username, password, birthdate, email };

  try {
    const response = await api.post("signup", data);
    storage.set(tokenName, response.headers[tokenName]);
    return response.data.player;
  } catch (err) {
    const { response } = err;
    const { data, status } = response;

    if (status === 400) {
      if (data.message === PlayerAlreadyExistsError.message) {
        throw new PlayerAlreadyExistsError();
      }
      if (data.message === UsernameAlreadyExistsError.message) {
        throw new UsernameAlreadyExistsError();
      }
    } else {
      throw new UnknownError();
    }
  }
};

export const login = async ({ username, password }) => {
  try {
    const api = getAxiosClient();
    const data = { username, password };
    const response = await api.post("login", data);
    storage.set(tokenName, response.headers[tokenName]);
    return response.data.player;
  } catch (err) {
    const { response } = err;
    const { data, status } = response;

    console.log(data, status);

    if (status === 400 || status === 404) {
      if (data.message === InvalidUsernamePasswordError.message) {
        throw new InvalidUsernamePasswordError();
      }
    } else {
      throw new UnknownError();
    }
  }
};

export const logout = () => {
  storage.set(tokenName, null);
};
