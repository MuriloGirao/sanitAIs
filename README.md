# 🩺 SanitAIs — Agendamento Inteligente via WhatsApp

> **SanitAIs** é uma aplicação que ajuda clínicas de pequeno porte a gerenciar consultas médicas de forma prática e acessível.  
> Pacientes interagem com um **bot no WhatsApp** para marcar, confirmar ou cancelar consultas, enquanto a recepção visualiza e organiza tudo em um **painel web simples**.

---

## 🚀 Visão Geral

Clínicas menores enfrentam dificuldades em gerenciar agendamentos, pois dependem de ligações telefônicas e planilhas manuais.  
O **SanitAIs** resolve esse problema ao automatizar:

- **Agendamento direto via WhatsApp** (sem instalar apps extras).
- **Confirmação e lembretes automáticos** 48h e 24h antes da consulta.
- **Cancelamento e reagendamento** de forma rápida.
- **Painel web para recepção**, onde a equipe acompanha e gerencia a agenda em tempo real.

---

## 🧩 Componentes

### 🤖 Bot WhatsApp
- Canal de interação com o paciente.  
- Implementado via **Twilio/360Dialog/Zenvia**.  
- Conecta-se ao backend por meio de **webhooks**.  

### 🖥️ Backend (API REST)
- Orquestra toda a lógica de negócios.  
- Gerencia pacientes, agendamentos, slots e notificações.  
- Envia lembretes automáticos com base na agenda.  

### 🗄️ Banco de Dados
Estrutura inicial:  
- `users` (pacientes e recepção).
- `patients` (detalhes do paciente)
- `appointments` (agendamentos).  
- `slots` (horários disponíveis).  
- `sessions` (controle de conversas no bot).  

### 🌐 Painel Web (Frontend)
- Interface simples para a recepção visualizar, confirmar, cancelar e exportar agendamentos.  
- Acesso via navegador com login seguro.  

---

## ⚙️ Requisitos Funcionais
1. Paciente pode iniciar agendamento pelo WhatsApp.  
2. Bot deve oferecer horários disponíveis e registrar escolha.  
3. Paciente pode cancelar ou reagendar consultas.  
4. Sistema envia lembretes automáticos (48h/24h antes).  
5. Recepção acessa painel para visualizar agenda.  
6. Cancelamentos/reforços devem refletir em tempo real no painel.  

---

## 📐 Requisitos Não Funcionais
- **Usabilidade:** interação simples e clara, inclusive para pessoas com baixa familiaridade tecnológica.  
- **Disponibilidade:** sistema deve suportar uso contínuo em horário comercial.  
- **Segurança:** armazenamento de dados sensíveis com criptografia.  
- **Performance:** resposta em até 2 segundos em consultas comuns.  
- **Escalabilidade:** possibilidade de adicionar novas funcionalidades (lista de espera, integração com prontuário).  

---

## 🧑‍💻 Stack Tecnológica
- **Backend:** Python/Flask  
- **Banco de Dados:** PostgreSQL
- **Bot WhatsApp:** Twilio, 360Dialog ou Zenvia  
- **Frontend (Painel Web):** React + TailwindCSS
- **Infraestrutura:** Docker (deploy rápido)  

---

## 🏗️ Arquitetura do Sistema

A arquitetura segue uma abordagem **modular e escalável**, composta por quatro principais ambientes:

```mermaid
flowchart TD
    A[Paciente - WhatsApp] -->|Mensagens| B[Bot WhatsApp]
    B --> C[Backend API]
    C --> D[(Banco de Dados)]
    C --> E[Scheduler - Lembretes]
    C --> F[Painel Web - Recepção]

````
