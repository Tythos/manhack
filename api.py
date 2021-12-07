"""Defines an API for accessing things that don't exist, but will look pretty
   neat anyway when used to generate API documentation automatically.
"""

import os
import flask
from flask import views
from gevent import pywsgi

MOD_PATH, _ = os.path.split(os.path.abspath(__file__))
_, MOD_NAME = os.path.split(MOD_PATH)
APP = flask.Flask(MOD_NAME)
__version__ = "0.1.0"

@APP.route("/entities", methods=["GET", "POST"])
def entities():
    """This is an endpoint for fetching sets of entities and creating new ones.
    """
    method = flask.request.method
    if method == "GET":
        return {
            "message": "This endpoint should return a list of entities",
            "method": method
        }
    elif method == "POST":
        return {
            "message": "This endpoint should create an entity",
            "method": method,
            "body": flask.request.json
        }

@APP.route("/entities/<int:entity_id>", methods=["GET", "PUT", "DELETE"])
def entity(entity_id:int):
    """This is an endpoint for fetching, updating, and deleting a specific entity
    """
    method = flask.request.method
    if method == "GET":
        return {
            "id": entity_id,
            "message": "This endpoint should return details for entity %u" % entity_id,
            "method": method
        }
    elif method == "PUT":
        return {
            "id": entity_id,
            "message": "This endpoint should update the entity %u" % entity_id,
            "method": method,
            "body": flask.request.json
        }
    elif method == "DELETE":
        return {
            "id": entity_id,
            "message": "This endpoint should delete the entity %u" % entity_id,
            "method": method
        }

@APP.route("/square/<number>")
def square(number:float):
    return "%f" % number**2

class UserView(views.MethodView):
    """This is the UserView request model
    """

    def get(self, user_id:int):
        """GET request handler for UserView
        """
        return {
            "user_id": user_id,
            "method": "GET"
        }

    def post(self, user_id:int):
        """POST request handler for UserView
        """
        return {
            "user_id": user_id,
            "method": "POST",
            "body": flask.request.json
        }

APP.add_url_rule("/users/<int:user_id>", view_func=UserView.as_view("user_api"))

def main():
    """
    """
    pywsgi.WSGIServer(("0.0.0.0", 5000), APP).serve_forever()

if __name__ == "__main__":
    main()
