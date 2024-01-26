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
    result = papers.query(question['question'])  # 调用 query 函数

    #     # 将 Document 对象转换为字典
    # documents_as_dicts = []
    # for document in result:
    #     doc_dict = {
    #         'source': document.metadata.get('source', ''),
    #         'page': document.metadata.get('page', ''),
    #         'page_content': document.page_content,
    #     }
    #     documents_as_dicts.append(doc_dict)
    return jsonify({'result': result['result'] , 'source': result['source'] , 'page': result['page']})
    # return jsonify({'documents': documents_as_dicts, 'current_directory': result['current_directory']})
    # print(que

@app.route('/query_in_role_qa', methods=['POST'])
def query_in_role_qa():
    question = request.get_json()
    #  question['question'] question['selectedValue'] 
    # result = papers.query(question['question'],question['selectedValue'])  # 调用 query 函数
    result = papers_role.query(question['question'],question['selectedValue'])  # 调用 query 函数
    return jsonify({'result': result['result'] , 'source': result['source'] , 'page': result['page']})
    # return jsonify({'result': question['question'] , 'source': question['selectedValue'] })
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)