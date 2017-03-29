FROM node:7.7.4

WORKDIR /var/lib/maploom

COPY ./ /var/lib/maploom/

RUN apt-get update && apt-get install -y git python nodejs-legacy

RUN npm install npm@latest
RUN npm -g install karma bower grunt-cli --quiet
RUN npm install --quiet
RUN bower install --allow-root

CMD ["grunt", "--watch"]
