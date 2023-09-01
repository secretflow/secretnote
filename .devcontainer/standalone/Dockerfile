FROM secretflow/secretflow-lite-anolis8:latest

ARG BUILD_CWD=.devcontainer/standalone
ARG DEFAULT_USER=vscode

RUN yum update -y && \
  yum install -y \
  sudo

# Create a non-root user
# Note: The sudoer group in CentOS is wheel
RUN useradd --create-home --home-dir /home/${DEFAULT_USER} \
  --shell /bin/bash \
  --groups wheel \
  -u 1001 \
  ${DEFAULT_USER}

WORKDIR /home/${DEFAULT_USER}

COPY ${BUILD_CWD}/requirements.txt .
RUN pip install -r requirements.txt

RUN echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc

# Jupyter
EXPOSE 8888
# Ray Dashboard
EXPOSE 8265

USER ${DEFAULT_USER}

# Copy content from .devcontainer/standalone/home into /home/vscode
COPY --chown=vscode:vscode ${BUILD_CWD}/home ./
