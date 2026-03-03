FROM openapitools/openapi-generator-cli:v7.3.0 AS openapi
WORKDIR /work
COPY api/src/main/resources/openapi/api.yaml /work/api.yaml
RUN /usr/local/bin/docker-entrypoint.sh generate \
  -i /work/api.yaml \
  -g typescript-fetch \
  -o /work/generated \
  --additional-properties=apiPackage=client,modelPackage=types,typescriptThreePlus=true

FROM node:20-alpine
WORKDIR /app
COPY ui/package*.json ./
RUN npm install
COPY ui/ .
COPY --from=openapi /work/generated ./src/generated
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]
