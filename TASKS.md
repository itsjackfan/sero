## USER TESTING PUSH
- [ ] login validation and account creation logic
- [ ] update insights chatbot to actually remember context
- [ ] rewrite insights chatbot prompt
- [x] seed with real chronotype information 
- [x] ensure that users get a duplicate of a base chronotype that is then ready to be modified and that the app reads from HERE, not from the base chronotype
- [x] store specific users' chronotypes and data in the database and pull from there across the whole app (remove placeholders)
- [ ] codebase refactor and cleanup
## notes (from natalie)
- [ ] minor fix: make the side bar fixed rather than scroll with the main part of home page
- [ ] add due date field to create new task (and make sure it recommends a time window for you to do the task)
- [ ] i think there's some glitch where when you click on a new page it shows a different page for 1 second
- [ ] Also your tasks on calendar disappear/reset if you click onto another page
x
---
## MIDTERM CRIT
JACK -- 1. create data models + set up Supabase + DevOps
2. API endpoints + testing
   *NOTE: APi endpoints are fluid, this is a general schema; also, when you have API endpoints that work, pair program w frontend person to get them locked in/tested/correctly integrated*
    EMILY -- a. signup/account creation
    EMILY -- b. insights GPT wrapper
    JACK (mock/example done tmr Fri 26 Sep if needed) -- c. model + prediction -- repopulates the user's "chronotype row" in the chronotype table
    VIHAAN -- d. click "higher or lower" button + data pushback -- stored as a "column" in the chronotype row (predicted, real, difference) --> training data to retrain model
    EMILY -- e. login*
    whoever gets to it first lol -- f. user/chronotype data fetch
EMILY/VIHAAN -- 3. vibe translate the frontend (do the parts that correspond to ur `API + anything else that you can...just communicate)
