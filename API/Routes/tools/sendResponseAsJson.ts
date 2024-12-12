
import {Response} from "express";
/**
 * Sends a JSON response to the client.
 *
 * @param {Response} res - The response object from the Express framework.
 * @param {number} code - The HTTP status code to send.
 * @param {string} message - A message describing the response.
 * @param {any} [entities=null] - Additional data or entities to include in the response body (optional).
 *
 * @example
 * // Example usage in an Express route:
 * app.get('/example', (req, res) => {
 *     sendResponseAsJson(res, 200, 'Request successful', { id: 1, name: 'Example' });
 * });
 */
export function sendResponseAsJson(res: Response, code: number, message: string, entities: any = null) {
    if (!res.headersSent) res.status(code).json({
        message: message,
        entities: entities
    });
}