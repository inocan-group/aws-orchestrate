import { Observations } from "do-devops";

export interface IServerlessContext {
  /**
   * All of the key AWS environment variables, plus
   * any variables provided by `env.ts` file.
   */
  env: {
    AWS_PROFILE: string;
    AWS_PARTITION: string;
    AWS_STAGE: string;
    AWS_REGION: string;
    AWS_ACCOUNT_ID: string;
    [key: string]: string | number | boolean;
  };
  observations: Observations;

  addPlugin(): void;
}
