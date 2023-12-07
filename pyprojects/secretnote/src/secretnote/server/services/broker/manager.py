import json
from typing import Any, Dict, List

from tornado.httpclient import AsyncHTTPClient, HTTPRequest

BROKER_SERVICE_PATH = {
    "query": "/intra/query",
    "submit_query": "/intra/query/submit",
    "fetch_result": "/intra/query/fetch",
    "create_project": "/intra/project/create",
    "list_projects": "/intra/project/list",
    "invite_member": "/intra/member/invite",
    "list_invitations": "/intra/invitation/list",
    "process_invitation": "/intra/invitation/process",
    "create_table": "/intra/table/create",
    "list_tables": "/intra/table/list",
    "drop_table": "/intra/table/drop",
    "grant_ccl": "/intra/ccl/grant",
    "revoke_ccl": "/intra/ccl/revoke",
    "show_ccl": "/intra/ccl/show",
}

global_project_id = "secretnote"


class BrokerManager:
    def __init__(self):
        pass

    async def request(self, url: str, method="GET", body=None):
        if body is None:
            body = {}
        http_client = AsyncHTTPClient()
        http_request_body = json.dumps(body)

        try:
            http_request = HTTPRequest(
                url=url,
                method=method,
                body=http_request_body,
                headers={"Content-Type": "application/json"},
            )
            response = await http_client.fetch(http_request)
            return json.loads(response.body)
        except http_client.HTTPError as e:
            # HTTPError is raised for non-200 responses; the response
            # can be found in e.response.
            print("Error: " + str(e))
        except Exception as e:
            # Other errors are possible, such as IOError.
            print("Error: " + str(e))
        http_client.close()

    def get_request_status(self, response):
        code = 0
        message = ""
        status = response.get("status", None)

        if status is not None:
            code = status.get("code", 0)
            message = status.get("message", "")
        else:
            message = "no status found."
            code = 500

        return code, message

    async def create_project(self, project: Dict, address: str):
        url = f"{address}{BROKER_SERVICE_PATH['create_project']}"
        body = {
            **project,
            "conf": {"spu_runtime_cfg": {"protocol": "SEMI2K", "field": "FM64"}},
        }
        response = await self.request(
            url=url,
            method="POST",
            body=body,
        )
        code, message = self.get_request_status(response)

        if code != 0:
            raise Exception(message)

        return response.get("project_id", "")

    async def get_project_list(self, address: str):
        url = f"{address}{BROKER_SERVICE_PATH['list_projects']}"
        body = {"ids": []}
        response = await self.request(
            url=url,
            method="POST",
            body=body,
        )
        code, message = self.get_request_status(response)

        if code != 0:
            raise Exception(message)

        return response.get("projects", [])

    async def get_project_info(self, project_id: str, address: str):
        url = f"{address}{BROKER_SERVICE_PATH['list_projects']}"
        body = {"ids": [project_id]}
        response = await self.request(
            url=url,
            method="POST",
            body=body,
        )
        code, message = self.get_request_status(response)

        if code != 0:
            raise Exception(message)

        project = response.get("projects", [])

        return project[0] if len(project) > 0 else None

    async def get_invitation_list(self, party: str, address: str):
        url = f"{address}{BROKER_SERVICE_PATH['list_invitations']}"
        body = {}
        response = await self.request(
            url=url,
            method="POST",
            body=body,
        )
        code, message = self.get_request_status(response)

        if code != 0:
            raise Exception(message)

        invite_list = response.get("invitations", [])
        return [invite for invite in invite_list if invite["inviter"] != party]

    async def process_invitation(self, invitation_id: str, respond: str, address: str):
        url = f"{address}{BROKER_SERVICE_PATH['process_invitation']}"
        body = {
            "invitation_id": invitation_id,
            "respond": respond,
            "respond_comment": "",
        }
        response = await self.request(
            url=url,
            method="POST",
            body=body,
        )
        code, message = self.get_request_status(response)

        if code != 0:
            raise Exception(message)

    def invite_member(self, invitee: str, address: str, project_id=global_project_id):
        url = f"{address}{BROKER_SERVICE_PATH['invite_member']}"
        body = {
            "project_id": project_id,
            "invitee": invitee,
            "postscript": "",
            "method": "PUSH",
        }
        response = self.request(
            url=url,
            method="POST",
            body=body,
        )
        code, message = self.get_request_status(response)

        if code != 0:
            raise Exception(message)

        return response

    def create_table(
        self,
        table_name: str,
        ref_table: str,
        columns: List[Any],
        address: str,
        project_id=global_project_id,
    ):
        url = f"{address}{BROKER_SERVICE_PATH['create_table']}"
        body = {
            "project_id": project_id,
            "table_name": table_name,
            "ref_table": ref_table,
            "db_type": "mysql",
            "columns": columns,
        }
        response = self.request(
            url=url,
            method="POST",
            body=body,
        )
        code, message = self.get_request_status(response)

        if code != 0:
            raise Exception(message)

    def get_table_list(self, address: str, project_id=global_project_id):
        url = f"{address}{BROKER_SERVICE_PATH['list_tables']}"
        body = {"project_id": project_id, "names": []}
        response = self.request(
            url=url,
            method="POST",
            body=body,
        )
        code, message = self.get_request_status(response)

        if code != 0:
            raise Exception(message)

        return response.get("tables", [])

    def delete_table(self, table_name: str, address: str, project_id=global_project_id):
        url = f"{address}{BROKER_SERVICE_PATH['drop_table']}"
        body = {"project_id": project_id, "table_name": table_name}
        response = self.request(
            url=url,
            method="POST",
            body=body,
        )
        code, message = self.get_request_status(response)

        if code != 0:
            raise Exception(message)

    def grant_ccl(
        self, ccl_list: List[Any], address: str, project_id=global_project_id
    ):
        url = f"{address}{BROKER_SERVICE_PATH['grant_ccl']}"
        body = {
            "project_id": project_id,
            "column_control_list": ccl_list,
        }
        response = self.request(
            url=url,
            method="POST",
            body=body,
        )
        code, message = self.get_request_status(response)

        if code != 0:
            raise Exception(message)

    def revoke_ccl(
        self, ccl_list: List[Any], address: str, project_id=global_project_id
    ):
        url = f"{address}{BROKER_SERVICE_PATH['revoke_ccl']}"
        body = {
            "project_id": project_id,
            "column_control_list": ccl_list,
        }
        response = self.request(
            url=url,
            method="POST",
            body=body,
        )
        code, message = self.get_request_status(response)

        if code != 0:
            raise Exception(message)

    def get_ccl_list(
        self,
        party: List[str],
        table_name: List[str],
        address: str,
        project_id=global_project_id,
    ):
        url = f"{address}{BROKER_SERVICE_PATH['show_ccl']}"
        body = {"project_id": project_id, "tables": table_name, "dest_parties": party}
        response = self.request(
            url=url,
            method="POST",
            body=body,
        )
        code, message = self.get_request_status(response)

        if code != 0:
            raise Exception(message)

        return response.get("column_control_list", [])

    def query(self, query: str, address: str, project_id=global_project_id):
        url = f"{address}{BROKER_SERVICE_PATH['query']}"
        body = {
            "project_id": project_id,
            "query": query,
        }
        response = self.request(
            url=url,
            method="POST",
            body=body,
        )
        code, message = self.get_request_status(response)

        if code != 0:
            raise Exception(message)

        return response.get("out_columns", [])

    def create_query_job(self, query: str, address: str, project_id=global_project_id):
        url = f"{address}{BROKER_SERVICE_PATH['submit_query']}"
        body = {
            "project_id": project_id,
            "query": query,
        }
        response = self.request(
            url=url,
            method="POST",
            body=body,
        )
        code, message = self.get_request_status(response)

        if code != 0:
            raise Exception(message)

        return response.get("job_id", "")

    def get_job_result(self, job_id: str, address: str):
        url = f"{address}{BROKER_SERVICE_PATH['fetch_result']}"
        body = {"job_id": job_id}
        response = self.request(
            url=url,
            method="POST",
            body=body,
        )
        code, message = self.get_request_status(response)

        if code != 0:
            raise Exception(message)

        return response.get("out_columns", [])


broker_manager = BrokerManager()
