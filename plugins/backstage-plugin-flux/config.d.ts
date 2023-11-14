export interface Config {
  gitops?: {
    /** @visibility frontend */
    baseUrl?: string;
    readOnly?: boolean;
  };
}
