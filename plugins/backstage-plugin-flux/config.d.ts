/**
 * Represents the configuration for the Plugin.
 */
export interface Config {
  gitops?:
  | {
    /**
     * (Required) The baseUrl of a Weave GitOps server to link to.
     */
    baseUrl: string;
  }
  | Record<
    string,
    {
      /**
       * (Required) The baseUrl of a Weave GitOps server to link to.
       */
      baseUrl: string;
    }
  >;
}
