def test_cluster_party_export_omit_none():
    """SFClusterParty should omit listen_addr if it is None."""
    from secretnote.compat.secretflow.device.driver import SFClusterParty

    party = SFClusterParty(address="localhost:7860")
    assert party.dict() == {
        "listen_addr": "localhost:7860",
        "address": "localhost:7860",
    }
