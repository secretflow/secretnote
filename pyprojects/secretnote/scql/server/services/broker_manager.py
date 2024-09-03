# This is the manager for SCQL's broker.
# SCQL exposes a set of APIs to manage projects, tables, and column control lists (CCLs).

import json
from typing import Any, Dict, List, Optional

from tornado.httpclient import AsyncHTTPClient, HTTPRequest, HTTPResponse

# Collections of paths for the broker service actions.
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


class BrokerManager:
    def __init__(self):
        pass

    async def request(self, url: str, method="GET", body=None):
        """Send a async JSON request to a given url. The response is also parsed as JSON."""
        if body is None:
            body = {}
        http_client = AsyncHTTPClient()
        http_request_body = json.dumps(body)

        try:
            http_request = HTTPRequest(
                url,
                method,
                body=http_request_body,
                headers={"Content-Type": "application/json"},
            )
            response = await http_client.fetch(http_request)
            return json.loads(response.body)
        except Exception as e:
            print("Error: " + str(e))

    def get_request_status(self, response):
        """Normalize the status code and message from a response. 0 means success."""
        if response is None:
            return 500, "no response found."

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

    def _check(self, response: Any):
        """Check if the response is valid. Returns the response."""
        code, message = self.get_request_status(response)
        if response is None or code != 0:
            raise Exception(message)

        return response

    async def create_project(self, project: Dict[str, Any], address: str) -> str:
        """Create a project. Returns the `project_id`."""
        response = await self.request(
            f"{address}{BROKER_SERVICE_PATH['create_project']}",
            "POST",
            body={
                **project,
                "conf": {
                    "spu_runtime_cfg": {"protocol": "SEMI2K", "field": "FM64"}
                },  # TODO
            },
        )

        return self._check(response).get("project_id", "")

    async def get_project_list(self, address: str) -> List[Dict[str, Any]]:
        """Get the list of projects."""
        response = await self.request(
            f"{address}{BROKER_SERVICE_PATH['list_projects']}",
            "POST",
            body={"ids": []},
        )

        return self._check(response).get("projects", [])

    async def get_project_info(
        self, project_id: str, address: str
    ) -> Optional[Dict[str, Any]]:
        """Get the project information by `project_id`."""
        response = await self.request(
            f"{address}{BROKER_SERVICE_PATH['list_projects']}" "POST",
            body={"ids": [project_id]},
        )

        projects = self._check(response).get("projects", [])
        return projects[0] if len(projects) > 0 else None

    async def get_invitation_list(
        self, party: str, address: str
    ) -> List[Dict[str, Any]]:
        """Get the list of invitations for a party."""
        response = await self.request(
            f"{address}{BROKER_SERVICE_PATH['list_invitations']}",
            "POST",
            body={},
        )

        invite_list = self._check(response).get("invitations", [])
        return [invite for invite in invite_list if invite["inviter"] != party]

    async def process_invitation(
        self, invitation_id: str, respond: str, address: str
    ) -> None:
        """Process an invitation by `invitation_id`."""
        response = await self.request(
            f"{address}{BROKER_SERVICE_PATH['process_invitation']}",
            "POST",
            body={
                "invitation_id": invitation_id,
                "respond": respond,
                "respond_comment": "",
            },
        )

        return self._check(response)

    async def invite_member(self, project_id: str, invitee: str, address: str) -> None:
        """Invite a member to a project."""
        response = await self.request(
            f"{address}{BROKER_SERVICE_PATH['invite_member']}",
            "POST",
            body={
                "project_id": project_id,
                "invitee": invitee,
                "postscript": "",
                "method": "PUSH",
            },
        )

        self._check(response)

    async def get_table_list(
        self, project_id: str, address: str
    ) -> List[Dict[str, Any]]:
        """Get the list of tables for a project."""
        response = await self.request(
            f"{address}{BROKER_SERVICE_PATH['list_tables']}",
            method="POST",
            body={"project_id": project_id, "names": []},
        )

        return self._check(response).get("tables", [])

    async def create_table(
        self,
        project_id: str,
        table: Dict[str, Any],
        address: str,
    ) -> None:
        """Create a table."""
        response = await self.request(
            f"{address}{BROKER_SERVICE_PATH['create_table']}",
            "POST",
            body={
                "project_id": project_id,
                **table,
            },
        )

        self._check(response)

    async def delete_table(
        self, project_id: str, table_name: str, address: str
    ) -> None:
        """Delete a table by `table_name`."""
        response = await self.request(
            f"{address}{BROKER_SERVICE_PATH['drop_table']}",
            "POST",
            body={"project_id": project_id, "table_name": table_name},
        )

        self._check(response)

    async def get_table_info(
        self, project_id: str, table_name: str, address: str
    ) -> Any:
        """Get the table information by `table_name`."""
        response = await self.request(
            f"{address}{BROKER_SERVICE_PATH['list_tables']}",
            "POST",
            body={"project_id": project_id, "names": [table_name]},
        )

        tables = self._check(response).get("tables", [])
        return tables[0] if len(tables) > 0 else None

    async def get_ccl_list(
        self,
        project_id: str,
        table_name: str,
        address: str,
    ) -> List[Dict[str, Any]]:
        """Get the column control list for a table."""
        response = await self.request(
            f"{address}{BROKER_SERVICE_PATH['show_ccl']}",
            "POST",
            body={"project_id": project_id, "tables": [table_name], "dest_parties": []},
        )

        return self._check(response).get("column_control_list", [])

    async def grant_ccl(
        self, project_id: str, ccl_list: List[Any], address: str
    ) -> None:
        """Grant a list of column control lists to a project."""
        response = await self.request(
            f"{address}{BROKER_SERVICE_PATH['grant_ccl']}",
            "POST",
            body={
                "project_id": project_id,
                "column_control_list": ccl_list,
            },
        )

        self._check(response)

    async def revoke_ccl(
        self, project_id: str, ccl_list: List[Any], address: str
    ) -> None:
        """Revoke a list of column control lists from a project."""
        response = await self.request(
            f"{address}{BROKER_SERVICE_PATH['revoke_ccl']}",
            "POST",
            body={
                "project_id": project_id,
                "column_control_list": ccl_list,
            },
        )

        self._check(response)

    async def query(self, project_id: str, query: str, address: str) -> List[Any]:
        """Do a query and return the result."""
        response = await self.request(
            f"{address}{BROKER_SERVICE_PATH['query']}",
            "POST",
            body={
                "project_id": project_id,
                "query": query,
            },
        )

        return self._check(response).get("result").get("out_columns", [])

    async def create_query_job(self, project_id: str, address: str, query: str) -> str:
        """Create a query job and return the `job_id`."""
        response = await self.request(
            f"{address}{BROKER_SERVICE_PATH['submit_query']}",
            "POST",
            body={
                "project_id": project_id,
                "query": query,
            },
        )

        return self._check(response).get("job_id", "")

    async def get_job_result(self, job_id: str, address: str) -> List[Any]:
        """Get the result of a job by `job_id`."""
        response = await self.request(
            f"{address}{BROKER_SERVICE_PATH['fetch_result']}",
            method="POST",
            body={"job_id": job_id},
        )

        return self._check(response).get("out_columns", [])


broker_manager = BrokerManager()
