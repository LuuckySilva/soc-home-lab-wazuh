#!/bin/bash
# Script que roda quando o container sobe
rsyslogd                               # inicia o syslog (gera /var/log/auth.log)
mkdir -p /run/sshd && /usr/sbin/sshd   # inicia o SSH
/var/ossec/bin/wazuh-control start     # inicia o agente Wazuh
exec tail -F /var/ossec/logs/ossec.log # mantém o container vivo e mostra o log do agente
