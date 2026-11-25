# Relatório 002 — IDOR na lab-api: exploração, detecção, correção e validação

| Campo | Valor |
|---|---|
| Período | 2026-11-24 12:53 BRT (1º acesso indevido) → 2026-11-25 07:25 BRT (validação da correção) |
| Ativo | lab-api (rota `GET /orders/:id`), monitorada via linux-endpoint (agente 004) |
| Vulnerabilidade | Broken Access Control — **OWASP A01** / **CWE-639** (IDOR) |
| Alertas | 100120 (IDOR concedido, nível 10→12), 100121 (enumeração, nível 8), 100122 (tentativa bloqueada, nível 8) |
| Severidade | **Alta** — exposição de dados de outro usuário |
| Classificação | **TP malicioso** (simulação autorizada no lab) |
| Escalado para N2? | **Sim** (exposição de dados) |

## Resumo
A API verificava **se** o usuário estava autenticado (JWT), mas não **se** o pedido pertencia a ele. Autenticado como `bob`, foi possível ler os pedidos 101 e 102 de `alice` só trocando o ID na URL, e descobrir por enumeração quais pedidos existiam.

## Linha do tempo (BRT)
| Data/hora | Evento | Detecção |
|---|---|---|
| 24/11 12:53:36 | bob lê o pedido 101 (alice) — **dados expostos** | **Nenhuma (falso negativo)**: ainda não havia telemetria nem regra |
| 24/11 12:54:24 | bob enumera os IDs 100–202 → 101, 102 e 201 entregues | Nenhuma (FN) |
| 24/11 ~13:20 | API passa a registrar `cross_user`; regras 100120/100121 criadas | — |
| 24/11 13:25:24 | Ataque repetido | **100120 ×2** (101 e 102) + **100121** (enumeração) |
| 25/11 ~07:20 | Correção implantada: checagem de dono + resposta 404 + log `access_denied` | — |
| 25/11 07:25:22 | Ataque repetido após a correção | **100122 ×2** (bloqueado) + **100121**; **nenhum 100120** |

## Evidências
- Log antes da correção: `"event":"order_access","user":"bob","resource_owner":"alice","status":200`.
- Log depois da correção: `"event":"access_denied","user":"bob","resource_owner":"alice","status":404`.
- Teste de não regressão: a dona (alice) continua acessando o pedido 101 normalmente.

## Análise
- **Causa raiz:** falta de **autorização em nível de objeto**. A autenticação (quem é você) existia; a autorização (o que você pode acessar) não.
- **Por que houve falso negativo:** o log original não indicava se o acesso era a um recurso de outro usuário, e as regras do Wazuh não comparam dois campos do mesmo evento. A detecção só foi possível depois de **melhorar a telemetria** da aplicação (campo `cross_user`). Ligação com o **OWASP A09** (falhas de log e monitoramento).

## Decisão
**Escalar.** Os dados de um usuário foram expostos a outro. Num ambiente real, caberia avaliação jurídica e de privacidade (LGPD) sobre os dados expostos.

## Correção aplicada (AppSec)
1. **Checagem de dono** na rota `/orders/:id` antes de devolver o recurso.
2. **Resposta 404 (e não 403)** para pedidos alheios: o atacante não consegue distinguir "não existe" de "não é seu", e a enumeração deixa de revelar informação.
3. **Log `access_denied`** para o SOC (a verdade fica no log interno, nunca na resposta).
4. **Detecção de regressão:** a regra 100120 (nível 12) continua ativa. Se a falha voltar, o alerta dispara.

## Detecção e lições
- **Regras:** `detections/lab-api_rules.xml` — 100120, 100121 (`if_matched_group order_miss` + `same_user`) e 100122.
- **Lições:**
  - O SIEM só detecta o que o log deixa enxergar.
  - O período entre a exploração e a detecção (FN) é o risco real.
  - Revelar o mínimo para o atacante e o máximo para o defensor.
