
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
GET /_cat/indices

# Get shards info
GET /_cat/shards?h=index,shard,prirep,state,unassigned.reason

# Get information for shards assigning
GET _cluster/allocation/explain?pretty

# Get snapshots repositories
GET _cat/repositories

# Create a snapshot repository
PUT _snapshot/azure_repo_develop
{
  "type": "azure",
  "settings": {
    "container": "snapshots-devel",
    "base_path" : "backups"
  }
}

# Get detailed list with info for snapshots on a repository
GET _snapshot/azure_repo_staging/_all

# Get resumed list of snapshots on a repository
GET _cat/snapshots/azure_repo_develop/?v&s=id

# Create snapshot
PUT /_snapshot/azure_repo_staging/preview_snapshot_20220708?wait_for_completion=true
{
  "indices": "nkobjects_dkv_v09_local",
  "ignore_unavailable": true,
  "include_global_state": false,
  "metadata": {
    "taken_by": "sjg",
    "taken_because": "backup before migration"
  }
}

# Delete index

DELETE /nkobjects_dkv_v09_develop

# Restore snapshot
POST _snapshot/azure_repo_develop/develop_snapshot_20220708/_restore

# Change specific setting on a index
PUT /nkobjects_dkv_v09_legacy/_settings
{ "index.routing.allocation.include._name" : "" }

PUT /nkobjects_dkv_v09_staging/_settings
{
  "index" : {
    "number_of_replicas" : 2
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


