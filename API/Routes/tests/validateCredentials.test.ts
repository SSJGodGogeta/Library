import { beforeEach, describe, it, expect, vi } from 'vitest';
import { Response } from 'express';
import { validateCredentials } from '../tools/validateCredentials.js';

describe('#validateCredentials', () => {
    let res: Partial<Response>; // Partial makes it easier to mock only the relevant methods

    beforeEach(() => {
        res = {
            status: vi.fn().mockReturnThis(), // Mock for status
            json: vi.fn().mockReturnThis(), // Mock for json
        };
    });

    it('should send error response if email is not provided', () => {
        const email = '';
        const password = 'validPassword123';

        // Test if sendResponseAsJson is called with the correct error message
        validateCredentials(res as Response, email, password);

        expect(res.status).toHaveBeenCalledWith(422); // Check if the status code 422 is set
        expect(res.json).toHaveBeenCalledWith({
            message: 'Email is required',
            entities: null,
        });
    });

    it('should send error response if email format is invalid', () => {
        const email = 'invalid-email-format';
        const password = 'validPassword123';

        validateCredentials(res as Response, email, password);

        expect(res.status).toHaveBeenCalledWith(422); // Check the status code
        expect(res.json).toHaveBeenCalledWith({
            message: 'Email has invalid format',
            entities: null,
        });
    });

    it('should send error response if password is not provided', () => {
        const email = 'valid@example.com';
        const password = '';

        validateCredentials(res as Response, email, password);

        expect(res.status).toHaveBeenCalledWith(422); // Check the status code
        expect(res.json).toHaveBeenCalledWith({
            message: 'Password is required',
            entities: null,
        });
    });

    it('should not send any response if both email and password are valid', () => {
        const email = 'valid@example.com';
        const password = 'validPassword123';

        // No response should be sent
        validateCredentials(res as Response, email, password);

        // Check that sendResponseAsJson is not called
        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
    });
});