#!/usr/bin/env python3
"""
Simple test script for the Gemini wrapper.
Run this to test if the wrapper is working correctly.
"""

import os
from gemini_wrapper import GeminiWrapper

def test_gemini_wrapper():
    """Test the Gemini wrapper functionality."""
    print("Testing Gemini wrapper...")
    
    # Check if API key is set
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        print("ERROR: GOOGLE_API_KEY environment variable not set")
        print("Please set your Google API key: export GOOGLE_API_KEY='your_key_here'")
        return False
    
    try:
        # Initialize wrapper
        gemini = GeminiWrapper()
        print("SUCCESS: Gemini wrapper initialized successfully")
        
        # Test simple generation
        test_prompt = "Explain how AI works in a few words"
        print(f"Testing with prompt: '{test_prompt}'")
        
        response = gemini.generate_content(test_prompt)
        print(f"SUCCESS: Response received: {response}")
        
        return True
        
    except Exception as e:
        print(f"ERROR: Error testing Gemini wrapper: {str(e)}")
        return False

if __name__ == "__main__":
    success = test_gemini_wrapper()
    if success:
        print("\nSUCCESS: Gemini wrapper test completed successfully!")
    else:
        print("\nERROR: Gemini wrapper test failed!")
