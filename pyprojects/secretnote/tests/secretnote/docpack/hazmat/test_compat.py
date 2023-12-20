import pytest

try:
    from secretflow.component.component import Component
    from secretflow.component.entry import COMP_MAP
except ImportError:
    pytest.skip("secretflow not installed", allow_module_level=True)

from secretnote.docpack.hazmat.compat import component_to_recipe, recipe_to_component


@pytest.mark.parametrize("comp", COMP_MAP.values(), ids=COMP_MAP.keys())
def test_roundtripping(comp: Component):
    from google.protobuf.json_format import MessageToDict

    recipe = component_to_recipe(comp)
    comp2 = recipe_to_component(recipe)

    lhs = MessageToDict(comp.definition())  # pyright: ignore[reportGeneralTypeIssues]
    rhs = MessageToDict(comp2.definition())  # pyright: ignore[reportGeneralTypeIssues]

    assert lhs == rhs
