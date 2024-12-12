/**
 * Calculates the absolute difference in minutes between two Date objects.
 *
 * @param {Date} date1 - The first date object.
 * @param {Date} date2 - The second date object.
 * @returns {number} The absolute difference between the two dates in minutes.
 *
 * @example
 * // Example usage
 * const date1 = new Date('2024-12-05T10:00:00');
 * const date2 = new Date('2024-12-05T10:45:00');
 *
 * const difference = getDifferenceInMinutes(date1, date2);
 * console.log(difference); // Output: 45
 */
export function getDifferenceInMinutes(date1: Date, date2: Date): number {
    const time1 = date1.getTime(); // Convert date1 to a timestamp in milliseconds
    const time2 = date2.getTime(); // Convert date2 to a timestamp in milliseconds

    const diffInMilliseconds = Math.abs(time1 - time2); // Get the absolute difference
    return Math.floor(diffInMilliseconds / (1000 * 60)); // Convert milliseconds to minutes
}