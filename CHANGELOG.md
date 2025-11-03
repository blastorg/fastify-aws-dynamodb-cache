## [2.1.1](https://github.com/blastorg/fastify-aws-dynamodb-cache/compare/v2.1.0...v2.1.1) (2025-11-03)


### Bug Fixes

* **plugin:** fixes adding hooks to array when already existing hooks ([54847bd](https://github.com/blastorg/fastify-aws-dynamodb-cache/commit/54847bda0cb7be06f6b40863c520ff11268ea75b))

# [2.1.0](https://github.com/blastorg/fastify-aws-dynamodb-cache/compare/v2.0.0...v2.1.0) (2025-06-12)


### Features

* add ability to bypass cache ([2a0cf63](https://github.com/blastorg/fastify-aws-dynamodb-cache/commit/2a0cf63b8a594df427c8d2f9db47dde661ce2695))

# [2.0.0](https://github.com/blastorg/fastify-aws-dynamodb-cache/compare/v1.1.2...v2.0.0) (2025-02-26)


### Features

* upgrade project dependencies, nodejs version and fastify ([2717b12](https://github.com/blastorg/fastify-aws-dynamodb-cache/commit/2717b1270b08af025e3a373641920ce37bf2a954))


### BREAKING CHANGES

* Min fastify is version set to 5

## [1.1.2](https://github.com/blastorg/fastify-aws-dynamodb-cache/compare/v1.1.1...v1.1.2) (2024-03-06)


### Bug Fixes

* **cached responses:** only cache successful responses ([b2885bc](https://github.com/blastorg/fastify-aws-dynamodb-cache/commit/b2885bcb90bb4a61a8ed0f65fbcdbf1291985077))

## [1.1.1](https://github.com/blastorg/fastify-aws-dynamodb-cache/compare/v1.1.0...v1.1.1) (2023-11-10)


### Bug Fixes

* **build:** ignores integration and tests folder in tsconfig ([a08c852](https://github.com/blastorg/fastify-aws-dynamodb-cache/commit/a08c8525d76cdfdd5c87455886451ee54f12b5f1))

# [1.1.0](https://github.com/blastorg/fastify-aws-dynamodb-cache/compare/v1.0.1...v1.1.0) (2023-11-10)


### Features

* **plugin:** adds option to disable cache on plugin register ([b350458](https://github.com/blastorg/fastify-aws-dynamodb-cache/commit/b350458053980041178bc04b24cb491f7ce13928))

## [1.0.1](https://github.com/blastorg/fastify-aws-dynamodb-cache/compare/v1.0.0...v1.0.1) (2023-11-10)


### Bug Fixes

* **ci:** commit to force a new version update ([39fabc1](https://github.com/blastorg/fastify-aws-dynamodb-cache/commit/39fabc1385455cf3008841064d1f22c259056312))

# 1.0.0 (2023-11-10)


### Bug Fixes

* **lint:** fixes linting issues with import statements ([a5b17ab](https://github.com/blastorg/fastify-aws-dynamodb-cache/commit/a5b17ab12bafbdbd1b54f69f09986c8c86591411))
* **naming:** updates variables naming to TTLSeconds ([b8d01d8](https://github.com/blastorg/fastify-aws-dynamodb-cache/commit/b8d01d85ae96b059dc40cfed9388f0dcf67f3a71))
* **npm:** adds missing dev packages ([e553d94](https://github.com/blastorg/fastify-aws-dynamodb-cache/commit/e553d948aff2e2ad69b995d80c9a6faaab115c8d))
* **plugin:** changes plugin register config object structure ([f9c7089](https://github.com/blastorg/fastify-aws-dynamodb-cache/commit/f9c7089bc7855bdc9bc2f620e9f8013783e29681))
* **plugin:** converts fastify hooks into async instead of callbacks ([27b7667](https://github.com/blastorg/fastify-aws-dynamodb-cache/commit/27b76670f89db19b3bc897310ec878d863cf55ad))
* **plugin:** converts ttl to seconds instead of milliseconds ([8ba6659](https://github.com/blastorg/fastify-aws-dynamodb-cache/commit/8ba66590a53ff1aac2ff47a91a6651c81c150612))
* **plugin:** makes fastify plugin async instead of callback ([a889f25](https://github.com/blastorg/fastify-aws-dynamodb-cache/commit/a889f250cc02fd14f28cbd3dd348adebb3265065))


### Features

* **plugin:** adds feature to add TTL on endpoint ([7c36b2c](https://github.com/blastorg/fastify-aws-dynamodb-cache/commit/7c36b2ce187df4cdf02f74d25a856e192b58d827))
* **plugin:** adds plugin ([1626095](https://github.com/blastorg/fastify-aws-dynamodb-cache/commit/1626095b8c1c7de8dc45f7eb29da9f949a3e3ee9))
