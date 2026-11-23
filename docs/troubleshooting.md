# Troubleshooting do lab

## TS-001 — Agente "Active" que parou de se autenticar (Duplicate agent name)

**Data:** 2026-11-23 · **Ativo:** linux-endpoint · **Impacto:** o agente deixou de enviar eventos e de receber a configuração centralizada (`agent.conf`)

### Sintomas
- O `agent.conf` foi validado no manager (`verify-agent-conf: OK`), mas o agente não lia o log da API.
- A pasta `/var/ossec/etc/shared/` do agente não tinha `merged.mg`, ou seja, nunca recebeu configuração.
- O log do agente repetia: `ERROR: Duplicate agent name: linux-endpoint`.

### Linha do tempo (UTC)
| Hora | Evento | Evidência |
|---|---|---|
| ~16:16 | Agente 002 perde a conexão depois de um restart | `agent_control -i 002` → Disconnected, último keep alive 16:16 |
| ~16:26 | Cadastro 002 removido no manager | `manage_agents -r 002` |
| 16:27:03 | O agente se cadastra sozinho como 003 e conecta | `Valid key received` / `Connected to the server` |
| ~16:27:3x | Uma ação de correção esvazia o `client.keys`, **apagando a chave válida do 003** | `client.keys` com 0 bytes e mtime 16:27 |
| 16:28+ | O manager recusa o novo cadastro | `wazuh-authd: Agent '003' has not been disconnected long enough to be replaced` |

### Causa raiz
1. Sem chave válida, o agente tenta se cadastrar de novo com o mesmo nome. O manager bloqueia a troca de um agente que esteve conectado há pouco tempo (proteção do `wazuh-authd`).
2. Fator agravante: o PID 1 do container era o `tail`, que não recolhe processos filhos. Cada restart deixava processos **zumbis** (`<defunct>`).

### Correção
- Removido apenas o cadastro bloqueante (003) **sem mexer na chave do agente**. O agente se recadastrou sozinho como 004.
- `init: true` no `docker-compose.yml` (tini como PID 1) → 0 processos zumbis.
- Volume `endpoint-ossec-etc` para manter a chave entre recriações do container.

### Lições
- **Uma correção pode destruir a evidência boa:** ler o log logo depois de cada ação.
- **A linha do tempo com horário, cruzando os logs do agente e do manager, revelou a causa.**
- Status como `Active` e `Pending` são uma foto de um instante; o log mostra o histórico.
