--liquibase formatted sql
--changeset arman:ar1
INSERT INTO book (title, description, publisher, author, year, edition, isbn, language_code, total_copies, available_copies, average_rating, times_borrowed, availability)
VALUES
    ('To Kill a Mockingbird', 'A novel about the serious issues of rape and racial inequality.', 'J.B. Lippincott & Co.', 'Harper Lee', 1960, 1, '9780060935467', 'eng', 10, 7, 4.8, 523, 'AVAILABLE'),
    ('1984', 'A dystopian novel set in a totalitarian society ruled by Big Brother.', 'Secker & Warburg', 'George Orwell', 1949, 1, '9780451524935', 'eng', 15, 12, 4.7, 1001, 'AVAILABLE'),
    ('The Great Gatsby', 'A critique of the American Dream set in the Roaring Twenties.', 'Charles Scribner Sons', 'F. Scott Fitzgerald', 1925, 1, '9780743273565', 'eng', 8, 4, 4.4, 356, 'AVAILABLE'),
('Pride and Prejudice', 'A romantic novel that critiques the British class system.', 'T. Egerton', 'Jane Austen', 1813, 1, '9781503290563', 'eng', 12, 10, 4.6, 729, 'AVAILABLE'),
('Moby Dick', 'The saga of Captain Ahab and his relentless pursuit of Moby Dick, the great white whale.', 'Harper & Brothers', 'Herman Melville', 1851, 1, '9781503280786', 'eng', 5, 2, 4.2, 153, 'NOT_AVAILABLE'),
('The Catcher in the Rye', 'A novel about teenage rebellion and alienation.', 'Little, Brown and Company', 'J.D. Salinger', 1951, 1, '9780316769488', 'eng', 7, 5, 4.3, 402, 'AVAILABLE'),
('The Hobbit', 'A fantasy novel about the adventures of Bilbo Baggins.', 'George Allen & Unwin', 'J.R.R. Tolkien', 1937, 1, '9780547928227', 'eng', 9, 6, 4.8, 765, 'AVAILABLE'),
('War and Peace', 'An epic novel that intertwines the lives of individuals with the history of the Napoleonic Wars.', 'The Russian Messenger', 'Leo Tolstoy', 1869, 1, '9781400079988', 'eng', 6, 3, 4.5, 299, 'NOT_AVAILABLE'),
('The Alchemist', 'A philosophical novel that explores finding ones personal legend.', 'HarperOne', 'Paulo Coelho', 1988, 1, '9780061122415', 'eng', 10, 9, 4.6, 892, 'SOON_AVAILABLE'),
    ('Don Quixote', 'The adventures of a nobleman who decides to revive chivalry and right the worlds wrongs.', 'Francisco de Robles', 'Miguel de Cervantes', 1605, 1, '9780060934347', 'eng', 7, 4, 4.1, 217, 'NOT_AVAILABLE');
