FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# If data.json doesn't exist, create it
RUN touch data.json

CMD ["python", "server.py"]
