--liquibase formatted sql
--changeset arman:ar1
-- Insert reservation records
INSERT INTO reservation (reservation_date, book_book_id, user_user_id)
VALUES
-- Kevin reserves "The Great Gatsby" (book_id = 3)
('2024-11-20 14:00:00', 3, 1),
-- Armanbir reserves "1984" (book_id = 2)
('2024-11-18 09:30:00', 2, 2),
-- Dominik reserves "To Kill a Mockingbird" (book_id = 1)
('2024-11-15 16:00:00', 1, 3),
-- Diana reserves "War and Peace" (book_id = 8)
('2024-11-22 10:45:00', 8, 4),
-- Felix reserves "Pride and Prejudice" (book_id = 4)
('2024-11-19 13:15:00', 4, 5),
-- Kevin reserves "Moby Dick" (book_id = 5)
('2024-11-25 11:00:00', 5, 1),
-- Armanbir reserves "The Hobbit" (book_id = 7)
('2024-11-24 17:30:00', 7, 2),
-- Diana reserves "The Catcher in the Rye" (book_id = 6)
('2024-11-21 08:45:00', 6, 4);
