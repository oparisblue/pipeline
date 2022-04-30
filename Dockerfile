FROM nginx

# Copy files
WORKDIR /usr/app
COPY package.json /usr/app
COPY tsconfig.json /usr/app
COPY src /usr/app/src

# Install node / npm to run the build tasks
RUN apt-get update
RUN apt-get install curl
RUN curl -sL https://deb.nodesource.com/setup_16.x | bash
RUN apt-get install nodejs

# Build the app
RUN npm install
RUN npm run build

# Move the built static app to nginx
RUN rm -rf /usr/share/nginx/html
RUN mv /usr/app/build /usr/share/nginx/html
EXPOSE 80