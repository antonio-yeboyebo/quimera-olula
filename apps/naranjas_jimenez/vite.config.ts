/// <reference types="vitest" />
/// <reference types="vite/client" />

import { mergeConfig } from "vite";
import config from "../../vite.config.ts";

export default mergeConfig(config, {
    resolve: {
        alias: {
            '#': '@olula/ctx',
        }
    },
    test: {
        setupFiles: ["../../setupTests.ts"]
    }
});