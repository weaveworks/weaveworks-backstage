export interface Config {
  gitops?: {
    /** @visibility frontend */
    baseUrl?: string;
    /** @visibility frontend */
    readOnly?: boolean;
  };
}
