# SOC Home Lab com Wazuh

![gitleaks](https://github.com/LuuckySilva/soc-home-lab-wazuh/actions/workflows/gitleaks.yml/badge.svg)

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
- [x] Fase 1: Wazuh + agente Linux

## Detecções implementadas
| Regra | Descrição | MITRE | Nível | Relatório |
|---|---|---|---|---|
| 100101 | Falha de login isolada na lab-api | — | 5 | — |
| 100102 | Login bem-sucedido na lab-api | — | 3 | — |
| 100103 | Token JWT inválido | — | 5 | — |
| 100110 | Força bruta: 5+ falhas do mesmo IP em 60 s | T1110.001 | 10 | [001](reports/001-forca-bruta-api.md) |

## Documentação
- [Rotina de turno N1](docs/rotina-n1.md) · [Modelo de relatório](reports/TEMPLATE.md) · [Troubleshooting](docs/troubleshooting.md) · [Casos de uso](docs/use-cases/)
