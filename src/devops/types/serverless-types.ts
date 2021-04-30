import { IServerlessYaml } from "common-types";

export interface IServerlessBuilder extends IServerlessYaml {
  addPlugin(): void;
}
