# Spins up the docker container (dynamoDB container)
docker run -d -p 8000:8000 --name fastify-dynamodb-cache amazon/dynamodb-local;

# Create the tables
aws dynamodb create-table \
    --endpoint-url=http://localhost:8000 \
    --table-name fastify-dynamodb-cache \
    --attribute-definitions \
        AttributeName=path,AttributeType=S \
    --key-schema \
        AttributeName=path,KeyType=HASH \
    --billing-mode=PAY_PER_REQUEST \
    --region=eu-central-1 \
    --no-cli-pager

# Prints out the database tables into the console
aws dynamodb list-tables --endpoint-url http://localhost:8000 --region=eu-central-1

echo "Finished setting up the local database."