interface Config {
  strictMode: boolean;
  devMode: boolean;
  terms?: string[];
}

const config: Config = {
  strictMode: false, // if true, the scraper will stop if it encounters courses that don't have any data
  devMode: true, // if true, the scraper will launch with a headed browser and log additional data
  terms: ["1228"], // if not undefined, the scraper will scrape only these terms. otherwise, it will scrape all terms
};

export default config;
