/**
 * Determines if a session is expired based on its creation date and the expiration period in days.
 *
 * @param {Date} createdAt - The date when the session was created.
 * @param {Date} currentDate - The current date
 * @param {number} days - The number of days the session is valid.
 * @returns {boolean} `true` if the session is expired, otherwise `false`.
 *
 * @example
 * // Example usage
 * const createdAt = new Date('2024-12-01T10:00:00'); // Session created on December 1, 2024,
 * const expirationDays = 7;
 *
 * const expired = isSessionExpired(createdAt, expirationDays);
 * console.log(expired); // Output: true or false depending on the current date
 */
export function isSessionExpired(createdAt: Date, currentDate: Date, days: number): boolean {
    const expirationTime = createdAt.getTime() + days * 24 * 60 * 60 * 1000; // Add days in milliseconds
    return currentDate.getTime() > expirationTime;
}