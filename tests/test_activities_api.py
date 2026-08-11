from urllib.parse import quote


def test_get_activities(client):
    resp = client.get("/activities")
    assert resp.status_code == 200
    data = resp.json()
    # basic keys present
    assert "Chess Club" in data
    assert "Soccer Team" in data


def test_signup_success(client):
    activity = "Art Club"
    email = "testuser@example.com"
    r = client.post(f"/activities/{quote(activity)}/signup?email={quote(email)}")
    assert r.status_code == 200
    assert f"Signed up {email}" in r.json().get("message", "")
    data = client.get("/activities").json()
    assert email in data[activity]["participants"]


def test_signup_duplicate(client):
    activity = "Programming Class"
    email = "dup@example.com"
    r1 = client.post(f"/activities/{quote(activity)}/signup?email={quote(email)}")
    assert r1.status_code == 200
    r2 = client.post(f"/activities/{quote(activity)}/signup?email={quote(email)}")
    assert r2.status_code == 400
    assert "already signed up" in r2.json().get("detail", "").lower()


def test_delete_success(client):
    activity = "Chess Club"
    email = "michael@mergington.edu"
    r = client.delete(f"/activities/{quote(activity)}/participants?email={quote(email)}")
    assert r.status_code == 200
    data = client.get("/activities").json()
    assert email not in data[activity]["participants"]


def test_delete_non_member(client):
    activity = "Gym Class"
    email = "notthere@example.com"
    r = client.delete(f"/activities/{quote(activity)}/participants?email={quote(email)}")
    assert r.status_code == 400


def test_nonexistent_activity(client):
    email = "nobody@example.com"
    r1 = client.post(f"/activities/{quote('No Such')}/signup?email={quote(email)}")
    assert r1.status_code == 404
    r2 = client.delete(f"/activities/{quote('No Such')}/participants?email={quote(email)}")
    assert r2.status_code == 404
