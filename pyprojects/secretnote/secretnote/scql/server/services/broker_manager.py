# This is the manager that interacts with SCQL's broker, just like "broker's broker".
# SCQL itself exposes a set of APIs to manage projects, tables, and column control lists (CCLs).
# @see https://www.secretflow.org.cn/zh-CN/docs/scql/0.9.0b1/reference/broker-api
# APIs here are consistent with those of SCQL's broker.

from typing import Any, Dict, List, Union
from ..utils import request


"""Examples
Project{"conf":{"spu_runtime_cfg":{"field":"FM64","protocol":"SEMI2K"}},
        "creator":"alice","members":["alice"],"project_id":"proj_id"}
Invitation{"invitation_id":1,"invitee":"bob","inviter":"alice",
           "project":{"conf":{"spu_runtime_cfg":{"field":"FM64","protocol":"SEMI2K"}},
           "project_id":"proj_id"},"status":0}
Table{"columns":[{"dtype":"string","name":"ID"},{"dtype":"int","name":"age"}],
      "db_type":"mysql","ref_table":"bob.user_stats","table_name":"tb","table_owner":"bob"}
ColumnControlList{"col":{"column_name":"ID","table_name":"ta"},"constraint":"PLAINTEXT",
                  "party_code":"alice"}
OutColumns{"elem_type":"STRING","name":"ID","option":"VALUE","shape":{"dim":[{"dim_value":"2"},
           {"dim_value":"1"}]},"string_data":["alice","bob"]}
"""
Project = Dict[str, Any]
Invitation = Dict[str, Any]
Table = Dict[str, Any]
ColumnControlList = Dict[str, Any]
OutColumns = Dict[str, Any]


