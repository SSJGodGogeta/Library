--liquibase formatted sql
--changeset arman:ar1
INSERT INTO user(user_id, email, password, first_name, last_name, imageurl, permissions)
VALUES (1, 'kevinschmidhaeusler@hs-esslingen.de', '$2y$10$KGTYVtHrArATzdVuO8FTjOAkd75SUEuR4LUvdbmPDEEkeRRlRI8ti',
        'Kevin', 'Schmidhausler', null, 'ADMIN'),
       (2, 'armanbirsingh@hs-esslingen.de', '$2y$10$k5vcZKGijVgZW/wzSR9fFeMQ5Hn9Gq8344i/FtsbRp3vroN3L377W', 'Armanbir',
        'Singh', null, 'EMPLOYEE'),
       (3, 'dominikszabo@hs-esslingen.de', '$2y$10$lz90Na4G0yOcfF98ZV03YeTFQh9v1361uWquqBcanv1U7grDbC67a', 'Dominik',
        'szabo', null, 'PROFESSOR'),
       (4, 'dianaschaefer@hs-esslingen.de', '$2y$10$xaNVfahAC84UAMVYbnt9U.Zbns4Mr55izb0mSF/JJc.6nk0Km/QNS', 'Diana',
        'Schaefer', null, 'STUDENT'),
       (5, 'felixau@hs-esslingen.de', '$2y$10$j4RKvU8tHThgkZASj1mVLe54eg7P61duDCWRDtOmV9WXeVuB9r24m', 'Felix', 'Au',
        null, 'STUDENT');
COMMIT;