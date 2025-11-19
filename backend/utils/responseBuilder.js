/**
 * Success Response
 * @param {object} res - Express Response object
 * @param {string} message - Success message
 * @param {object} data - Response payload
 * @param {number} status - HTTP status code
 */
export const successResponse = (
  res,
  message = "Success",
  data = {},
  status = 200
) => {
  return res.status(status).json({
    success: true,
    message,
    data,
  });
};

/**
 * Error Response
 * @param {object} res - Express Response object
 * @param {string} message - Error message
 * @param {number} status - HTTP status code
 * @param {array|object} errors - Extra error details
 */
export const errorResponse = (
  res,
  message = "Error occurred",
  status = 500,
  errors = []
) => {
  return res.status(status).json({
    success: false,
    message,
    errors,
  });
};
