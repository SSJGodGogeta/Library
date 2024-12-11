import { getDifferenceInMinutes } from '../tools/getDifferenceInMinutes.js';
import { expect, describe, it } from "vitest";

describe("#getDiffenceInMinutes", () => {

    it("should return 0 if the same date is passed in twice", () => {
       const date1 = new Date(2024, 12, 28);

       expect(getDifferenceInMinutes(date1, date1)).toBe(0);
    });

    it("should return a positive value even if the first date is after the second date", () => {
        const date1 = new Date(2024, 12, 28, 22, 10);
        const date2 = new Date(2024, 12, 28, 22);

        expect(getDifferenceInMinutes(date1, date2)).toBe(10);
    });
});
