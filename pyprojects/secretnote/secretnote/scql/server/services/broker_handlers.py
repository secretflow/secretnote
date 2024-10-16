# Handlers for the broker service for SCQL.

import json
from typing import List, Tuple, Type, Union
from jupyter_client.jsonutil import json_default
from jupyter_server.base.handlers import APIHandler, JupyterHandler
from tornado import web
from jupyter_server.utils import ensure_async

from .broker_manager import BrokerManager


def ipick(obj, keys):
    """Pick except keys."""
    return {k: v for k, v in obj.items() if k not in keys}


class BrokerHandler(APIHandler):
    broker_manager: Union[BrokerManager, None] = None

    def ensure_broker_manager(self):
        if self.broker_manager is None:
            self.broker_manager = BrokerManager(
                self.config.get("party", None), self.config.get("broker", None)
            )

    @web.authenticated
    async def post(self):
        """The unified entry point for all requests."""
        self.ensure_broker_manager()

        # sanitize the input
        model = self.get_json_body()
        assert model is not None, web.HTTPError(400, "no request body provided.")
        action = model.get("action", None)
        assert action is not None, web.HTTPError(400, "no action provided.")

        handlers = {
            "getPlatformInfo": lambda: {
                "party": self.broker_manager.party,
                "broker": self.broker_manager.broker,
            },
            "listProjects": lambda: self.broker_manager.list_projects(
                model.get("ids", None)
            ),
            "createProject": lambda: self.broker_manager.create_project(
                ipick(model, ["action"])
            ),
            "listInvitations": lambda: self.broker_manager.list_invitations(
                ["inviter", "invitee"]
            ),
            "processInvitation": lambda: self.broker_manager.process_invitation(
                model.get("invitation_id", None), model.get("respond", None)
            ),
            "inviteMember": lambda: self.broker_manager.invite_member(
                model.get("project_id", None),
                model.get("invitee", None),
                model.get("method", None),
            ),
            "listTables": lambda: self.broker_manager.list_tables(
                model.get("project_id", None), model.get("names", None)
            ),
            "createTable": lambda: self.broker_manager.create_table(
                model.get("project_id", None), ipick(model, ["action", "project_id"])
            ),
            "dropTable": lambda: self.broker_manager.drop_table(
                model.get("project_id", None), model.get("table_name", None)
            ),
            "showCCL": lambda: self.broker_manager.show_ccl(
                model.get("project_id", None), model.get("tables", [])
            ),
            "grantCCL": lambda: self.broker_manager.grant_ccl(
                model.get("project_id", None), model.get("column_control_list", None)
            ),
            "doQuery": lambda: self.broker_manager.do_query(
                model.get("project_id", None), model.get("query", None)
            ),
        }

        try:
            assert action in handlers, Exception(f"Invalid broker action: {action}")
            result = await ensure_async(handlers[action]())
        except Exception as e:
            raise web.HTTPError(500, str(e)) from e

        self.finish(json.dumps(result, default=json_default))


broker_handlers: List[Tuple[str, Type[JupyterHandler]]] = [
    (r"/api/broker", BrokerHandler),
]