class BrokerManager:
    def __init__(self, party, broker):
        """Initialize the broker manager as `party` to interact with endpoint `broker`."""
        assert party is not None, Exception(
            "Failed to init BrokerManager: party is not given."
        )
        assert broker is not None, Exception(
            "Failed to init BrokerManager: broker is not given."
        )
        assert broker.startswith("http"), Exception(
            "Failed to init BrokerManager: broker must start with 'http' or 'https'."
        )
        self.party = party
        self.broker = broker

    def validate_response(self, response) -> Any:
        """Check if the response is valid. Returns the response."""
        # Normalize the status code and message of a SCQL broker response
        if response is None:
            code, message = 500, "No response received from broker."
        else:
            status = response.get("status", None)
            if status is not None:
                code, message = status.get("code", 0), status.get("message", "")
            else:
                code, message = 500, "No status found in response."
        # Intercept those unsuccessful responses
        assert code == 0, Exception(f"[{code}] {message}")

        return response

    async def create_project(self, project: Project) -> Union[str, None]:
        """Create a new Project and automatically become the Project member and creator.
        Returns the project_id.
        """
        response = await request(
            f"{self.broker}/intra/project/create", "POST", body=project
        )

        return self.validate_response(response).get("project_id", None)

    async def list_projects(self, ids: Union[List[str], None]) -> List[Project]:
        """List All Projects that have created and joined."""
        response = await request(
            f"{self.broker}/intra/project/list",
            "POST",
            body={"ids": [] if ids is None else ids},
        )

        return self.validate_response(response).get("projects", [])

    async def list_invitations(self, roles: List[str]) -> List[Invitation]:
        """List all invitations sent and received. Filtered according to `party`
        by `roles` in ["inviter", "invitee"]."""
        response = await request(
            f"{self.broker}/intra/invitation/list", "POST", body={}
        )

        invitations = self.validate_response(response).get("invitations", [])
        filtered_invitations = []
        for role in roles:
            assert role in ["inviter", "invitee"], ValueError(f"Invalid role: {role}")
            filtered_invitations.extend(
                [x for x in invitations if x[role] == self.party]
            )

        return filtered_invitations

    async def process_invitation(
        self, invitation_id: str, respond: str
    ) -> Union[str, None]:
        """Process the received invitation, specify it by invitation_id,
        choose to join the corresponding project or reject it.
        Returns the invitation_id.
        """
        assert respond in ["ACCEPT", "DECLINE"], ValueError(
            f"Invalid respond: {respond}"
        )

        response = await request(
            f"{self.broker}/intra/invitation/process",
            "POST",
            body={
                "invitation_id": invitation_id,
                "respond": respond,
            },
        )

        return self.validate_response(response).get("invitation_id", None)

    async def invite_member(self, project_id: str, invitee: str, method: str) -> None:
        """Invite another member to join the Project you created"""
        assert method == "PUSH", ValueError(
            f"Method except PUSH is not implemented yet."
        )

        response = await request(
            f"{self.broker}/intra/member/invite",
            "POST",
            body={
                "project_id": project_id,
                "invitee": invitee,
                "method": method,
            },
        )

        self.validate_response(response)
        return None

    async def list_tables(
        self, project_id: str, names: Union[List[str], None]
    ) -> List[Table]:
        """List all Tables in specified Project."""
        response = await request(
            f"{self.broker}/intra/table/list",
            method="POST",
            body={"project_id": project_id, "names": [] if names is None else names},
        )

        return self.validate_response(response).get("tables", [])

    async def create_table(self, project_id: str, table: Table) -> None:
        """Create a Table you owned in specified Project."""
        response = await request(
            f"{self.broker}/intra/table/create",
            "POST",
            body={
                "project_id": project_id,
                **table,  # table_name, ref_table, db_type?, columns
            },
        )

        self.validate_response(response)
        return None

    async def drop_table(self, project_id: str, table_name: str) -> None:
        """Drop a Table you owned in specified Project, the relevant CCLs will be automatically cleared."""
        response = await request(
            f"{self.broker}/intra/table/drop",
            "POST",
            body={"project_id": project_id, "table_name": table_name},
        )

        self.validate_response(response)
        return None

    async def show_ccl(
        self,
        project_id: str,
        tables: List[str],
    ) -> List[ColumnControlList]:
        """Show CCLs in specified Project, supports specifying Tables, members."""
        response = await request(
            f"{self.broker}/intra/ccl/show",
            "POST",
            body={"project_id": project_id, "tables": tables, "dest_parties": []},
        )

        return self.validate_response(response).get("column_control_list", [])

    async def grant_ccl(
        self, project_id: str, column_control_list: List[ColumnControlList]
    ) -> None:
        """Grant a list of column control lists to a project."""
        response = await request(
            f"{self.broker}/intra/ccl/grant",
            "POST",
            body={
                "project_id": project_id,
                "column_control_list": column_control_list,
            },
        )

        self.validate_response(response)
        return None

    async def revoke_ccl(self, project_id: str, column_control_list: List[Any]) -> None:
        """Revoke the CCLs you have granted to the specified member."""
        response = await request(
            f"{self.broker}/intra/ccl/revoke",
            "POST",
            body={"project_id": project_id, "column_control_list": column_control_list},
        )

        self.validate_response(response)
        return None

    async def do_query(self, project_id: str, query: str) -> List[OutColumns]:
        """Do a query and return the result."""
        response = await request(
            f"{self.broker}/intra/query",
            "POST",
            body={"project_id": project_id, "query": query},
        )

        return self.validate_response(response).get("result")

    async def submit_query(self, project_id: str, query: str) -> str:
        """Run Query asynchronously. Returns the job_id."""
        response = await request(
            f"{self.broker}/intra/query/submit",
            "POST",
            body={"project_id": project_id, "query": query},
        )

        return self.validate_response(response).get("job_id", "")

    async def fetch_result(self, job_id: str) -> List[OutColumns]:
        """Fetch query result of asynchronous query. Returns the out_columns."""
        response = await request(
            f"{self.broker}/intra/query/fetch",
            method="POST",
            body={"job_id": job_id},
        )

        return self.validate_response(response).get("out_columns", [])
