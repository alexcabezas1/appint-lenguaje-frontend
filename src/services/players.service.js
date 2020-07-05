import { getAxiosClient, tokenName } from "./shared/utils";
import {
  GameNotFoundError,
  PlayerNotFoundError,
  UnknownError,
} from "./shared/errors";
import storage from "./shared/storage";

export const savePlay = async ({ playerId, gameId, difficulty, points }) => {
  const api = getAxiosClient();
  const data = { gameId, difficulty, points };
  const url = `/players/${playerId}/plays`;

  try {
    const response = await api.post(url, data);
    console.log(response);
    storage.set(tokenName, response.headers[tokenName]);
    return response.data.play;
  } catch (err) {
    const { response } = err;
    const { data, status } = response;

    if (status === 404) {
      if (data.message === GameNotFoundError.message) {
        throw new GameNotFoundError();
      }
      if (data.message === PlayerNotFoundError.message) {
        throw new PlayerNotFoundError();
      }
    } else {
      throw new UnknownError();
    }
  }
};
