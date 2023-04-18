# CLINIC SEARCH ASSIGNMENT

### This is a docker image for a clinic search assignment done in NodeJS along with Express.

#### Technologies Used

- NodeJS
- ExpressJS
- TypeScript
- tsoa
- Swagger
- Docker

This example demonstrate the use of Docker with Multistage Build.

## Usage/Examples

```
docker pull manojsethi/clinic_search:latest

docker run -e PORT=8000 -p 8000:8000 clinic_search
```

As we are passing the environment variable **PORT** the value in the Port mapping must match in order to make it work

You can then run the app at localhost:8000

Access the **SWAGGER** documentation at localhost:8000/docs and can test the API
