from fastapi import FastAPI

from .models import Visualization

app = FastAPI()


@app.post("/visualize")
async def visualize(data: Visualization) -> None: ...
