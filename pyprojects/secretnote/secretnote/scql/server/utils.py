import json
import logging
from os import makedirs, path
from tornado.httpclient import AsyncHTTPClient, HTTPRequest, HTTPResponse


def get_db_path():
    from jupyter_core import paths

    jupyter_config_dir = paths.jupyter_config_dir()
    if not path.exists(jupyter_config_dir):
        makedirs(jupyter_config_dir)
    return f"sqlite:///{jupyter_config_dir}/secretnote.db"


async def request(url: str, method: str, body=None):
    """Send a async JSON request to a given url. The response is also parsed as JSON."""
    if body is None:
        body = {}
    http_client = AsyncHTTPClient()

    try:
        http_request = HTTPRequest(
            url,
            method,
            body=json.dumps(body),
            headers={"Content-Type": "application/json"},
        )

        response = await http_client.fetch(http_request)

        return json.loads(response.body)
    except Exception as e:
        logging.error(f"request failed: {e}")

        return None
