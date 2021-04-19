"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.play = exports.SoundEffect = void 0;
require("./play-sound");
const play_sound_1 = __importDefault(require("play-sound"));
var SoundEffect;
(function (SoundEffect) {
    SoundEffect["glass"] = "glass";
    SoundEffect["laser"] = "laser";
    SoundEffect["sadTrombone"] = "sadTrombone";
    SoundEffect["scream"] = "scream";
})(SoundEffect = exports.SoundEffect || (exports.SoundEffect = {}));
/**
 * Plays sounds effects but is dependant on a OS level player.
 * For **MacOS** the `afplay` is the default. For other OS's it
 * is `aplay` but if you're on Linux it may be better to use
 * `mpg123` or `mpg321`.
 */
async function play(effect = "glass") {
    const player = play_sound_1.default();
    player.play(`./src/shared/sound/${effect}.m4a`);
}
exports.play = play;
