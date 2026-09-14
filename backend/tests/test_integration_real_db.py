from app import crud


def test_create_and_fetch_parcel_real_db(client, db_session):
    coords = [(76.78, 30.74), (76.781, 30.74), (76.781, 30.741), (76.78, 30.741), (76.78, 30.74)]
    payload = {
        "coordinates": coords,
        "owner_name": "Test Owner",
        "state_code": "CH",
        "village_or_city": "Sector 17",
        "land_use": "Residential",
    }
    resp = client.post("/parcels", json=payload)
    assert resp.status_code == 201
    data = resp.json()
    assert len(data["ulpin"]) == 14
    assert data["geometry"]["type"] == "Polygon"

    get_resp = client.get(f"/parcels/{data['ulpin']}")
    assert get_resp.status_code == 200
    assert get_resp.json()["owner_name"] == "Test Owner"