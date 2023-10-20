const TRACE_LEVEL = {
    NONE: 0,
    ERROR: 1,
    WARN: 2,
    INFO: 3,
    DEBUG: 4
};

export const logMessage = (...args) => {
    if (process.env.TRACE_LEVEL >= TRACE_LEVEL.DEBUG) {
        console.log(...args);
    }
};

export const logTime = (...args) => {
    if (process.env.TRACE_LEVEL >= TRACE_LEVEL.DEBUG) {
        console.time(...args);
    }
};

export const logTimeEnd = (...args) => {
    if (process.env.TRACE_LEVEL >= TRACE_LEVEL.DEBUG) {
        console.timeEnd(...args);
    }
}

export const logError = (...args) => {
    if (process.env.TRACE_LEVEL >= TRACE_LEVEL.ERROR) {
        console.error(...args);
    }
}
