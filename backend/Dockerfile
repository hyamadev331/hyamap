FROM python:latest

# Set image name
LABEL Name=maps Version=0.0.1

# Set working directory
WORKDIR /app

# Copy project files to container
COPY requirements.txt /app

# Install dependencies
RUN pip install -r requirements.txt

