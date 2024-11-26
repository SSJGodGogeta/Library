--liquibase formatted sql
--changeset arman:ar1
-- Insert borrow records with random statuses (BORROWED or NOT_BORROWED)
INSERT INTO borrow_record (borrow_date, return_date, book_copy_book_copy_id, user_user_id, status)
VALUES
-- Kevin borrows a copy of "1984" (book_copy_id = 2)
('2024-11-01 10:30:00', '2024-12-01 10:30:00', 2, 1, 'BORROWED'),
-- Armanbir borrows a copy of "The Great Gatsby" (book_copy_id = 8)
('2024-10-15 14:00:00', '2024-11-15 14:00:00', 8, 2, 'BORROWED'),
-- Dominik borrows a copy of "The Catcher in the Rye" (book_copy_id = 12)
('2024-10-20 16:00:00', '2024-11-20 16:00:00', 12, 3, 'NOT_BORROWED'),
-- Diana borrows a copy of "Pride and Prejudice" (book_copy_id = 15)
('2024-09-05 09:00:00', '2024-10-05 09:00:00', 15, 4, 'BORROWED'),
-- Felix borrows a copy of "The Hobbit" (book_copy_id = 18)
('2024-11-10 11:00:00', '2024-12-10 11:00:00', 18, 5, 'NOT_BORROWED'),
-- Armanbir borrows another copy of "To Kill a Mockingbird" (book_copy_id = 4)
('2024-11-01 13:30:00', '2024-12-01 13:30:00', 4, 2, 'BORROWED'),
-- Diana borrows another copy of "Moby Dick" (book_copy_id = 22)
('2024-11-15 10:00:00', '2024-12-15 10:00:00', 22, 4, 'NOT_BORROWED'),
-- Felix borrows another copy of "War and Peace" (book_copy_id = 25)
('2024-11-18 15:30:00', '2024-12-18 15:30:00', 25, 5, 'BORROWED');

