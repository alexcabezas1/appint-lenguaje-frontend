import { getAxiosClient, tokenName } from "./shared/utils";
import { GameNotFoundError, UnknownError } from "./shared/errors";
import storage from "./shared/storage";

export const getGame = async ({ slug, difficulty }) => {
  const api = getAxiosClient();
  const url = `/games/${slug}/difficulty/${difficulty}`;

  try {
    const response = await api.get(url);
    storage.set(tokenName, response.headers[tokenName]);
    return response.data.game;
  } catch (err) {
    const { response } = err;
    const { data, status } = response;

    if (status === 404) {
      if (data.message === GameNotFoundError.message) {
        throw new GameNotFoundError();
      } else {
        throw new UnknownError();
      }
    }
  }
};

export const getRanking = async ({ slug }) => {
  const api = getAxiosClient();
  const url = `/games/${slug}/ranking`;

  try {
    const response = await api.get(url);
    return response.data.ranking;
  } catch (err) {
    const { response } = err;
    const { data, status } = response;

    if (status === 404) {
      if (data.message === GameNotFoundError.message) {
        throw new GameNotFoundError();
      } else {
        throw new UnknownError();
      }
    }
  }
};
