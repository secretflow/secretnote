from humps import camelize
from pydantic import BaseModel


class ProtoModel(BaseModel):
    class Config:
        alias_generator = camelize
        allow_population_by_field_name = True
