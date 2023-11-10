#!/usr/bin/env bash

kubectl apply -f ./config_maps/core.yaml
kubectl apply -f ./config_maps/database_client.yaml
kubectl apply -f ./secrets/database_client.yaml

kubectl apply -f ./jobs/database_initialiser.yaml

kubectl apply -f ./deployments/api.yaml
kubectl apply -f ./services/api.yaml
kubectl apply -f ./hpas/api.yaml
