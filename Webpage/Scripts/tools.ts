function getStarImageName(
    starIndex: number,
    averageRating: number | undefined
): string {
    if ((averageRating ?? 0) >= starIndex) return "Full_Star_Yellow.png";
    if ((averageRating ?? 0) <= starIndex - 1) return "Empty_Star_Yellow.png";
    return "Half_Star_Yellow.png";
}

function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}