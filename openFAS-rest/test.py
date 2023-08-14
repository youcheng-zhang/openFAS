import unittest
from pymongo import database
import requests
import json
import time
from requests.api import request
import pymongo

baseURL = "http://127.0.0.1:3000"


class TestAPI(unittest.TestCase):
    def __init__(self, methodName: str = ...) -> None:
        super().__init__(methodName=methodName)
        response = requests.post(
            baseURL+"/auth", json={"email": "xqsxlk@hotmail.com", "password": "zhangyc19981109"})
        response_json = json.loads(response.text)
        self.token = "Bearer "+response_json["token"]
        client = pymongo.MongoClient("mongodb://localhost:27017/openfas")
        self.db = client['openfas']

    def test_1_1_get_ULpatients(self):
        response = requests.get(baseURL+"/ULpatients",
                                headers={"authorization": self.token})
        self.assertEqual(response.status_code, 200)
        response_json = json.loads(response.text)
        self.assertNotEqual(response_json, None)

    def test_1_2_post_ULpatients(self):
        data = {
            "name": "test",
            "dateOfBirth": "2020-09-01T12:04:30.489Z",
            "conditions": ["test condition"],
            "description": "test description"
        }
        response = requests.post(
            baseURL+"/ULpatients", headers={"authorization": self.token}, json=data)
        self.assertEqual(response.status_code, 201)
        patient = self.db['ulpatients'].find_one(
            {"name": "test"})
        self.assertNotEqual(patient, None)

    def test_1_3_post_ULpatients2(self):
        data = {
            "name": "test2",
            "dateOfBirth": "2020-09-01T12:04:30.489Z",
            "conditions": ["test2 condition"],
            "description": "test2 description"
        }
        response = requests.post(
            baseURL+"/ULpatients", headers={"authorization": self.token}, json=data)
        self.assertEqual(response.status_code, 201)
        patient = self.db['ulpatients'].find_one(
            {"name": "test2"})
        self.assertNotEqual(patient, None)

    def test_1_4_post_ULpatients3(self):
        data = {
            "name": "test3",
            "dateOfBirth": "2020-09-01T12:04:30.489Z",
            "conditions": ["test3 condition"],
            "description": "test3 description"
        }
        response = requests.post(
            baseURL+"/ULpatients", headers={"authorization": self.token}, json=data)
        self.assertEqual(response.status_code, 201)
        patient = self.db['ulpatients'].find_one(
            {"name": "test3"})
        self.assertNotEqual(patient, None)

    def test_1_5_del_ULpatients2(self):
        patient = self.db['ulpatients'].find_one(
            {"name": "test2"})
        delete_id = patient["_id"]
        response = requests.delete(
            baseURL+"/ULpatients/"+str(delete_id), headers={"authorization": self.token})
        self.assertEqual(response.status_code, 200)

    def test_1_6_del_ULpatients3(self):
        patient = self.db['ulpatients'].find_one(
            {"name": "test3"})
        delete_id = patient["_id"]
        response = requests.delete(
            baseURL+"/ULpatients/"+str(delete_id), headers={"authorization": self.token})
        self.assertEqual(response.status_code, 200)

    def test_1_7_put_ULpatients(self):
        patient = self.db['ulpatients'].find_one(
            {"name": "test"})
        put_id = patient["_id"]
        data = {"description": "test put description"}
        response = requests.put(
            baseURL+"/ULpatients/"+str(put_id), headers={"authorization": self.token}, json=data)
        self.assertEqual(response.status_code, 200)
        patient = self.db['ulpatients'].find_one(
            {"name": "test"})
        self.assertEqual(patient["description"], "test put description")

    def test_2_1_get_ULsessions(self):
        response = requests.get(baseURL+"/ULsessions",
                                headers={"authorization": self.token})
        self.assertEqual(response.status_code, 200)
        response_json = json.loads(response.text)
        self.assertNotEqual(response_json, None)

    def test_2_2_post_ULsessions(self):
        patients = self.db['ulpatients'].find_one(
            {"name": "test"})
        data = {
            "patient": str(patients["_id"])
        }
        response = requests.post(
            baseURL+"/ULsessions", headers={"authorization": self.token}, json=data)
        self.assertEqual(response.status_code, 201)
        session = self.db['ulsessions'].find_one(
            {"patient": patients["_id"]})
        self.assertNotEqual(session, None)

    def test_2_3_get_ULsessions_id(self):
        patient = self.db['ulpatients'].find_one(
            {"name": "test"})
        session = self.db['ulsessions'].find_one(
            {"patient": patient["_id"]})
        response = requests.get(baseURL+"/ULsessions"+f"/{session['_id']}",
                                headers={"authorization": self.token})
        self.assertEqual(response.status_code, 200)
        response_json = json.loads(response.text)
        self.assertNotEqual(response_json, None)

    def test_2_4_put_ULsessions_id(self):
        patient = self.db['ulpatients'].find_one(
            {"name": "test"})
        session = self.db['ulsessions'].find_one(
            {"patient": patient["_id"]})
        data = {"maximunScore": "10"}
        response = requests.put(baseURL+"/ULsessions"+f"/{session['_id']}",
                                headers={"authorization": self.token},
                                json=data)
        self.assertEqual(response.status_code, 200)
        response_json = json.loads(response.text)
        self.assertNotEqual(response_json, None)

    def test_2_5_del_ULsessions_id(self):
        patients = self.db['ulpatients'].find_one(
            {"name": "test"})
        session = self.db['ulsessions'].find_one(
            {"patient": patients["_id"]})
        response = requests.delete(baseURL+"/ULsessions"+f"/{session['_id']}",
                                   headers={"authorization": self.token})
        self.assertEqual(response.status_code, 200)

    def test_3_1_get_ULecercises(self):
        response = requests.get(baseURL+"/ULexercises",
                                headers={"authorization": self.token})
        self.assertEqual(response.status_code, 200)

    def test_3_2_post_ULecercises(self):
        data = {
            "name": "test",
            "description": "test description"
        }
        response = requests.post(baseURL+"/ULexercises",
                                 headers={"authorization": self.token},
                                 json=data)
        self.assertEqual(response.status_code, 201)
        exercise = self.db['ulexercises'].find_one(
            {"name": "test"})
        self.assertNotEqual(exercise, None)

    def test_3_3_put_ULecercises(self):
        exercise = self.db['ulexercises'].find_one(
            {"name": "test"})
        data = {"description": "test description update"}
        response = requests.put(baseURL+"/ULexercises"+f"/{exercise['_id']}",
                                headers={"authorization": self.token},
                                json=data)
        self.assertEqual(response.status_code, 200)
        exercise = self.db['ulexercises'].find_one(
            {"name": "test"})
        self.assertEqual(exercise["description"], "test description update")

    def test_3_4_del_ULecercises(self):
        exercise = self.db['ulexercises'].find_one(
            {"name": "test"})
        response = requests.delete(baseURL+"/ULexercises"+f"/{exercise['_id']}",
                                headers={"authorization": self.token})
        self.assertEqual(response.status_code, 200)

    def test_5_cleanup(self):
        patient = self.db['ulpatients'].find_one(
            {"name": "test"})
        delete_id = patient["_id"]
        response = requests.delete(
            baseURL+"/ULpatients/"+str(delete_id), headers={"authorization": self.token})
        self.assertEqual(response.status_code, 200)




if __name__ == '__main__':
    unittest.main()
