# Relatório 001 — Força bruta com login bem-sucedido na lab-api

| Campo | Valor |
|---|---|
| Data/hora | 2026-11-24 07:14:21–07:14:23 BRT (UTC−3) |
| Ativo | linux-endpoint (agente 004) — log da aplicação `/var/log/lab-api/api.log` |
| Alerta | Lab API: possível força bruta — múltiplas falhas de login a partir de 172.21.0.1 (rule.id 100110, nível 10) |
| MITRE ATT&CK | Credential Access — **T1110.001 Password Guessing** |
| Severidade | **Alta** (elevada por causa do login bem-sucedido em seguida) |
| Classificação | **TP malicioso** (simulação autorizada no lab) |
| Escalado para N2? | **Sim** |

## Resumo
O IP 172.21.0.1 fez 7 tentativas de login com senha errada para o usuário `alice` em cerca de 2 segundos e, logo depois, **conseguiu entrar**. Isso indica uma conta possivelmente comprometida por adivinhação de senha.

## Linha do tempo (BRT)
| Horário | Evento | Regra |
|---|---|---|
| 07:14:21.4 | 1ª falha de login — alice | 100101 (nível 5) |
| 07:14:21.5 | 2ª a 4ª falhas — alice | 100101 |
| 07:14:23.4 | 5ª falha → **alerta de força bruta** | 100110 (nível 10) |
| 07:14:23.4 | 6ª e 7ª falhas — alice | 100101 |
| 07:14:23.4 | **Login bem-sucedido — alice** | 100102 (nível 3) |

## Evidências
- `rule.frequency: 5` e `previous_output` do alerta 100110: as falhas que formaram o padrão, todas com `src_ip: 172.21.0.1` e `status: 401`.
- Evento 100102 (`login_success`, alice, 172.21.0.1, status 200) segundos depois.
- Velocidade (7 tentativas em ~2 s): incompatível com digitação humana, o que indica uma ferramenta automatizada.

## Análise
- **O quê:** ataque de dicionário (senhas comuns em sequência) contra uma conta.
- **Quem / Onde:** origem 172.21.0.1 → conta `alice` na lab-api.
- **Correlação:** falhas seguidas de **sucesso do mesmo IP** → a senha foi descoberta.
- **Enriquecimento:** IP privado (RFC 1918), sem reputação pública para consultar. Num ambiente real, verificaria se o IP é interno conhecido (VPN, proxy) ou um host comprometido.

## Decisão
**Escalar.** A falha isolada seria ruído e uma sequência de falhas seria apenas uma tentativa, mas falhas **seguidas de sucesso** indicam um comprometimento provável. O que definiu a urgência foi o que aconteceu **depois** do alerta.

## Escalonamento
- **Para:** N2 / Resposta a Incidentes
- **Motivo:** provável comprometimento de credencial. A contenção (reset de senha, revogação de tokens) está fora do escopo do N1.
- **Ação recomendada:**
  1. Resetar a senha da alice e invalidar os tokens JWT ativos.
  2. Bloquear ou investigar o IP de origem.
  3. Revisar o que a sessão comprometida acessou depois do login (eventos `order_access`).
  4. Avaliar controles: bloqueio da conta após N falhas, rate limiting no `/login` e MFA.
- **Evidências anexadas:** alerta 100110 (com previous_output), evento 100102.

## Detecção e lições
- **Regras:** `detections/lab-api_rules.xml` — 100101 (falha isolada), 100110 (frequência: 5 falhas/60 s, mesmo src_ip), 100102 (sucesso).
- **Lição:** o nível do alerta mostra o padrão; a **urgência** vem da correlação com o que veio depois.
- **Lacuna identificada:** ainda não existe regra que correlacione automaticamente "força bruta + sucesso". Hoje essa correlação depende do analista. Candidata a uma nova regra (caso de uso futuro).
