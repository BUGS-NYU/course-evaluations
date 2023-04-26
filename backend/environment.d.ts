declare global {
  namespace NodeJS {
    interface ProcessEnv {
      ATLAS_URI: string;
    }
  }
}

export {};
