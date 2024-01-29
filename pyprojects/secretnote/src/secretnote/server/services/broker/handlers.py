import json
from typing import List, Tuple, Type

from jupyter_client.jsonutil import json_default
from jupyter_server.base.handlers import APIHandler, JupyterHandler
from tornado import web

from .manager import broker_manager


class BrokerHandler(APIHandler):
    def get_config(self, name):
        return self.config.get(name, None)

    def get_platform_info(self, party, host):
        return {
            "party": party,
            "host": host,
        }

    async def get_project_list(self, host):
        return await broker_manager.get_project_list(address=host)

    async def add_project(self, model, host):
        del model["action"]
        return await broker_manager.create_project(project=model, address=host)

    async def get_project_info(self, model, host):
        project_id = model.get("project_id", None)

        if project_id is None:
            raise Exception("no project_id provided.")

        return await broker_manager.get_project_info(
            project_id=project_id, address=host
        )

    async def get_invitation_list(self, party, host):
        return await broker_manager.get_invitation_list(party=party, address=host)

    async def process_invitation(self, model, host):
        invitation_id = model.get("invitation_id", None)
        respond = model.get("respond", None)

        if (invitation_id is None) or (respond is None):
            raise Exception("no invitation_id or respond provided.")

        return await broker_manager.process_invitation(
            invitation_id=invitation_id, respond=respond, address=host
        )

    async def invite_member(self, model, host):
        invitee = model.get("invitee", None)
        project_id = model.get("project_id", None)

        if (invitee is None) or (project_id is None):
            raise Exception("no invitee or project_id provided.")

        return await broker_manager.invite_member(
            project_id=project_id, invitee=invitee, address=host
        )

    async def get_table_list(self, model, host):
        project_id = model.get("project_id", None)

        if project_id is None:
            raise Exception("no project_id provided.")

        return await broker_manager.get_table_list(project_id=project_id, address=host)

    async def create_table(self, model, host):
        project_id = model.get("project_id", None)
        del model["project_id"]
        del model["action"]

        return await broker_manager.create_table(
            project_id=project_id,
            table=model,
            address=host,
        )

    async def delete_table(self, model, host):
        project_id = model.get("project_id", None)
        table_name = model.get("table_name", None)

        if (project_id is None) or (table_name is None):
            raise Exception("no project_id or table_name provided.")

        return await broker_manager.delete_table(
            project_id=project_id,
            table_name=table_name,
            address=host,
        )

    async def get_table_info(self, model, host):
        project_id = model.get("project_id", None)
        table_name = model.get("table_name", None)

        if (project_id is None) or (table_name is None):
            raise Exception("no project_id or table_name provided.")

        return await broker_manager.get_table_info(
            project_id=project_id,
            table_name=table_name,
            address=host,
        )

    async def get_table_ccl(self, model, host):
        project_id = model.get("project_id", None)
        table_name = model.get("table_name", None)

        if (project_id is None) or (table_name is None):
            raise Exception("no project_id or table_name provided.")

        return await broker_manager.get_ccl_list(
            project_id=project_id,
            table_name=table_name,
            address=host,
        )

    async def grant_ccl(self, model, host):
        project_id = model.get("project_id", None)
        ccl_list = model.get("ccl_list", None)

        if (project_id is None) or (ccl_list is None):
            raise Exception("no project_id or ccl_list provided.")

        return await broker_manager.grant_ccl(
            project_id=project_id,
            ccl_list=ccl_list,
            address=host,
        )

    async def query(self, model, host):
        project_id = model.get("project_id", None)
        query = model.get("query", None)

        if (project_id is None) or (query is None):
            raise Exception("no project_id or query.")

        return await broker_manager.query(
            project_id=project_id,
            query=query,
            address=host,
        )

    @web.authenticated
    async def post(self):
        model = self.get_json_body()
        if model is None:
            raise web.HTTPError(400, "no request body provided.")

        action = model.get("action", None)
        if action is None:
            raise web.HTTPError(400, "no action provided.")

        host = self.get_config("host")
        if host is None:
            raise web.HTTPError(400, "no host provided.")

        party = self.get_config("party")
        if party is None:
            raise web.HTTPError(400, "no party provided.")

        try:
            if action == "getPlatformInfo":
                result = self.get_platform_info(party, host)
            elif action == "getProjectList":
                result = await self.get_project_list(host)
            elif action == "addProject":
                result = await self.add_project(model, host)
            elif action == "getProjectInfo":
                result = await self.get_project_info(model, host)
            elif action == "getInvitationList":
                result = await self.get_invitation_list(party, host)
            elif action == "processInvitation":
                result = await self.process_invitation(model, host)
            elif action == "inviteMember":
                result = await self.invite_member(model, host)
            elif action == "getDataTables":
                result = await self.get_table_list(model, host)
            elif action == "createTable":
                result = await self.create_table(model, host)
            elif action == "deleteTable":
                result = await self.delete_table(model, host)
            elif action == "getTableInfo":
                result = await self.get_table_info(model, host)
            elif action == "getTableCCL":
                result = await self.get_table_ccl(model, host)
            elif action == "grantCCL":
                result = await self.grant_ccl(model, host)
            elif action == "query":
                result = await self.query(model, host)
            else:
                raise Exception("unknown action: {}".format(action))
        except Exception as e:
            raise web.HTTPError(500, str(e)) from e

        self.finish(json.dumps(result, default=json_default))


broker_handlers: List[Tuple[str, Type[JupyterHandler]]] = [
    (r"/api/broker", BrokerHandler),
]
