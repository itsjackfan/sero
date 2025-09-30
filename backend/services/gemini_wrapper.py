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
import os
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
            api_key = os.getenv("GOOGLE_API_KEY")
            if not api_key:
                raise ValueError("API key must be provided either as parameter or GOOGLE_API_KEY environment variable")
        
        self.client = genai.Client(api_key=api_key)
    
    def generate_content(self, prompt: str, model: str = "gemini-2.5-flash-lite") -> str:
        """
        Generate content using Gemini with minimal thinking budget.
        
        Args:
            prompt: The input prompt for the model
            model: The model to use (default: gemini-2.5-flash-lite)
            
        Returns:
            Generated text response
        """
        try:
            response = self.client.models.generate_content(
                model=model,
                contents=prompt,
                config=types.GenerateContentConfig(
                    thinking_config=types.ThinkingConfig(thinking_budget=0)  # Disables thinking
                ),
            )
            return response.text
        except Exception as e:
            raise Exception(f"Error generating content: {str(e)}")
    
    def chat(self, message: str, model: str = "gemini-2.5-flash-lite") -> str:
        """
        Simple chat interface - alias for generate_content.
        
        Args:
            message: The message to send to the model
            model: The model to use (default: gemini-2.5-flash-lite)
            
        Returns:
            Generated text response
        """
        return self.generate_content(message, model)
