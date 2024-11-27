--liquibase formatted sql
--changeset arman:ar1
INSERT INTO user(user_id, email, password, first_name, last_name, imageurl, permissions) VALUES
(1, 'kevinschmidhaeusler@hs-esslingen.de', 123456789, 'Kevin', 'Schmidhausler', null, 'ADMIN'),
(2, 'armanbirsingh@hs-esslingen.de', 123456789, 'Armanbir', 'Singh', null, 'EMPLOYEE'),
(3, 'dominikszabo@hs-esslingen.de', 123456789, 'Dominik', 'szabo', null, 'PROFESSOR'),
(4, 'dianaschaefer@hs-esslingen.de', 123456789, 'Diana', 'Schaefer', null, 'STUDENT'),
(5, 'felixau@hs-esslingen.de', 123456789, 'Felix', 'Au', null, 'STUDENT');
COMMIT;