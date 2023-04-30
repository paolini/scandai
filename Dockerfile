FROM node:18

# Create app directory
WORKDIR /app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

# If you are building your code for production
RUN npm ci --only=production

# Bundle app source
COPY .next ./.next
COPY entrypoint.sh ./

EXPOSE 3000

CMD [ "./entrypoint.sh" ]
#ENTRYPOINT "tail -f /dev/null"

# To build the image:
#
# $ npm run build
# $ VERSION=$( node -e "console.log(require('./package.json').version)" )
# $ docker build . -t paolini/scandai:$VERSION
# $ docker tag paolini/scandai:$VERSION paolini/scandai:latest
#
# To run the image:
# $ docker-compose -f docker-compose-production.yml up
#
# To push the image:
# $ docker push paolini/scandai
