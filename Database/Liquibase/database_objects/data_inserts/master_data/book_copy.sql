--liquibase formatted sql
--changeset arman:ar1
INSERT INTO book_copy (status, book_book_id)
VALUES
-- Copies for "To Kill a Mockingbird" (book_id = 1)
('AVAILABLE', 1),
('AVAILABLE', 1),
('AVAILABLE', 1),
('NOT_AVAILABLE', 1),
('AVAILABLE', 1),
-- Copies for "1984" (book_id = 2)
('AVAILABLE', 2),
('AVAILABLE', 2),
('NOT_AVAILABLE', 2),
('AVAILABLE', 2),
('AVAILABLE', 2),
('AVAILABLE', 2),
-- Copies for "The Great Gatsby" (book_id = 3)
('AVAILABLE', 3),
('NOT_AVAILABLE', 3),
('AVAILABLE', 3),
-- Copies for "Pride and Prejudice" (book_id = 4)
('AVAILABLE', 4),
('AVAILABLE', 4),
('NOT_AVAILABLE', 4),
('AVAILABLE', 4),
('AVAILABLE', 4),
('AVAILABLE', 4),
('AVAILABLE', 4),
-- Copies for "Moby Dick" (book_id = 5)
('NOT_AVAILABLE', 5),
('NOT_AVAILABLE', 5),
('NOT_AVAILABLE', 5),
('AVAILABLE', 5),
-- Copies for "The Catcher in the Rye" (book_id = 6)
('AVAILABLE', 6),
('AVAILABLE', 6),
('NOT_AVAILABLE', 6),
('AVAILABLE', 6),
('AVAILABLE', 6),
-- Copies for "The Hobbit" (book_id = 7)
('AVAILABLE', 7),
('AVAILABLE', 7),
('AVAILABLE', 7),
('AVAILABLE', 7),
('AVAILABLE', 7),
('AVAILABLE', 7),
('AVAILABLE', 7),
-- Copies for "War and Peace" (book_id = 8)
('NOT_AVAILABLE', 8),
('NOT_AVAILABLE', 8),
('NOT_AVAILABLE', 8),
('NOT_AVAILABLE', 8),
('AVAILABLE', 8),
-- Copies for "The Alchemist" (book_id = 9)
('SOON_AVAILABLE', 9),
('SOON_AVAILABLE', 9),
('SOON_AVAILABLE', 9),
('AVAILABLE', 9),
('AVAILABLE', 9),
-- Copies for "Don Quixote" (book_id = 10)
('NOT_AVAILABLE', 10),
('NOT_AVAILABLE', 10),
('AVAILABLE', 10),
('AVAILABLE', 10),
('AVAILABLE', 10);
