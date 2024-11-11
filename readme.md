
# Project Installation

`git clone git@github.com:RomingoTravel/romingo-graphql.git`

`cd romingo-graphql`

`npm i`

# Install gcloud before processed anything
https://cloud.google.com/sdk/docs/install#linux

`gcloud auth application-default login`

`gcloud auth login `

`gcloud config set project PROJECT_ID`

`npm run dev`


# For creating migration use knex package (Make changes in database)

`npm i knex -g`

`knex migrate:make migration_name`

`knex migrate:latest`

Configure database file for migration

`romingo-graphql/knexfile.js`


Sabre API docs:
https://developer.sabre.com/product-catalog?f%5B0%5D=product_type%3Aapi_reference
https://developer.sabre.com/docs/rest_apis/hotel/search/get_hotel_descriptive_info/versions/v300/reference-documentation
https://developer.sabre.com/docs/rest_apis/hotel/search/get_hotel_details/reference-documentation