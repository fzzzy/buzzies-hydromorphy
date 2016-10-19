FROM markadams/chromium-xvfb

EXPOSE 5000

ENV CHROMEDRIVER_VERSION 2.24

RUN apt-get update && apt-get install -y \
    python3 python3-pip curl unzip libgconf-2-4 nodejs npm

RUN curl -SLO "https://chromedriver.storage.googleapis.com/$CHROMEDRIVER_VERSION/chromedriver_linux64.zip" \
  && unzip "chromedriver_linux64.zip" -d /usr/local/bin \
  && rm "chromedriver_linux64.zip"

WORKDIR /usr/src

ADD src/* /usr/src/
ADD static/* static/

CMD apt-cache search npm
