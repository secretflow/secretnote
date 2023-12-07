import json
from typing import List, Tuple, Type

from jupyter_client.jsonutil import json_default
from jupyter_server.base.handlers import APIHandler, JupyterHandler
from tornado import web

from .manager import broker_manager


class BrokerHandler(APIHandler):
    def get_config(self, name):
        return self.config.get(name, None)

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
        return await broker_manager.get_invitation_list(party, address=host)

    async def process_invitation(self, model, host):
        invitation_id = model.get("invitation_id", None)
        respond = model.get("respond", None)
        if (invitation_id is None) or (respond is None):
            raise Exception("no invitation_id or respond provided.")

        return await broker_manager.process_invitation(
            invitation_id=invitation_id, respond=respond, address=host
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
            if action == "getProjectList":
                result = await self.get_project_list(host)
            elif action == "addProject":
                result = await self.add_project(model, host)
            elif action == "getProjectInfo":
                result = await self.get_project_info(model, host)
            elif action == "getInvitationList":
                result = await self.get_invitation_list(party, host)
            elif action == "processInvitation":
                result = await self.process_invitation(model, host)
            else:
                raise Exception("unknown action: {}".format(action))
        except Exception as e:
            raise web.HTTPError(500, str(e)) from e

        self.finish(json.dumps(result, default=json_default))


broker_handlers: List[Tuple[str, Type[JupyterHandler]]] = [
    (r"/api/broker", BrokerHandler),
]
