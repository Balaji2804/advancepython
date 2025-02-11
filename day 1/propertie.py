# Use Eclipse Temurin JDK image based on Ubuntu Focal for building the application
FROM eclipse-temurin:17-jdk-focal as builder

# Install updates, jq, and AWS CLI
RUN apt-get update && \
    apt-get install -y jq curl unzip dos2unix && \
    curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" && \
    unzip awscliv2.zip && \
    ./aws/install && \
    rm -rf awscliv2.zip /var/lib/apt/lists/* /aws

# Install Fluent Bit
RUN curl -fsSL https://packages.fluentbit.io/fluentbit.key | gpg --dearmor -o /usr/share/keyrings/fluentbit-archive-keyring.gpg && \
    echo "deb [signed-by=/usr/share/keyrings/fluentbit-archive-keyring.gpg] https://packages.fluentbit.io/ubuntu/focal focal main" | tee /etc/apt/sources.list.d/fluentbit.list && \
    apt-get update && \
    apt-get install -y fluent-bit && \
    ln -sf /opt/fluent-bit/bin/fluent-bit /usr/local/bin/fluent-bit && \
    ln -sf /opt/fluent-bit/bin/fluent-bit /usr/local/bin/td-agent-bit

# Create the working directory
RUN mkdir -p /app

# Set the working directory inside the builder stage
WORKDIR /app

# Copy Maven wrapper and configuration files
COPY .mvn/ .mvn
COPY mvnw pom.xml ./

# Ensure the mvnw script has correct line endings and execute permissions
RUN dos2unix mvnw && chmod +x mvnw

# Install all project dependencies
RUN ./mvnw dependency:resolve
RUN ./mvnw dependency:resolve-plugins

# Copy the project source code
COPY src ./src
COPY start.sh ./src
COPY bootstrap.sh ./src

# Build the project without running tests to reduce build time
RUN ./mvnw package -DskipTests

# Start a new build stage to create a smaller final image
FROM eclipse-temurin:17-jre-focal

# Set the working directory in the final image
WORKDIR /app

# Copy the built artifact from the builder stage
COPY --from=builder /app/target/*.jar ./app.jar

# Install AWS CLI in the runtime image
RUN apt-get update && \
    apt-get install -y curl unzip jq && \
    curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" && \
    unzip awscliv2.zip && \
    ./aws/install && \
    rm -rf awscliv2.zip /var/lib/apt/lists/* /aws

# Install Fluent Bit in the final runtime image
RUN curl -fsSL https://packages.fluentbit.io/fluentbit.key | gpg --dearmor -o /usr/share/keyrings/fluentbit-archive-keyring.gpg && \
    echo "deb [signed-by=/usr/share/keyrings/fluentbit-archive-keyring.gpg] https://packages.fluentbit.io/ubuntu/focal focal main" | tee /etc/apt/sources.list.d/fluentbit.list && \
    apt-get update && \
    apt-get install -y fluent-bit && \
    ln -sf /opt/fluent-bit/bin/fluent-bit /usr/local/bin/fluent-bit && \
    ln -sf /opt/fluent-bit/bin/fluent-bit /usr/local/bin/td-agent-bit

# Copy Fluent Bit configuration file
COPY fluent-bit.conf /etc/fluent-bit/fluent-bit.conf

# Copy only .sh files from the src directory in the builder stage
COPY --from=builder /app/src/*.sh ./

# Ensure scripts have execute permissions
RUN chmod +x ./*.sh

# Set environment variable
ENV ENVIRONMENT=${ENVIRONMENT}
# Add this line to install gettext
RUN apt-get update && apt-get install -y gettext
ENV PATH="/opt/fluent-bit/bin:${PATH}"

# Add a validation script to check log paths
COPY check_logs.sh /usr/local/bin/check_logs.sh
RUN chmod +x /usr/local/bin/check_logs.sh

RUN fluent-bit --version

# Start Fluent Bit and validate log paths before running the application
CMD fluent-bit -c /etc/fluent-bit/fluent-bit.conf & ./bootstrap.sh && ./start.sh
