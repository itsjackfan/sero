1. create data models
2. API endpoints + testing
   *NOTE: APi endpoints are fluid, this is a general schema; also, when you have API endpoints that work, pair program w frontend person to get them locked in/tested/correctly integrated*
    a. signup/account creation
    b. insights GPT wrapper
    c. model + prediction -- repopulates the user's "chronotype row" in the chronotype table
    d. click "higher or lower" button + data pushback -- stored as a "column" in the chronotype row (predicted, real, difference) --> training data to retrain model
    e. login*
    f. user/chronotype data fetch
3. vibe translate the frontend