FROM python:3.12-slim

EXPOSE 5000/tcp

COPY requirements.txt .
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

COPY app/ /app/

CMD [ "flask", "--app", "app", "run" ]
