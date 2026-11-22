# Relatório 000 — Instalação de pacote no linux-endpoint

| Campo | Valor |
|---|---|
| Data/hora | 2026-11-22 08:25:19 BRT |
| Ativo | linux-endpoint (agente 001, Ubuntu 24.04) |
| Alerta | New dpkg (Debian Package) installed |
| Severidade | Baixa |
| Classificação | **TP benigno** (atividade legítima e esperada) |
| Escalado para N2? | Não |

## Resumo
O agente Wazuh registrou a instalação do pacote `nano` no endpoint Linux do lab.

## Evidências
- `full_log` do alerta: registro do `/var/log/dpkg.log` com o pacote, a versão e o status `installed`.

## Análise
- **O quê:** editor de texto `nano`, uma ferramenta administrativa comum e sem uso ofensivo.
- **Quem/por quê:** instalação feita pelo analista como teste controlado do pipeline agente → manager → dashboard.
- **Correlação:** nenhum outro alerta suspeito no host no mesmo período.

## Decisão
Fechado como TP benigno. Seria escalado se o pacote fosse uma ferramenta ofensiva ou um minerador, se não houvesse autorização ou mudança aprovada, se a instalação fosse fora de horário, ou se viesse junto com outros alertas no host (criação de usuário, conexão de saída anômala).

## Lição
TP significa que o alerta descreveu corretamente um evento real. Não significa necessariamente ameaça.
