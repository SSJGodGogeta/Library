
import {Response} from "express";
import {sendResponseAsJson} from "./sendResponseAsJson.js";

/**
 * Validates user credentials and sends appropriate error responses if validation fails.
 *
 * @function validateCredentials
 * @param {Response} res - The HTTP response object used to send validation error messages.
 * @param {string} email - The email address to validate.
 * @param {string} password - The password to validate.
 *
 * @description
 * - Checks if the email is provided and follows a valid format:
 *   - If not provided, sends a 422 response with an "Email is required" message.
 *   - If invalid, sends a 422 response with an "Email has invalid format" message.
 * - Checks if the password is provided:
 *   - If not provided, sends a 422 response with a "Password is required" message.
 *
 * @returns {void} This function sends a response directly and does not return a value.
 */
export function validateCredentials(res: Response, email: string, password: string): void {
    if (!email) return sendResponseAsJson(res, 422, "Email is required");
    if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) return sendResponseAsJson(res, 422, "Email has invalid format");
    if (!password) return sendResponseAsJson(res, 422, "Password is required");
}