# UC-001 — Força bruta no login da API

| Campo | Definição |
|---|---|
| Objetivo | Detectar tentativas automatizadas de adivinhar senhas no `/login` da lab-api |
| Fonte de dados | `/var/log/lab-api/api.log` (JSON), coletado pelo agente do linux-endpoint |
| Lógica | 5 ou mais eventos `login_failure` do mesmo `src_ip` em 60 segundos |
| Regras | 100101 (base: falha isolada, nível 5) → 100110 (frequência, nível 10) |
| MITRE ATT&CK | T1110.001 — Password Guessing (Credential Access) |
| Severidade | Alta (10) |
| Falsos positivos esperados | Usuário que esqueceu a senha; script interno mal configurado repetindo login |
| Como testar | Loop de `curl` com senhas erradas (ver Relatório 001) |
| Resposta | Ver se houve sucesso posterior do mesmo IP → escalar se houver; senão, monitorar ou bloquear conforme a política |
| Limitações | Não detecta *password spraying* (1 senha contra muitas contas, devagar) nem ataque vindo de muitos IPs diferentes |
