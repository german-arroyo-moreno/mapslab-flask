FROM nvidia/cudagl:11.4.2-base

# --------------------------------------------------------------
#                ARGUMENTS AND LOCAL VARIABLES
# --------------------------------------------------------------
# Local path with the source code
ARG SRC_PATH="./maplab-core"
# Local path to glew
ARG GLEW_PATH="./glew-lib"
# Destination path to the server
ARG SERVER_PATH="/mnt/server"
# Destination path in the container storage
ARG BIN_PATH="$SERVER_PATH/maplab-core"
# Server Location
ARG SERVER_LOCATION="Europe/Berlin"
# --------------------------------------------------------------


# --------------------------------------------------------------
#                      INSTALLER
# --------------------------------------------------------------

RUN apt-get update
RUN apt-get -y upgrade

# --------------------------------------------------------------
#               INSTALLATION OF REQUIREMENTS
# --------------------------------------------------------------

ENV TZ="$SERVER_LOCATION"
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

RUN apt-get update && apt-get install -y --no-install-recommends \
    g++ \
    make && \
    rm -rf /var/lib/apt/lists/*

RUN apt-get update && apt-get install -y --no-install-recommends \
    libegl1-mesa-dev \
    libglu1-mesa-dev

RUN apt-get update && apt-get install -y --no-install-recommends \
    libjpeg-dev \ 
    libpng-dev \
    libtiff-dev \ 
    libopencv-dev

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl

RUN mkdir -p "$BIN_PATH"
COPY "$SRC_PATH" "$BIN_PATH"

# COPY "$GLEW_PATH"/glew-2.1.0.tgz /tmp/glew-2.1.0.tgz
# RUN cd "$BIN_PATH" && tar xfz /tmp/glew-2.1.0.tgz
RUN cd "$BIN_PATH" && \
    curl -L  "https://github.com/nigels-com/glew/releases/download/glew-2.1.0/glew-2.1.0.tgz" | tar zx
COPY "$GLEW_PATH"/Makefile.glew "$BIN_PATH"/glew-2.1.0/Makefile
RUN cd "$BIN_PATH"/glew-2.1.0 && make -j4 install
ENV LD_LIBRARY_PATH=LD_LIBRARY_PATH:"$BIN_PATH"/glew-2.1.0/lib/

RUN cd "$BIN_PATH"/ && make -j 10

# --------------------------------------------------------------
#                  SERVER
# --------------------------------------------------------------

RUN mkdir -p "$SERVER_PATH"

WORKDIR "$SERVER_PATH"

# RUN apt-get update && apt-get install -y --no-install-recommends \
#     python3 \
#     python3-flask \
#     python3-pil

# RUN apt-get update && apt-get install -y --no-install-recommends \
#     rsync
