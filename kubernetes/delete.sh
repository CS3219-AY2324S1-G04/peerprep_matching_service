#!/usr/bin/env bash

kubectl delete -f ./config_maps/core.yaml
kubectl delete -f ./config_maps/database_client.yaml
kubectl delete -f ./secrets/database_client.yaml

kubectl delete -f ./jobs/database_initialiser.yaml

kubectl delete -f ./deployments/api.yaml
kubectl delete -f ./services/api.yaml
kubectl delete -f ./hpas/api.yaml
