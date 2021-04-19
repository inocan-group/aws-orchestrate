"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const shared_1 = require("../../../shared");
/** handler for the "layers" command */
async function handler(args, opts) {
    const layers = shared_1.findLayersReferencedByFns();
    const layersWithMeta = shared_1.getLayersWithMeta();
    console.log(JSON.stringify({ layers, layersWithMeta }, null, 2));
}
exports.handler = handler;
