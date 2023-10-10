FROM secretflow/secretflow-lite-anolis8:1.1.0b0

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

COPY .devcontainer/network/requirements.txt .
RUN pip install -r requirements.txt
RUN pip install secretnote --index=https://artifacts.antgroup-inc.cn/artifact/repositories/simple-dev/

RUN echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc

# Jupyter
EXPOSE 8888
# Ray Dashboard
EXPOSE 8265

USER ${DEFAULT_USER}

COPY --chown=vscode:vscode .devcontainer/network/home ./
COPY --chown=vscode:vscode examples ./examples
