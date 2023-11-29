from secretnote.utils.node.resolve import create_require

require = create_require(
    __package__,
    "@secretflow/secretnote-ui/bundled",
    "@secretflow/secretnote-ui/browser",
    "@secretflow/secretnote/index.html",
    "./display/react/templates/component.html",
)
