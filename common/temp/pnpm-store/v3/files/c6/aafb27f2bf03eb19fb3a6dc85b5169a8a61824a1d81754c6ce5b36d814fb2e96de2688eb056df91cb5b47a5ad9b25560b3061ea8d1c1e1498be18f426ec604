import { InputQuestion } from "inquirer";
import { Omit } from "common-types";
export declare function inputQuestion(q: Omit<InputQuestion, "type">): {
    type: string;
    default?: any;
    message?: import("inquirer").AsyncDynamicQuestionProperty<string, import("inquirer").Answers>;
    name?: import("inquirer").KeyUnion<import("inquirer").Answers>;
    validate?: (input: any, answers?: import("inquirer").Answers) => string | boolean | Promise<string | boolean>;
    transformer?: (input: any, answers: import("inquirer").Answers, flags: {
        isFinal?: boolean;
    }) => string | Promise<string>;
    filter?: (input: any) => any;
    prefix?: string;
    suffix?: string;
    when?: import("inquirer").AsyncDynamicQuestionProperty<boolean, import("inquirer").Answers>;
};
