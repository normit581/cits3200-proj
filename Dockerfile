FROM python:3.12-slim

RUN apt update
RUN apt install nginx systemctl -y

EXPOSE 8080/tcp

COPY deployment/nginx.conf /etc/nginx/nginx.conf
RUN mkdir -p /usr/share/nginx/logs

COPY requirements.txt .
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

COPY app/ /app/

COPY deployment/entry.sh .
ENTRYPOINT [ "./entry.sh" ]
