"""
"""

import os
import flask
from gevent import pywsgi
from manhack import api

MOD_PATH, _ = os.path.split(os.path.abspath(__file__))
_, MOD_NAME = os.path.split(MOD_PATH)
API_MODULE = api
API_APPLICATION = API_MODULE.APP
APP = flask.Flask(MOD_NAME)

@APP.route("/doc")
def index():
    """Returns static file entry point
    """
    return flask.send_file(MOD_PATH + "/public/index.html")

@APP.route("/doc/meta")
def meta():
    """Returns metadata for API service (title, version, description) that
       could probably be parsed/matched from package data, etc. We could also
       parse some interesting data from the Flask/WSGI application in API.
    """
    return {
        "title": API_MODULE.__name__,
        "description": API_MODULE.__doc__,
        "version": API_MODULE.__version__ if hasattr(API_MODULE, "__version__") else "0x%x" % API_MODULE.__hash__()
    }

@APP.route("/doc/endpoints")
def endpoints():
    """
    """
    response = { "endpoints": [] }
    for rule in API_APPLICATION.url_map.iter_rules():
        response["endpoints"].append({
            "route": rule.rule,
            "methods": list(rule.methods),
            "handler": rule.endpoint
        })
    return response

@APP.route("/doc/endpoint/<string:handler>")
def endpoint(handler:str):
    """
    """
    hf = API_APPLICATION.view_functions[handler]
    types = {}
    hash = hf.__hash__()
    for k, v in hf.__annotations__.items():
        types[k] = v.__name__
    return {
        "types": types,
        "docstring": hf.__doc__,
        "hash": "0x%x" % hash if 0 <= hash else "-0x%x" % -hash
    }

@APP.route("/doc/public/<path:path>")
def public(path):
    """
    """
    return flask.send_from_directory(MOD_PATH + "/public", path)

def main():
    """
    """
    pywsgi.WSGIServer(("0.0.0.0", 5000), APP).serve_forever()

if __name__ == "__main__":
    main()
