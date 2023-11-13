export interface Config {
  gitops?: {
    /** @visibility frontend */
    baseUrl?: string;
    readonly?: boolean;
  };
}
