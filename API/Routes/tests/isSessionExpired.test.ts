import { isSessionExpired } from '../tools/isSessionExpired.js';
import { expect, describe, it } from "vitest";

describe("#isSessionExpired", () => {
    const currentDate: Date = new Date(2023, 11, 26, 22); // 26.11.2023 22:00 Uhr

    it("should return false if the session is created within the expiration period", () => {
        let createdAt: Date = new Date(2023, 11, 25, 22, 23); // 25.11.2023 22:23 Uhr
        let daysTillExpire: number = 1;

        expect(isSessionExpired(createdAt, currentDate, daysTillExpire)).toBe(false);
    });

    it("should return false if the session is created on the same day and the expiration period is greater than the current day", () => {
        let createdAt: Date = new Date(2023, 11, 26, 22); // 26.11.2023 22:00 Uhr
        let daysTillExpire: number = 3;

        expect(isSessionExpired(createdAt, currentDate, daysTillExpire)).toBe(false);
    });

    it("should return true if the session is created before the expiration period", () => {
        let createdAt: Date = new Date(2023, 11, 24); // 24.11.2023 00:00 Uhr
        let daysTillExpire: number = 1;

        expect(isSessionExpired(createdAt, currentDate, daysTillExpire)).toBe(true);
    });

    it("should return true if the session is created in a previous year and the expiration period is exceeded", () => {
        let createdAt: Date = new Date(2022, 11, 26, 21); // 26.11.2022 21:00 Uhr
        let daysTillExpire: number = 2;

        expect(isSessionExpired(createdAt, currentDate, daysTillExpire)).toBe(true);
    });
});
