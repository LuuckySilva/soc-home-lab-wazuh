# SOC Home Lab com Wazuh

Laboratório de Blue Team / SOC N1: SIEM Wazuh em Docker, endpoints Linux e Windows (Sysmon + Active Directory), API Node/Express monitorada, ataques simulados (Atomic Red Team) mapeados no MITRE ATT&CK, relatórios de incidente e automação de triagem (mini-SOAR).

## Estrutura
| Pasta | Conteúdo |
|---|---|
| `lab/` | Arquivos de infraestrutura (Docker Compose, configs) |
| `detections/` | Regras e decoders customizados do Wazuh |
| `reports/` | Relatórios de incidente no formato N1 |
| `automation/` | Scripts do mini-SOAR (enriquecimento + alertas) |
| `docs/` | Arquitetura, playbooks e anotações |

## Status
- [x] Fase 0: ambiente (WSL2 + Docker) e estrutura do repositório
- [ ] Fase 1: Wazuh + agente Linux
