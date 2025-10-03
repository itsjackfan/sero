## USER TESTING PUSH
- [ ] update insights chatbot to actually remember context
- [ ] rewrite insights chatbot prompt
- [ ] seed with real chronotype information 
- [ ] store specific users' chronotypes and data in the database and pull from there across the whole app (remove placeholders)
- [ ] codebase refactor and cleanup 

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
EMILY/VIHAAN -- 3. vibe translate the frontend (do the parts that correspond to ur API + anything else that you can...just communicate)
