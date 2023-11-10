# fastify-aws-dynamodb-cache

[![build & release](https://github.com/blastorg/fastify-aws-dynamodb-cache/actions/workflows/release.yaml/badge.svg)](https://github.com/blastorg/fastify-aws-dynamodb-cache/actions/workflows/release.yaml)

Package containing AWS DynamoDB caching plugin, which you can use to use DynamoDB to cache your API responses.

## Requirements

In order to install this package you need at lease Node version 18 installed on your operating system of choice.

Then you need a DynamoDB table set up in your region of choice with the structure matching:

```
  Partition Key: "path" <string>
```

This partition key is used to index the different endpoints which cache is enabled for. This enables the database to do 1:1 lookups, so it runs as fast as possible.

You can also see how we are setting up the table in the `/test/setupDatabase.sh` script, which sets up a locally DynamoDB instance and creates the table inside of the instance.

## Usage

First we need to install the package:

```shell
npm install @blastorg/fastify-aws-dynamodb-cache
```

## How to use it

This packages helps you cache your API response in DynamoDB, which allows your lambda executions to all have access to the same cached responses.

```ts
import Fastify from "fastify";
import { dynamodbCache } from "@blastorg/fastify-aws-dynamodb-cache";

const fastify = Fastify().register(dynamodbCache, {
  dynamoDbRegion: "", // AWS region of your choice.
  dynamoDbAddress: "http://localhost:8000", // Optional! If you are hosting your own instance of Dynamo (locally or cloud), then specify the ip address of the database here.
  tableName: "fastify-dynamodb-cache", // DynamoDB table name
  defaultTTLSeconds: 30, // Default TTL (seconds), which would be used if no TTL is specified on the endpoint.
});

fastify.get(
  "/",
  {
    config: {
      config: {
        cache: {
          cacheEnabled: true, // Set to true if endpoint responses should be cached. If you don't want to cache responses set it to false, or don't specify it.
          ttlSeconds: 10, // Optional! TTL on the cached value
        },
      },
    },
    schema: {},
  },
  async (_, res) => {
    // handler...

    return res.status(200).send({});
  }
);
```

In the example above we initiates the plugin with parameters which is used to connect to the DynamoDB, and in there we also specify a default TTL, which is used as a fallback TTL for endpoints which has caching enabled, but no TTL specified in the endpoint

The endpoint it self is configured, that we specify that we want to enable caching by setting `cacheEnabled` to `true` in the config object. We have also specified a `ttl` in the object, which would override the `defaultTTL`, we have specified when we registered the plugin.

## How does it work?

The logic behind this plugin, is that it makes use of DynamoDB as a serverless and high-speed database, which we can use to cache API responses and then use it as a temporary storage for other APIs running on AWS Lambdas to share the same cache between each lambda container.

This plugin uses two built in hooks in Fastify, `onRequest` and `onSend`.

The `onRequest` hook is fired when a new request is coming in, and there we do a lookup in the database to see if a cached result is stored there, and if the TTL is still (alive / greater then current date).

If it is, then will we return the cached result and skip going through the handler.

If the stored cache response is (outdated / less then current date), then will we "miss" the cache and go to the handler and then do the business logic.

The `onSend` hook is fired when we use the `.send()` function in Fastify. When the hook is ran, we check if we have missed the cache, which means we have been through the handler, because if we have missed the cache, then we need to update the cache in DynamoDB.

If we haven't missed the cache, we have "hit" it. Then we do nothing in the `onSend` hook, because we have already sent the cached value from the `onRequest` hook.

## Development

To contribute and develop further on this package, there is a few things to know about.

This repository contains two projects. One for the source code itself, and the other containing a test server, where you can test the changes you made on a Fastify server.

To build the package/plugin you need to be in the root directory: `fastify-aws-dynamodb-cache` and afterwards can you run the NPM script `npm run pack:local`. You'll need to install the different modules, for the source code. You can do this via npm: `npm install`, when you are in the root directory.

To then install the package and run the test server, you can change directory _cd_ into the `test` folder, where you can run the NPM script `npm run start`. This installs the package which is packaged in a `.tgz` file in the root directory.

After you have changed something in the package again, you'll need to run both `npm run pack:local` and then `npm run start`, to see the latest changes you have made.

## Contributing

This package follows the [Conventional commits](https://www.conventionalcommits.org/en/v1.0.0/) on commit messages. The message should be structure as follows:

```git
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

The common types can be

- build
- chore
- ci
- docs
- feat
- fix
- perf
- refactor
- revert
- style
- test

---
