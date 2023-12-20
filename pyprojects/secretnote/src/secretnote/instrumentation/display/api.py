from fastapi import FastAPI

from .models import VisualizationProps

app = FastAPI()


@app.post("/visualize")
async def visualize(data: VisualizationProps) -> None:
    ...
