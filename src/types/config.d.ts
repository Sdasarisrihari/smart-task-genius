
interface Config {
  apiKeys: {
    [key: string]: string;
  };
  settings: {
    [key: string]: any;
  };
}

export { Config };
