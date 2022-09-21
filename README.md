# Installation

```bash
$ yarn install
```

# Running the app

```bash
# development
$ yarn start

# watch mode
$ yarn start:dev

# production mode
$ yarn start:prod
```

# Test

```bash
# unit tests
$ yarn test

# e2e tests
$ yarn test:e2e

# test coverage
$ yarn test:cov
```

# Deployment

## Prepare
1. Install [Docker Desktop](https://docs.docker.com/desktop/install/windows-install/)
2. Enable Kubernetes support in Docker
3. Switch Docker to Linux Containers
4. Download [Lens](https://k8slens.dev/)
5. Ask Konstantin to add your in DigitalOcean
6. Go to [DigitalOcean](https://cloud.digitalocean.com/)
7. Go to the Kubernetes tab
8. Select cluster k8s-1-22-11-do-0-ams3-1657091918583
9. Go to it and select actions in the right corner, then Download config
10. Open Lens and click the Add Cluster button
11. In Lens find the path to your Kubernetes config
12. Open the Kubernetes config on your PC and open the one downloaded from DigitalOcean
13. Transfer data about the cluster, user to the appropriate sections of your config
14. In Lens, select the desired context - do-ams3-k8s-1-22-11-do-0-ams3-1657091918583

## Deploy PostgresSQL
1. Download [archive](https://drive.google.com/file/d/11DNrQ0ETpb5ovOj4ZC1ufE7WC_o5XIUG/view?usp=sharing)
3. Unzip it
4. Go to folder ./kuber/postgres and open values.yaml file
5. Configure password and username for database
6. In the console go to the folder `./kuber/postgres`
7. Run command helm repo add bitnami https://charts.bitnami.com/bitnami
8. Run `kubectl apply -f local-pv.yaml`
9. Run `kubectl apply -f pv-claim.yaml`
10. Run `kubectl apply -f service.yaml`
11. Run `helm install postgresql-dev -f values.yaml bitnami/postgresql --set volumePermissions.enabled=true`
12. Open Lens -> Workloads -> Pods and make sure the base is working

## Deploy Redis
1. In the console, go to the ./kuber/redis folder
2. Run `kubectl apply -f service.yaml`
3. Run `helm install redis-dev -f values.yaml bitnami/redis --set global.redis.password=password --set volumePermissions.enabled=true`
4. Open Lens -> Workloads -> Pods and make sure the base is working

## Configure HTTPS

1. Install Helm in command prompt
2. Switch to cluster-context (in the example it's `do-ams3-k8s-1-22-11-do-0-ams3-1657091918583`)
3. Install NGINX Ingress Controller. Execute the following commands in command prompt:

```
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx  
helm repo update  
helm install --namespace ingress-nginx --create-namespace ingress-nginx ingress-nginx/ingress-nginx
```

4. Install Cert-Manager for k8s cluster.  
Check actual cert-manager version here: https://artifacthub.io/packages/helm/cert-manager/cert-manager.  
Execute the following commands in command prompt:

```
helm repo add jetstack https://charts.jetstack.io
helm repo update
helm upgrade --install cert-manager jetstack/cert-manager --namespace cert-manager --create-namespace --version v1.9.0 --set installCRDs=true --set podDnsPolicy=None --set "podDnsConfig.nameservers={1.1.1.1,8.8.8.8}"
```

Note: You must use environments `podDnsPolicy` and `podDnsConfig` to fix several `cert-manager` errors

5. Create file `cluster-issuer.yaml` with the following config:

```
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt
spec:
  acme:
    # Let's Encrypt will use this to contact you about expiring
    # certificates, and issues related to your account.
    email: lef@daoism.systems
    # The ACME server URL
    server: https://acme-v02.api.letsencrypt.org/directory
    preferredChain: "ISRG Root X1"
    privateKeySecretRef:
      # Secret resource that will be used to store the account's private key.
      name: letsencrypt-issuer-account-key
    # Add a single challenge solver, HTTP01 using nginx
    solvers:
    - http01:
        ingress:
          class: nginx
```

6. In command prompt execute `kubectl apply --namespace cert-manager -f cluster-issuer.yaml`. You should enter path to the `cluster-issuer.yaml` file created on the previous step

## Build and deploy docker image
1. Go to [DigitalOcean](https://cloud.digitalocean.com/account/api/tokens)
2. Create a new token with an infinite lifetime
3. Open console and type `docker login registry.digitalocean.com`
4. Use the token as a username and password
5. Then in the console go to the directory with the project
6. Clear .env file
7. In the console run `docker build . -t nindao/api`
8. Run `docker tag nindao/api registry.digitalocean.com/nindao-registry/nindao-api:latest`
9. Run `docker push registry.digitalocean.com/nindao-registry/nindao-api:latest`

## Deploy api
1. Go to the console in the project folder
2. Go to Lens and open Workloads -> Pods
3. Find Postgres or Redis pod and click on it
4. In Labels section find *app.kubernetes.io/instance=...*. Use this value for POSTGRES_HOST or REDIS_HOST in next step
5. Run `helm install nindao-api ./ci/hyperdao-api --set volumePermissions.enabled=true --set BOT_API_TOKEN=token --set INFURA_KEY=infura_key --set NIN_DAO_CONTRACT_ADDRESS=address --set NETWORK_NAME=name --set REDIS_HOST=redis-dev-master --set REDIS_USERNAME=username --set REDIS_PASSWORD=password --set REDIS_PORT=6379 --set POSTGRES_USER=username --set POSTGRES_PASSWORD=password --set POSTGRES_HOST=postgresql-dev --set POSTGRES_DB=nindao --set POSTGRES_PORT=5432 --set imageCredentials.username=registry-token --set imageCredentials.password=registry-token`  

Note: if you have installed helm chart you should use `helm upgrade` command instead of `helm install`