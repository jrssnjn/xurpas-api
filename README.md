[Swagger]: https://app.swaggerhub.com/apis/<username>/<app>/1.0.0-oas3

## Installation

Use [npm](https://www.npmjs.com) to install required dependencies

```javascript
npm i
```

## Pre-requisites
```
- NodeJS
- Typescript
- Eslint
- Prettier
- Husky
- PM2
- Docker
- Bash
```

## Produce a build image

```bash
./build.sh -b <build_name>
```

## Run an existing image

```bash
./run.sh -b <build_name>
```

## Start an inactive / stopped image

```bash
./start.sh -b <build_name>
```

## Run tests

```javascript
npm run tests
```

### Swagger API Documentation
View full api documentation in our [Swagger] repository.

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[MIT](https://choosealicense.com/licenses/mit/)
