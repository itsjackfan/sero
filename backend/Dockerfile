# Use UV's official Python image for fast, reproducible installs
FROM ghcr.io/astral-sh/uv:python3.11-bookworm

# Work in a stable path; Cloud Build trigger uses /backend as context
WORKDIR /app/backend

# Copy project metadata first to leverage Docker layer caching
COPY pyproject.toml uv.lock ./

# Install dependencies with uv into a project-local virtualenv
RUN uv sync --frozen --no-dev

# Now copy the backend source
COPY . .

# Make virtualenv and project importable by default
ENV VIRTUAL_ENV=/app/backend/.venv
ENV PATH="$VIRTUAL_ENV/bin:$PATH"
ENV PYTHONPATH=/app

# Default port (Cloud Run/Cloud Build can override via $PORT)
ENV PORT=8000
EXPOSE 8000

# Start the FastAPI app with uvicorn
CMD ["sh", "-c", "uvicorn backend.api.main:app --host 0.0.0.0 --port ${PORT:-8000}"]


