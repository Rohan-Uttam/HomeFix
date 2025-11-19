// backend/utils/loggerUtil.js
import logger from "../config/logger.js";

/**
 * Wrap logger for app-wide usage
 */
export const logInfo = (message) => logger.info(message);
export const logError = (message) => logger.error(message);
export const logWarn = (message) => logger.warn(message);
