"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
const otherFramework = async (args) => {
    console.log(chalk_1.default `- Your default framework for unit testing is set to {bold other} which do-devops doesn't know how to work with.`);
};
exports.default = otherFramework;
