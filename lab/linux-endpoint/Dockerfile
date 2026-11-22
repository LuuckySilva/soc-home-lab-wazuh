# Endpoint Linux do lab: Ubuntu + agente Wazuh + SSH + rsyslog
FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive

# Pacotes base: curl/gnupg (baixar a chave do repositório), SSH (alvo de ataques
# na Fase 4), rsyslog (gera /var/log/auth.log), sudo e procps (ps, top)
RUN apt-get update && apt-get install -y \
      curl gnupg ca-certificates openssh-server rsyslog sudo procps && \
    # Chave e repositório oficial da Wazuh
    curl -s https://packages.wazuh.com/key/GPG-KEY-WAZUH | gpg --dearmor -o /usr/share/keyrings/wazuh.gpg && \
    echo "deb [signed-by=/usr/share/keyrings/wazuh.gpg] https://packages.wazuh.com/4.x/apt/ stable main" \
      > /etc/apt/sources.list.d/wazuh.list && \
    apt-get update && \
    # Agente na MESMA versão do manager, já apontando para ele
    WAZUH_MANAGER="wazuh.manager" WAZUH_AGENT_NAME="linux-endpoint" \
      apt-get install -y wazuh-agent=4.14.10-1 && \
    rm -rf /var/lib/apt/lists/*

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
