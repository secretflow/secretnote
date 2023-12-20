from typing import ClassVar, Dict

from humps import camelize
from pydantic import BaseModel
from typing_extensions import Self


class SchemaExtension(BaseModel):
    SCHEMA_EXTENSION_NAMESPACE: ClassVar[str] = "x-secretflow"

    def write_to(self, schema: Dict, **kwargs):
        data = self.dict(**kwargs)
        ns: Dict = schema.setdefault(self.SCHEMA_EXTENSION_NAMESPACE, {})
        ns.setdefault(self.get_field_name(), {}).update(data)
        return schema

    @classmethod
    def get_field_name(cls):
        return camelize(cls.__name__)

    @classmethod
    def get_ref_prefix(cls, key: str):
        prefix = f"#/{cls.SCHEMA_EXTENSION_NAMESPACE}/{cls.get_field_name()}/"
        if not key:
            return prefix
        return f"{prefix}{key}/"

    @classmethod
    def read_from(cls, schema: Dict, **kwargs) -> Self:
        d = schema.get(cls.SCHEMA_EXTENSION_NAMESPACE, {}).get(cls.get_field_name(), {})
        return cls.parse_obj(d)
