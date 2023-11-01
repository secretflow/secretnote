from fastapi import FastAPI

from .models import Visualization

app = FastAPI()


@app.get("/visualize")
async def visualize() -> Visualization:
    ...
