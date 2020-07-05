import nconf from "nconf";

const defaultConfig = {
  node_env: "development",
  api: {
    url: "http://localhost:9090/api",
  },
};

function config() {
  nconf.argv();
  nconf.env({ separator: "_", lowerCase: true });
  nconf.defaults(defaultConfig);

  return nconf;
}

export default config;
