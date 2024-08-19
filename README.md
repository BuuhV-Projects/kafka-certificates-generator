# Kafka Certificates Generator

Você pode gerar certificados para o Kafka de forma fácil e rápida com o Kafka Certificates Generator.

Crie certificados de autenticação SSL para o kafka e se conecta com segurança usando username e password.

Você precisa ter o keytools na sua máquina para gerar os certificados.

Você precisa ter um .env na pasta onde deseja instalar com os seguintes campos:

```env
KAFKA_USERNAME=
KAFKA_PASSWORD=
```

Na pasta que deseja gerar os certificados, execute o comando abaixo:

```bash
kafka-certificates-generator
```