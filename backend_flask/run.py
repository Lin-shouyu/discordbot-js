import numpy as np
import papers
import papers_role
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/')
def index():
    return 'hello!!'

@app.route('/query', methods=['POST'])
def query_from_llm():
    question = request.get_json()
    result = papers.query(question['question'])  
    return jsonify({'result': result['result'] , 'source': result['source'] , 'page': result['page']})


@app.route('/query_in_role_qa', methods=['POST'])
def query_in_role_qa():
    question = request.get_json()
    result = papers_role.query(question['question'],question['selectedValue'])  
    return jsonify({'result': result['result'] , 'source': result['source'] , 'page': result['page']})
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)