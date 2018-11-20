FROM node:10-stretch

# Create app directory
ARG APP_DIR=/usr/app/gdmn
WORKDIR $APP_DIR

# Set enviroment variables
ENV NODE_ENV=development
ENV NODE_PATH=$APP_DIR
ENV PORT=4000

#RUN \
#    apt-get update && \
#    apt-get install -y \
#        libtommath-dev \
#        && \
#    ln -sf /usr/lib/x86_64-linux-gnu/libtommath.so.1 /usr/lib/x86_64-linux-gnu/libtommath.so.0 && \
#    wget -O firebird.tar.gz "https://github.com/FirebirdSQL/firebird/releases/download/R3_0_4/Firebird-3.0.4.33054-0.amd64.tar.gz" && \
#    tar -xzxf firebird.tar.gz && \
#    cd Firebird-3.0.4.33054-0.amd64 && \
#    ./install.sh -silent
#
#RUN \
#    rm firebird.tar.gz && \
#    rm -rf Firebird-3.0.4.33054-0.amd64
#
EXPOSE $PORT

COPY ./package.json ./yarn.lock ./lerna.json ./
RUN \
    mkdir -p ./packages/gdmn-db                 && \
    mkdir -p ./packages/gdmn-er-bridge          && \
    mkdir -p ./packages/gdmn-grid               && \
    mkdir -p ./packages/gdmn-nlp                && \
    mkdir -p ./packages/gdmn-nlp-agent          && \
    mkdir -p ./packages/gdmn-orm                && \
    mkdir -p ./packages/gdmn-recordset          && \
    mkdir -p ./src/gdmn-back                    && \
    mkdir -p ./src/gdmn-front                   && \
    mkdir -p ./src/gdmn-grid-demo

COPY ./packages/gdmn-db/package.json            ./packages/gdmn-db
COPY ./packages/gdmn-er-bridge/package.json     ./packages/gdmn-er-bridge
COPY ./packages/gdmn-grid/package.json          ./packages/gdmn-grid
COPY ./packages/gdmn-nlp/package.json           ./packages/gdmn-nlp
COPY ./packages/gdmn-nlp-agent/package.json     ./packages/gdmn-nlp-agent
COPY ./packages/gdmn-orm/package.json           ./packages/gdmn-orm
COPY ./packages/gdmn-recordset/package.json     ./packages/gdmn-recordset
COPY ./src/gdmn-back/package.json               ./src/gdmn-back
COPY ./src/gdmn-front/package.json              ./src/gdmn-front
COPY ./src/gdmn-grid-demo/package.json          ./src/gdmn-grid-demo

RUN yarn                && \
    yarn bootstrap

CMD yarn rebuild; yarn start:back

##############################################
#FROM node:10-stretch
#
#ARG APP_DIR=/usr/src/gdmn
#WORKDIR $APP_DIR
#
#COPY ./ ./
#
#RUN \
#    apt-get update && \
#    apt-get install -y \
#        libtommath-dev \
#        && \
#    ln -sf /usr/lib/x86_64-linux-gnu/libtommath.so.1 /usr/lib/x86_64-linux-gnu/libtommath.so.0 && \
#    wget -O firebird.tar.gz "https://github.com/FirebirdSQL/firebird/releases/download/R3_0_4/Firebird-3.0.4.33054-0.amd64.tar.gz" && \
#    tar -xzxf firebird.tar.gz && \
#    cd Firebird-3.0.4.33054-0.amd64 && \
#    ./install.sh -silent
#
#RUN \
#    rm firebird.tar.gz && \
#    rm -rf Firebird-3.0.4.33054-0.amd64
#
#RUN yarn && \
#    yarn bootstrap && \
#    yarn rebuild
#
#EXPOSE 8080
#EXPOSE 4000
#
#CMD [ "yarn", "start:back" ]


#FROM jacobalberty/firebird:3.0.3 as fbclient
#
#RUN ls -l /usr/lib64
#
#FROM node:10-stretch
#
#RUN mkdir -p /usr/local/firebird/lib
#COPY --from=fbclient /usr/local/firebird/lib/libfbclient.so.3.0.3 /usr/local/firebird/lib
#RUN ln -s /usr/local/firebird/lib/libfbclient.so.3.0.3 /usr/lib/libfbclient.so
#
#WORKDIR /usr/src/gdmn
#
#COPY ./ ./
#
#RUN yarn && \
#    yarn bootstrap && \
#    yarn rebuild
#
#EXPOSE 8080
#EXPOSE 4000
#
#CMD [ "yarn", "start:back" ]
