
## Common quieries against ES
#
## How to use it:
# - Open an existing file with a .es file extenion or open a new text file (ctrl+n) and change the language mode to Elasticsearch (es) by pressing ctrl+k,m and select es. Elasticsearch queries and funtionalities are enabled in the es language mode in Visual Studio Code editor.
# - For https endpoints, just add protocol type in url : https://host
# - For auth protected clusters, you can use http://user:pass@host:9200 as the endpoint url to have it auth.
# - Use VSCode command 'Elastic: Set Host' to create connection profile and connect.
# - Alt + Enter / Ctrl + Enter to execute selected query.
# - You will also going to need a port-forward to our ES installations

GET _search
{
  "query": {
    "match_all": {}
  }
}

# Get cluster info and health
GET _cluster/health?pretty

# Get indices
GET /_cat/indices/filebeat-*

# Get shards info
GET /_cat/shards/nkobjects_dkv_v09_production?h=index,shard,prirep,state,unassigned.reason,node

# Get information for shards assigning
GET _cluster/allocation/explain?pretty

# Retry allocation
POST _cluster/reroute?retry_failed

# Get snapshots repositories
GET _cat/repositories

# Create a snapshot repository
PUT _snapshot/azure_repo_production_AKS02
{
  "type": "azure",
  "settings": {
    "container": "snapshots-production",
    "base_path" : "backups"
  }
}

# Get detailed list with info for snapshots on a repository
GET _snapshot/azure_repo_production_AKS02/metricbeat_logs_20220906

# Get detailed list with info for snapshots on a repository
GET _snapshot/azure_repo/production_snapshot_20220903_2

# Get resumed list of snapshots on a repository
GET _cat/snapshots/azure_repo_production_AKS02/?v&s=id

# Create snapshot
PUT /_snapshot/azure_repo/metricbeat_logs_20220906
{
  "indices": "metricbeat-*",
  "ignore_unavailable": false,
  "include_global_state": false,
  "metadata": {
    "taken_by": "sjg",
    "taken_because": "backup for logs"
  }
}

# Delete index

DELETE /nkobjects_dkv_v09_production

# Restore snapshot
POST _snapshot/azure_repo_production_AKS02/production_snapshot_20220903_2/_restore

# Change specific setting on a index
PUT /nkobjects_dkv_v09_legacy/_settings
{ "index.routing.allocation.include._name" : "" }

PUT /nkobjects_dkv_v09_production/_settings
{
  "index" : {
    "number_of_replicas" : 2
  }
}

GET /_cluster/settings

PUT /_cluster/settings?flat_settings=true
{
  "persistent" : {
    "cluster.routing.rebalance.enable": "all",
    "cluster.routing.allocation.allow_rebalance": "indices_all_active",
    "cluster.routing.allocation.cluster_concurrent_rebalance":"5",
    "cluster.routing.allocation.node_concurrent_incoming_recoveries":"10",
    "cluster.routing.allocation.node_concurrent_outgoing_recoveries":"10"
	}
}

PUT /_cluster/settings
{
    "persistent" : {
      "indices.recovery.max_bytes_per_sec" : "2500mb"
    }
}

##Make a reindex from one index to other - DANGEROUS
POST /_reindex?pretty
{
    "source": {
        "index": "nkobjects_dkv_v09_local"
    },
    "dest": {
        "index": "nkobjects_dkv_v09_preview"
    }
}

# Add geoip pipeline

PUT _ingest/pipeline/geoip-info-proxy
{
  "description" : "Add geoip info",
  "processors" : [
    {
      "geoip" : {
        "field" : "ip"
      }
    }
  ]
}


DELETE _template/filebeat*


GET _ingest/pipeline/