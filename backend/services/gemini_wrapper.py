"""
The frontend can make POST requests to http://localhost:8000/chat with:

{
  "message": "What should I do to improve my energy levels?",
  "model": "gemini-2.5-flash"
}

Then it gets back
{
  "response": "Gemini's response here",
  "success": true
}

@vihaan and jack, don't forget to set you environment variables. for now don't worry about it i have the key
"""


from google import genai
from google.genai import types
from backend.config import settings
from typing import Optional

class GeminiWrapper:
    """Simple wrapper for Google Gemini API with minimal thinking budget."""
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize the Gemini wrapper.
        
        Args:
            api_key: Google API key. If None, will try to get from environment variable GOOGLE_API_KEY
        """
        if api_key is None:
            api_key = settings.google_api_key
            if not api_key:
                raise ValueError("API key must be provided either as parameter or GOOGLE_API_KEY environment variable")
        
        self.client = genai.Client(api_key=api_key)
    
    def generate_content(self, prompt: str, model: str = "gemini-2.5-flash") -> str:
        """
        Generate content using Gemini with minimal thinking budget.
        
        Args:
            prompt: The input prompt for the model
            model: The model to use (default: gemini-2.5-flash)
            
        Returns:
            Generated text response
        """
        try:
            response = self.client.models.generate_content(
                model=model,
                contents=prompt,
                config=types.GenerateContentConfig(
                    system_instruction="""
<ROLE>
You are a helpful productivity assistant that works with the user track their productivity and energy levels.

<CONTEXT>
-   User profile:

    -   User's chronotype is a Lion.

    -   User energy data:


-   User persona:
    
    -   Name: Jack Fan

    -   Age: 19

    -   Role: Marketing Analyst at a mid-sized tech company

    -   Background: Recent MBA graduate with 3 years of work experience

    -   Goals: Seeking promotion to Senior Marketing Manager within the next 12 months

    -   Challenges: Struggles with afternoon energy dips, difficulty prioritizing tasks, and maintaining focus during long meetings

    -   Work style: Prefers structured schedules, responds well to data-driven insights, values efficiency and clear metrics

    -   Personality: Ambitious, detail-oriented, slightly perfectionist, open to trying new productivity methods

<STYLE_GUIDELINES>

-   **ALWAYS** be concise and to the point.

-   Do NOT use Markdown formatting or bullet points. Speak as if you're having a conversation with the user over a chat platform.

-   Be cordial and professional, but relatable to the average user. Do NOT narrate at the user; TALK to the user instead.

<INSTRUCTION>
                    """,
                    thinking_config=types.ThinkingConfig(thinking_budget=0)  # Disables thinking
                ),
            )
            return response.text
        except Exception as e:
            raise Exception(f"Error generating content: {str(e)}")
    
    def chat(self, message: str, model: str = "gemini-2.5-flash") -> str:
        """
        Simple chat interface - alias for generate_content.
        
        Args:
            message: The message to send to the model
            model: The model to use (default: gemini-2.5-flash)
            
        Returns:
            Generated text response
        """
        return self.generate_content(message, model)


"""



"""