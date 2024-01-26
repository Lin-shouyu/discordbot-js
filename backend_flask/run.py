import numpy as np
import papers
import papers_role_doc
import requests
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
    # 以json方式回傳
    return jsonify({'result': result['result'] , 'source': result['source'] , 'page': result['page']}) 


#可根據檔案名稱指定查詢文件
@app.route('/query_in_role_qa_doc', methods=['POST']) 
def query_in_role_qa_doc():
    question = request.get_json()
    result = papers_role_doc.query(question['question'],question['selectedValue'],question['doc_name'])  # 调用 query 函数
    sauce = result['source']
    substring_to_remove = "./final_test\\"
    if sauce is not None and substring_to_remove in sauce:
        sauce = sauce.replace(substring_to_remove, "")

    return jsonify({'result': result["result"], 'source': sauce , 'page': result['page']})

@app.route("/api/test", methods=["post"])
def get_test():
    try:
        received_data = request.get_json()
        signed_url = received_data.get("signed_url")
        file_name = received_data.get("file_name")
        
        # 直接使用 signed_url 下載文件
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'}
        
        try:
            
            with requests.get(signed_url, headers=headers, stream=True) as r:
                r.raise_for_status()
                
                # 設定完整路徑
                local_path = "./final_test/"+file_name
                
                with open(local_path, 'wb') as f:
                    for chunk in r.iter_content(chunk_size=8192):
                        f.write(chunk)

            #上傳完文件後將新增文件增加至vector資料庫
            papers_role_doc.process_pdf( file_name , "./final_test")
            # 返回完整的檔案路徑
            return local_path
        
        except requests.exceptions.HTTPError as e:
            print(f"HTTP Error: {e}")
            return jsonify({"error": f"HTTP Error: {e}"}), 500  # 在這裡添加一個返回語句
        except requests.exceptions.RequestException as e:
            print(f"Error: {e}")
            return jsonify({"error": f"Error: {e}"}), 500

 

    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500
    

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)