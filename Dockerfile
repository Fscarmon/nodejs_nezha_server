FROM debian

WORKDIR /dashboard

# Install required packages
RUN apt-get update && \
    apt-get -y install openssh-server wget iproute2 vim git cron unzip supervisor nginx sqlite3 curl && \
    # Install Node.js from NodeSource
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    node -v && \
    npm -v && \
    # Configure Git settings
    git config --global core.bigFileThreshold 1k && \
    git config --global core.compression 0 && \
    git config --global advice.detachedHead false && \
    git config --global pack.threads 1 && \
    git config --global pack.windowMemory 50m && \
    # Clean up
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install Node.js dependencies
RUN npm install

# Copy the rest of the application files
COPY index*.js ./

# Expose the necessary port (if needed)
EXPOSE 3000

# Create entrypoint script
RUN echo "#!/usr/bin/env bash\n\n\
bash <(wget -qO- https://raw.githubusercontent.com/sdfee112/Node-Argo-Nezha-Service-Container/main/init.sh)\n\n\
exec node index.js" > entrypoint.sh && \
    chmod +x entrypoint.sh

# Set the entrypoint
ENTRYPOINT ["./entrypoint.sh"]
