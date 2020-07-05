const set = (key, value) => {
  if (value) {
    localStorage.setItem(key, value);
  } else {
    localStorage.removeItem(key);
  }
};

const get = (key) => {
  return localStorage.getItem(key);
};

const storage = { set, get };

export default storage;
