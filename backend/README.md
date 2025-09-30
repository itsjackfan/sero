# Sero Backend

Backend API for the Sero chronotype and energy tracking application.

## Setup

1. Install dependencies:

```bash
pip install -e .
```

2. Set your Google API key:

```bash
export GOOGLE_API_KEY="your_google_api_key_here"
```

3. Test the Gemini wrapper:

```bash
python test_gemini.py
```

4. Run the server:

```bash
python main.py
```

The API will be available at `http://localhost:8000`

## API Endpoints

- `GET /` - Root endpoint
- `GET /health` - Health check
- `POST /chat` - Chat with Gemini

### Chat Endpoint

Send a POST request to `/chat` with JSON body:

```json
{
  "message": "Your message here",
  "model": "gemini-2.5-flash"
}
```

Response:

```json
{
  "response": "Gemini's response",
  "success": true
}
```

## Environment Variables

- `GOOGLE_API_KEY` - Your Google API key for Gemini access
