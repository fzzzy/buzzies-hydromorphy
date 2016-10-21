FROM markadams/chromium-xvfb

EXPOSE 5000

ENV CHROMEDRIVER_VERSION 2.24

RUN apt-get update && apt-get install -y \
    python3 python3-pip curl unzip libgconf-2-4 nodejs npm

RUN update-alternatives --install /usr/bin/node node /usr/bin/nodejs 10

RUN curl -SLO "https://chromedriver.storage.googleapis.com/$CHROMEDRIVER_VERSION/chromedriver_linux64.zip" \
  && unzip "chromedriver_linux64.zip" -d /usr/local/bin \
  && rm "chromedriver_linux64.zip"

WORKDIR /usr/src

ADD actors /usr/src/actors/
ADD build /usr/src/build/
ADD src /usr/src/src/
ADD package.json /usr/src/

CMD npm run start
