# Library
A Web application made for a library to track the products and manage the library.

For starters: **Please read all ReadMe.md files in this project completely!**
## Rules:

### Teams:
- **Devs:** Arman, Kevin, Dominik
- **Engineers:** Felix, Diana

### Engineers...
...will work in the first week and **must submit** their plans and designs till the end of the week to the Devs.
They are the ones who will plan the entire project (designs, uml, (non)-functional requirements, presentation organisation, personas etc.).

### Devs 
...will work in the second week on the implementation of the backend and frontend based on the result of the Engineers work in the first week.

Each Team will be assigned to tasks on **Jira** by me (Arman), that we will have to complete in the sprint (time of 2 weeks).
**!! Use Jira and its functionalities!!**

#### _Note_ (All Teams): 
Just because you are assigned in the one team, does not mean, that you don't have to care about the other.
Use human sense and provide help where its needed. The software should be running on each computer and **everyone** should be able to understand how it works (not necessarily code-wise but function-wise), so that everyone can present the results if needed.


### Commiting to this project (Dev Team):

As always: please do not randomly push your commits to master.

Create your own dev branch named by your name and submit all changes there. 
Once done, create a pull request to dev. 

If you want your changes to be added to master, you have first to submit them to dev (PR!).

Once your PR has been approved, you can create a pull request from dev to master.

## Organisation (Dev Team):

- **Files:** **c**amelCase, no space or _ in the name.
- **Folder** names should be in **C**amelCase if they are not an abbreviation (example API).
- **Variables:** same as Files. Since we use typescript again, please make use of the typing! 
  - You are allowed to not approve the Pull Request if someone (including myself) does not type correctly.


- **Structure:**
  - Database folder should contain the 
    - liquibase files in a Liquibase folder
    - typeorm-entities files in a folder named Mapper. 
      - Additionally, the Mapper folder should have a folder named Services which will contain .ts files for caching the typeorm entities. 
  - Webpage folder should contain: 
    - one styles.css, 
    - one folder named Assets 
    - one folder named Features. 
      - In the Features folder, there are subfolders with the _FeatureName_ that contains the .html and .ts files.
    - one file named navigation.ts which is used globally for all .html files (adds logic for onButtonClicks).
  - API folder should have 
    - an app.ts, 
    - authenticationMiddleWare.ts and a 
    - Routes folder, that contains all .ts files.
  - Dist Folder will be in the root (where Database, Webpage, API). This is where the compiled .js file will be. 
  - There will be a nodeModules folder (its auto generated).  (Dist and nodeModules should be added to the .gitignore)

- ReadMe.md files will be added in the subfolders, where they are required, in order to start the project without issues.


### Recommended Tools (All Teams):
- Webstorm
- Google Chrome
- MySQL Workbench
- Jira (Please use it! It really makes a lot easier, and we can keep track of our work, assign ourselves to tasks, start sprints etc.)

### Tech stack (Dev Team):
- Liquibase
- TypeORM
- Typescript
- HTML
- CSS
- MySQL


- (React?)