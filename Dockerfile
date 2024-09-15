FROM python:3.12-slim

RUN apt update
RUN apt install -y nginx systemctl

EXPOSE 80/tcp

COPY deployment/nginx.conf /etc/nginx/nginx.conf
RUN mkdir -p /usr/share/nginx/logs
RUN systemctl enable nginx

COPY requirements.txt .
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

COPY app/ /app/
COPY deployment/entry.sh /entry.sh

ENTRYPOINT [ "/entry.sh" ]
