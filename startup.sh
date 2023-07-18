#!/bin/sh

# check that jq is installed
if ! [ -x "$(command -v jq)" ]; then
  echo 'Error: jq is not installed.' >&2
  exit 1
fi

export K8S_API_ENDPOINT=$(kubectl config view -o json --minify --output jsonpath="{.clusters[*].cluster.server}")
export K8S_ACCESS_TOKEN=$(kubectl get secret backstage-secret -o json | jq -r ".data.token | @base64d")
export K8S_CA_DATA=$(kubectl config view -o json --flatten --output jsonpath="{.clusters[*].cluster.certificate-authority-data}")

yarn dev


