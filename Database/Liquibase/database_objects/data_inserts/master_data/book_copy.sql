--liquibase formatted sql
--changeset arman:ar1
INSERT INTO book_copy (status, book_book_id)
VALUES
-- Copies for "To Kill a Mockingbird" (book_id = 1)
('NOT_BORROWED', 1),
('NOT_BORROWED', 1),
('NOT_BORROWED', 1),
('BORROWED', 1),
('NOT_BORROWED', 1),
-- Copies for "1984" (book_id = 2)
('NOT_BORROWED', 2),
('NOT_BORROWED', 2),
('BORROWED', 2),
('NOT_BORROWED', 2),
('NOT_BORROWED', 2),
('NOT_BORROWED', 2),
-- Copies for "The Great Gatsby" (book_id = 3)
('NOT_BORROWED', 3),
('BORROWED', 3),
('NOT_BORROWED', 3),
-- Copies for "Pride and Prejudice" (book_id = 4)
('NOT_BORROWED', 4),
('NOT_BORROWED', 4),
('BORROWED', 4),
('NOT_BORROWED', 4),
('NOT_BORROWED', 4),
('NOT_BORROWED', 4),
('NOT_BORROWED', 4),
-- Copies for "Moby Dick" (book_id = 5)
('BORROWED', 5),
('BORROWED', 5),
('BORROWED', 5),
('NOT_BORROWED', 5),
-- Copies for "The Catcher in the Rye" (book_id = 6)
('NOT_BORROWED', 6),
('NOT_BORROWED', 6),
('BORROWED', 6),
('NOT_BORROWED', 6),
('NOT_BORROWED', 6),
-- Copies for "The Hobbit" (book_id = 7)
('NOT_BORROWED', 7),
('NOT_BORROWED', 7),
('NOT_BORROWED', 7),
('NOT_BORROWED', 7),
('NOT_BORROWED', 7),
('NOT_BORROWED', 7),
('NOT_BORROWED', 7),
-- Copies for "War and Peace" (book_id = 8)
('BORROWED', 8),
('BORROWED', 8),
('BORROWED', 8),
('BORROWED', 8),
('NOT_BORROWED', 8),
-- Copies for "The Alchemist" (book_id = 9)
('SOON_AVAILABLE', 9),
('SOON_AVAILABLE', 9),
('SOON_AVAILABLE', 9),
('NOT_BORROWED', 9),
('NOT_BORROWED', 9),
-- Copies for "Don Quixote" (book_id = 10)
('BORROWED', 10),
('BORROWED', 10),
('NOT_BORROWED', 10),
('NOT_BORROWED', 10),
('NOT_BORROWED', 10);
