/**
 *  Send response message
 *
 * @param {object} res - response object
 * @param {number} status - http status code
 * @param {string} statusMessage - http status message
 * @param {object} data - response data
 *
 * @returns {object} returns response
 *
 * @example
 *
 *    response(res, 404, 'error', { message: 'not found'})
*/
export default function (res, status, statusMessage, data) {
  return res.status(status).json({
    status: statusMessage,
    data,
  });
}

