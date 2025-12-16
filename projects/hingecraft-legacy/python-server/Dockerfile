FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY *.py ./
COPY api ./api/
COPY middleware ./middleware/
COPY services ./services/
COPY setup.py ./

# Create python_server package structure (code expects python_server imports)
RUN mkdir -p python_server && \
    cp config.py database.py main.py python_server/ 2>/dev/null || true && \
    cp -r api python_server/ && \
    cp -r middleware python_server/ && \
    cp -r services python_server/ && \
    touch python_server/__init__.py && \
    touch python_server/api/__init__.py && \
    touch python_server/middleware/__init__.py && \
    touch python_server/services/__init__.py

# Install the package in development mode
RUN pip install -e .

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/api/v1/health')"

# Run server
CMD ["uvicorn", "python_server.main:app", "--host", "0.0.0.0", "--port", "8000"]

