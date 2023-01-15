from flask import Flask, request, Response, session
from json import dumps, loads

app = Flask(__name__)
app.secret_key = 'super secret key'
objects = []
counter = 0

@app.route("/")
def hello_world():
    return "<p>Hello, World!</p>"

@app.route('/canvas', methods=["GET"])
def canvas():
    canvas = {
        "initialzed": False,
        "x": -1,
        "y": -1,
    }
    if 'canvas' in session:
        canvas = session['canvas']
    res = Response(response=dumps(canvas), status=200, mimetype="text/plain")
    res.headers['Access-Control-Allow-Origin'] = '*'
    return res

@app.route('/canvas/set', methods=["POST"])
def setCanvas():
    x = request.args.get('x')
    y = request.args.get('y')
    session['canvas'] = {
        "initialzed": True,
        "x": x,
        "y": y,
    }
    data = {'message': 'Done', 'code': 'SUCCESS'}
    return Response(response=dumps(data), status=201)


@app.route('/data', methods=["GET"])
def get_data():
    global objects
    res = Response(response=dumps(objects), status=200, mimetype="text/plain")
    res.headers['Access-Control-Allow-Origin'] = '*'
    return res

@app.route('/data/add', methods=["POST"])
def add_data():
    global objects
    global counter
    type = request.args.get('type')
    x = request.args.get('x')
    y = request.args.get('y')
    obj = {
        "id": str(counter),
        "type": type,
        "x": float(x),
        "y": float(y),
    }
    counter += 1
    objects.append(obj)
    res = Response(response=dumps(objects), status=201, mimetype="text/plain")
    res.headers['Access-Control-Allow-Origin'] = '*'
    return res

@app.route('/data/update', methods=["POST"])
def update_data():
    global objects
    item = loads(request.data)
    print(item)
    for i in range(len(objects)):
        id = objects[i]["id"]
        if id == item["id"]:
            objects[i] = {
                "id": item["id"],
                "type": objects[i]["type"],
                "x": float(item["x"]),
                "y": float(item["y"]),
            }
    res = Response(response=dumps(objects), status=201, mimetype="text/plain")
    res.headers['Access-Control-Allow-Origin'] = '*'
    return res

@app.route('/data/clear', methods=["POST"])
def clear_data():
    global objects
    objects = []
    res = Response(response=dumps(objects), status=200, mimetype="text/plain")
    res.headers['Access-Control-Allow-Origin'] = '*'
    return res

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
