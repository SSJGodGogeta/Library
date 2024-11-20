## Database Development Environment Setup
1. Download and install MySQL LTS Community Edition: https://dev.mysql.com/downloads/mysql/
2. Download and install Liquibase: https://www.liquibase.com/download
3. Download and install MySQL Workbench: https://dev.mysql.com/downloads/workbench/
4. Open MySQL Workbench and run the following statements:
```
CREATE SCHEMA scrum_library;
CREATE USER 'scrum_library'@'localhost' IDENTIFIED BY 'Sonntag';
GRANT ALL ON scrum_library.* TO 'scrum_library'@'localhost' WITH GRANT OPTION;
commit;
```
5. In your terminal change to the DatabaseObjects folder and run the command
```
liquibase  --defaultsFile=liquibase/dev.properties update
```
...to create the tables and views from this repository in your newly created MySQL schema.