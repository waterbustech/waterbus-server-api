FROM --platform=arm64 node:20-alpine

# WORKDIR
WORKDIR /app

# COPY
COPY . .

# install dependencies & build
RUN rm -rf node_modules
RUN yarn
RUN yarn build

# run image
CMD [ "yarn", "start:prod" ]