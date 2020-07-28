# Friends from the Trail Demo Application

This is a demo application meant to be deployed along with [this Salesforce app]().

## Deploy

### Order of operations matters

The Heroku app and Salesforce app have configuration dependencies between each other. From a high level, they need to be deployed and updated in the following order. Detailed instructions are farther below.

1. OAuth with Heroku
1. OAuth with Salesforce
1. Deploy Heroku app.
1. Create Kafka topics
1. Create Heroku Connect add-on (defined in app.json so this should happen as part of above step)
1. Configure Heroku Connect External Objects (i.e. OData interface). Note endpoint URL, username, and password.
1. Deploy Salesforce app. (Use the Heroku External Objects endpoint URL, username, and password.)
1. Configure Heroku Connect (classic) Settings: choose Postgres database, authenticate with Salesforce, and configure mappings between Postgres and Salesforce. (TODO: automate the mapping configuration with a `mappings.json` file exported from a configured Heroku Connect instance)
1. Party 🎉

### Deploy Heroku app

Click the button or manually create an app on Heroku configured as specified in the `app.json` file. The button deploy does this automatically for you.

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/heroku-examples/friends-from-the-trail-demo)

The client files in `app/` will be built along with each deploy.

The following steps are required to configure the deployed application.

### Create Kafka topics

Order doesn't matter for this step; it just needs to be completed before the Heroku app runs.

Kafka topics need to be explicitly created. While Kafka does support auto-creation of topics the first time a new topic name is produced to, Apache Kafka **on Heroku** does not support this. From the Heroku Dashboard or CLI, create two topics: `selfie-topic` and `change-background` (defined in `/config/all.json`). Here's how to create the topics using the CLI.

```sh
heroku kafka:topics:create "selfie-topic"
heroku kafka:topics:create "change-background"
```

### Configure Heroku Connect

**Manually**

1. Open the Heroku Connect web-based management dashboard

    `$ heroku addons:open herokuconnect`
1. Click "Setup Connection"
1. Select the database and click Next
1. Complete OAuth with Salesforce, using the defaults when given any options
1. Configure mappings between Postgres and Salesforce

**TODO**: Automate the last step by exporting a Heroku Connect mappings json file that can then be reused for future deploys.

### Optional region flag

The design contains a flag that will be changed depending on the `REGION` environment variable. The possible values are: `dublin`, `frankfurt`, `oregon`, `sydney`, `tokyo`, `virginia`. If no valid value is set then it will default to a Heroku flag.

## Local Development

This app requires

* Postgres
* Kafka
* S3

See `.env.sample` for the environment variables needed by the app to access Postgres, Kafka, and S3.

You can run Postgres and Kafka locally for development using the `docker-compose.yml` provided in this repo, or you can create development instances of Postgres and Kafka addons managed by Heroku. If you have a stable internet connection and can pay a few dollars per day for Kafka, I recommend the latter.

### Using Heroku addons for Postgres and Kafka

1. Create an empty Heroku app

    `$ heroku create`
1. Create a free Heroku Postgres instance

    `$ heroku addons:create heroku-postgresql:hobby-basic`
1. Create a Apache Kafka on Heroku instance (WARNING: NOT FREE)

    `$ heroku addons:create heroku-kafka:basic-0  # WARNING: THIS COSTS MONEY`
1. Create the Kafka topics

    `$ heroku kafka:topics:create "selfie-topic"`  
    `$ heroku kafka:topics:create "change-background"`
1. Run `heroku kafka:topics` to make sure the topics finished being created. It can take up to a minute. When the topics have been created, run `./bin/write-env` to create a `.env` file containing all the environment variables needed for local development
1. Create a `config/local.json` file with the following.

    ```json
    {
      "db": "${DATABASE_URL}?ssl=true"
    }
    ```

### Using Docker for Postgres and Kafka

1. Run Postgres and Kafka using Docker

    `$ docker-compose up -d`

1. Rename `.env.docker-dev.sample` to `.env`
1. Create a `config/local.json` file with your local database information like this.

    ```json
    {
      "db": {
        "user": "postgres",
        "database": "postgres"
      }
    }
    ```

1. Stop the Docker containers when you are done

    `$ docker-compose down`

### After Postgres and Kafka are running

1. Install dependencies

    `npm install`
1. Run the database migration(s) and add some seed data.

    ```sh
    $ npx knex migrate:latest
    $ npx knex seed:run
    ```

1. Start the app
  `npm start`

## Troubleshooting

* Heroku Kafka CLI commands not working?

    Make sure you have the plugin installed: `$ heroku plugins:install heroku-kafka`

* Having trouble getting Kafka running locally with Docker?
    I used [this article](https://medium.com/better-programming/your-local-event-driven-environment-using-dockerised-kafka-cluster-6e84af09cd95) to get Kafka running locally.

* Need to run CLI commands on Kafka running in Docker?

    Run `docker exec -it kafka bash`. Now you can test sending some messages to Kafka using something like

    ```
    # kafka-console-producer --broker-list localhost:9092 --topic to-do-list --property "parse.key=true" --property "key.separator=:"
    >1:Wash dishes
    >2:Clean bathroom
    >3:Mop living room
    ```

    And then test receiving those messages with something like

    ```
    # kafka-console-consumer --bootstrap-server localhost:9092 --from-beginning --topic to-do-list --property "print.key=true"
    1 Wash dishes
    3 Mop living room
    2 Clean bathroom
    ```
