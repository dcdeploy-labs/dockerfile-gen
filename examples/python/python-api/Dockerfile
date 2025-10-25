# Use the official Python runtime as the base image
FROM python:3.11-slim

# Set the working directory in the container
WORKDIR /app

# Copy requirements file
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Set default workers count
ENV DCD_CPU=1

# Define the command to run the application with dynamic workers
CMD gunicorn --bind 0.0.0.0:3000 --workers ${DCD_CPU} --timeout 120 --keep-alive 5 --max-requests 1000 app:app
