## Basic user info
```python
class User:
    id + PII and authentication information, as well as any integrations that might be needed later on
```

## Chronotype info
```python
class ChronotypeQuiz
    relationally tagged to the user's unique ID; maintains the responses that the user entered to the initial onboarding quiz as well as the originally provided chronotype; for use with LLM context for the insights GPT wrapper; should be quite simple

class Chronotype:
    relationally tagged to the user's unique ID; will be a time-series dataset where at each time point, the row corresponding to the specific user's chronotype will have predicted, actual (aka user input), and difference data
```


