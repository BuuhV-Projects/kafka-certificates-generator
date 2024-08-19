# Kafka Certificates Generator

O **Kafka Certificates Generator** é uma ferramenta simples e eficiente para gerar certificados SSL de autenticação para clusters Kafka. Com ele, você pode configurar a segurança de suas conexões Kafka utilizando username e password de maneira prática.

## Requisitos

Antes de usar o **Kafka Certificates Generator**, certifique-se de que você possui os seguintes requisitos instalados em sua máquina:

- **Java Keytool**: Necessário para a geração dos certificados. O Keytool é geralmente incluído na instalação do JDK (Java Development Kit).
- **Arquivo `.env`**: O arquivo `.env` deve estar localizado na pasta onde você deseja gerar os certificados. Esse arquivo precisa conter as seguintes variáveis de ambiente:

  ```env
  KAFKA_USERNAME=seu_usuario_kafka
  KAFKA_PASSWORD=sua_senha_kafka

## Como Usar

1. **Instale o Kafka Certificates Generator**:

   Se você ainda não instalou o pacote, faça isso globalmente com o npm:

   ```bash
   npm install -g kafka-certificates-generator
    ```

2. **Configure o Arquivo `.env`**:

   Crie um arquivo `.env` na pasta onde deseja gerar os certificados e adicione as seguintes variáveis de ambiente:

   ```env
   KAFKA_USERNAME=seu_usuario_kafka
   KAFKA_PASSWORD=sua_senha_kafka
    ```
3. **Gere os Certificados**:

   Navegue até a pasta onde o arquivo `.env` está localizado e execute o seguinte comando:

   ```bash
   kafka-certificates-generator
    ```