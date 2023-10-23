# Squid template project

A starter [Squid](https://subsquid.io) project to demonstrate its structure and conventions.
It accumulates [kusama](https://kusama.network) account transfers and serves them via GraphQL API.

## Summary

- [Squid template project](#squid-template-project)
  - [Summary](#summary)
  - [Prerequisites](#prerequisites)
  - [Quickly running the sample](#quickly-running-the-sample)
  - [Public archives for Parachains](#public-archives-for-parachains)
  - [Self-hosted archive](#self-hosted-archive)
  - [Deploy the Squid](#deploy-the-squid)
  - [Project conventions](#project-conventions)
  - [Types bundle](#types-bundle)
  - [Differences from polkadot.js](#differences-from-polkadotjs)
  - [Graphql server extensions](#graphql-server-extensions)

## Prerequisites

* node 16.x
* docker
* npm -- note that `yarn` package manager is not supported

## Quickly running the sample

Example commands below use [sqd](https://docs.subsquid.io/squid-cli/).
Please [install](https://docs.subsquid.io/squid-cli/installation/) it before proceeding.

```bash
# 1. Update Squid SDK and install dependencies
npm run update
npm ci

# 2. Start target Postgres database and detach
sqd up

# 3. Build the project and start the processor
sqd process

# 4. The command above will block the terminal
#    being busy with fetching the chain data, 
#    transforming and storing it in the target database.
#
#    To start the graphql server open a separate terminal
#    and run
sqd serve
```

## Public archives for Parachains

Subsquid provides archive data sources for most parachains, with API playgrounds available at `https://graphql-console.subsquid.io/?graphql_api=<archive_endpoint_url>`.

The list of public archive data source endpoints is also maintained in the `@subsquid/archive-registry` npm package for programmatic access. Use `lookupArchive(<network name>, <lookup filters>)` to look up the archive endpoint by the network name, e.g.

```typescript
processor.setDataSource({
  archive: lookupArchive("kusama", { release: "FireSquid" })
  //...
});
```

To make sure you're indexing the right chain one can additionally filter by the genesis block hash:

```typescript
processor.setDataSource({
  archive: lookupArchive("kusama", { 
    release: "FireSquid", 
    genesis: "0xb0a8d493285c2df73290dfb7e61f870f17b41801197a149ca93654499ea3dafe" 
  }),
  //...
});
```

If the chain is not yet supported, 
please fill out the [form](https://forms.gle/Vhr3exPs4HrF4Zt36) to submit a request.

## Self-hosted archive

To run an archive locally, consult the [substrate-archive-setup repo](https://github.com/subsquid/substrate-archive-setup) and the relevant [documentation page](https://docs.subsquid.io/archives/substrate/self-hosted/).


## Deploy the Squid

After a local run, obtain a deployment key by signing into [Aquarium](https://app.subsquid.io/start) and run 

```sh
npx sqd auth -k YOUR_DEPLOYMENT_KEY
```

Next, inspect the Squid CLI help to deploy and manage your squid:

```sh
npx sqd squid --help
```

For more information, consult the [Deployment Guide](https://docs.subsquid.io/docs/deploy-squid/).

## Project conventions

Squid tools assume a certain project layout.

* All compiled js files must reside in `lib` and all TypeScript sources in `src`. 
The layout of `lib` must reflect `src`.
* All TypeORM classes must be exported by `src/model/index.ts` (`lib/model` module).
* Database schema must be defined in `schema.graphql`.
* Database migrations must reside in `db/migrations` and must be plain js files.
* `squid-*(1)` executables consult `.env` file for a number of environment variables.

See the [full desription](https://docs.subsquid.io/basics/squid-structure/) in the documentation.

## Types bundle

Substrate chains that have blocks with metadata versions below 14 don't provide enough 
information to decode their data. For those chains, external [type](https://polkadot.js.org/docs/api/start/types.extend) [definitions](https://polkadot.js.org/docs/api/start/types.extend) are required.

Subsquid tools include definitions for many chains, however sometimes external 
definitions are still required.

You can pass them as a special json file (types bundle) of the following structure:

```json5
{
  "types": {
    "AccountId": "[u8; 32]"
  },
  "typesAlias": {
    "assets": {
      "Balance": "u64"
    }
  },
  "versions": [
    {
      "minmax": [0, 1000], // spec version range with inclusive boundaries
      "types": {
        "AccountId": "[u8; 16]"
      },
      "typesAlias": {
        "assets": {
          "Balance": "u32"
        }
      }
    }
  ]
}
```

* `.types` - scale type definitions similar to [polkadot.js types](https://polkadot.js.org/docs/api/start/types.extend#extension)
* `.typesAlias` - similar to [polkadot.js type aliases](https://polkadot.js.org/docs/api/start/types.extend#type-clashes)
* `.versions` - per-block range overrides/patches for above fields.

All fields in the type bundle are optional and applied on top of a fixed set of well-known frame types.

Note, that although the structure of subsquid types bundle is very similar to the one from polkadot.js,
those two are not fully compatible.

## Differences from polkadot.js

Polkadot.js provides lots of [specialized classes](https://polkadot.js.org/docs/api/start/types.basics) for various types of data. 
Even primitives like `u32` are exposed through special classes.
In contrast, the squid framework works only with plain js primitives and objects.
For instance, account data is passed to the handler context as a plain byte array.  To convert it into a standard human-readable format one should explicitly use a utility lib `@subsquid/ss58`:

```typescript 
    // ...
    from: ss58.codec('kusama').encode(rec.from),
    to: ss58.codec('kusama').encode(rec.to),
```



## Graphql server extensions

It is possible to extend `squid-graphql-server(1)` with custom
[type-graphql](https://typegraphql.com) resolvers and to add request validation.
For more details, consult [docs](https://docs.subsquid.io/graphql-api/).
