import hashlib  # for password hashing
import os  # for environment variables
import traceback  # for debugging

import jwt  # for JWT authentication
from dotenv import load_dotenv  # for environment variables
from flask import Flask, jsonify, request, send_file
from flask_cors import CORS

from utils import auth
from utils.database import Database
import subprocess
# Load environment variables
load_dotenv(override=True)
JWT_SECRET: str = os.getenv("JWT_SECRET")  # type: ignore


from datetime import timedelta


from google.cloud import storage
from google.oauth2 import service_account

# from google.colab import auth
# auth.authenticate_user()
import sys
import requests

# 下載檔案的函式
def download_file(url):
    """从指定的 URL 下载文件，返回响应对象"""
    response = requests.get(url)
    response.raise_for_status()  # 确保请求成功
    return response

def upload_blob_from_url(bucket_name, destination_blob_name, url):
    """從 URL 下載文件並上傳到 Google Cloud Storage"""
    storage_client = storage.Client()
    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(destination_blob_name)

    response = download_file(url)

    # 上传文件内容
    blob.upload_from_string(response.content)

    print(f"文件從 {url} 下載並上傳到 {destination_blob_name}.")

    return blob.generation

def upload_blob_from_url_version(bucket_name, destination_blob_name, url):
    """從 URL 下載文件並上傳到 Google Cloud Storage"""
    storage_client = storage.Client()
    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(destination_blob_name)

    response = download_file(url)

    # 上传文件内容
    blob.upload_from_string(response.content)

    print(f"文件從 {url} 下載並上傳到 {destination_blob_name}.")

    return blob.generation    

def delete_blob(bucket_name, blob_name):
    """刪除 Google Cloud Storage 中的檔案 (blob)"""
    storage_client = storage.Client()

    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(blob_name)

    blob.delete()

    print(f"Blob '{blob_name}' deleted.")


def init_storage_client(cred_file, bucket_name):
    """初始化 Google Cloud Storage 客戶端和存儲桶"""
    credentials = service_account.Credentials.from_service_account_file('tsid4-411810-c5a23a3561b4.json')
    storage_client = storage.Client(credentials=credentials)
    bucket = storage_client.bucket(bucket_name)
    return storage_client, bucket

# def upload_to_storage(files, bucket):
#     versions = []
#     for file in files:
#         blob = bucket.blob(file.filename)
#         blob.upload_from_file(file)
#         versions.append(blob.generation)
#     return versions

def upload_to_storage(file, bucket, file_name):
    """將文件上傳到 Google Cloud Storage，返回版本號"""
    blob = bucket.blob(file_name)
    blob.upload_from_file(file)
    return blob.generation
def delete_specific_version_of_blob(bucket_name, blob_name, generation):
    """刪除 Google Cloud Storage 中的檔案 (blob)"""
    storage_client = storage.Client()

    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(blob_name, generation=generation)
    blob.delete()

    print(f"Blob '{blob_name}' version'{generation}' deleted. ")


# 存桶名稱
# bucket_name = os.getenv("bucket_name")

# Initialize the Flask app
app = Flask(__name__)
CORS(app)


# 全域服務帳戶密鑰文件路徑和 storage_client
credentials = service_account.Credentials.from_service_account_file('tsid4-411810-c5a23a3561b4.json')
storage_client = storage.Client(credentials=credentials)



# 連上 google cloud storage
project_id = os.getenv("project_id")  # 替換為您的 Google Cloud 專案 ID
command = f"gcloud config set project {project_id}"
try:
    # 运行命令
    subprocess.run(command, shell=True, check=True)
    print(f"Successfully set project to {project_id}")
    # print(sys.argv)
except subprocess.CalledProcessError as e:
    print(f"Error setting project: {e}")

# 
@app.route("/api/auth/docinfo", methods=["POST"])
def docinfo():
    # Initialize the database connection
    db = Database()
    try:
        # Get the data from the request body
        data: dict[str, str] = request.json  # type: ignore
        DocName: str = data.get("DocName")  # type: ignore
        FilePath: str = data.get("FilePath")  # type: ignore
        UserName: str = data.get("UserName")  # type: ignore

        # Query to get DepName from users table
        dep_query = "SELECT department FROM users WHERE UserName = %s"
        db.cursor.execute(dep_query, (UserName,))
        dep_row = db.cursor.fetchone()
        if dep_row:
            DepName = dep_row[0]
        else:
            # Handle the case when DepName is not found for the UserName
            return jsonify({"error": f"DepName not found for UserName: {UserName}"}), 404

        # Query to get bucket_name from department table based on DepName
        bucket_query = "SELECT bucket_name FROM department WHERE DepName = %s"
        db.cursor.execute(bucket_query, (DepName,))
        bucket_row = db.cursor.fetchone()
        if bucket_row:
            bucket_name = bucket_row[0]
        else:
            # Handle the case when bucket_name is not found for the DepName
            return jsonify({"error": f"bucket_name not found for DepName: {DepName}"}), 404

        # Format the user data
        user_data: dict[str, str] = {
            "DocName": DocName,
            "FilePath": FilePath,
            "UserName": UserName,
            "DepName": DepName,
        }



        # Your existing code for iterating through department rows and other logic

        
        

        response = requests.get(FilePath, stream=True)
        response.raise_for_status()  # 確保請求成功


        storage_client = storage.Client()

        bucket = storage_client.bucket(bucket_name)


        blob = bucket.blob(DocName)
        blob.upload_from_file(response.raw)
        file_version_number = blob.generation

        try:

            download_aip = 'http://140.120.14.105:5000/api/test_download'
            response = requests.post(download_aip, json=user_data)
            response.raise_for_status()

                # 如果請求成功，你可以在這裡處理 response 的內容
            print(response.json())

        except requests.exceptions.RequestException as e:
                # 如果請求失敗，這裡處理例外狀況
                print(f"An error occurred: {str(e)}")            



        insert_query = """
            INSERT INTO docinfo (
                DocName,
                UserName,
                DepName,
                VersionNum
            ) VALUES (%s, %s, %s, %s)
        """

        insert_values = (DocName, UserName, DepName, file_version_number)

        db.cursor.execute(insert_query, insert_values)
        db.conn.commit()



        # upload_blob_from_url(bucket_name, destination_blob_name, file_url)


        return jsonify({"message": "File uploaded successfully."}), 200

    except Exception as e:
        db.conn.rollback()
        error_info = traceback.format_exc()
        print("Error at docinfo: " + error_info)
        return jsonify({"error": "Internal server error: " + error_info}), 500


# 參考get_courses的修改
@app.route("/api/get/docinfo", methods=["GET"])
def get_docinfo():
    db = Database()
    try:
        db.cursor.execute("SELECT * FROM docinfo")
        rows = db.cursor.fetchall()

        docinfos = []
        for row in rows:
            docinfo = {
                "DocName": row[0],
                "FilePath": row[1],
                "UserName": row[2],
                "CreatedTime": row[4],
                "DepName": row[3],
                "VersionNum":row[5],

            }

            docinfos.append(docinfo) 

        return jsonify({"docinfos": docinfos, "docinfos_count": len(docinfos)}), 200
    except Exception:
        db.conn.rollback()
        error_info = traceback.format_exc()
        print("Error at get_docinfo: " + error_info)
        return jsonify({"error": "Internal server error: " + error_info}), 500


@app.route("/api/get/docinfo_dep", methods=["GET"])
def get_docinfo_dep():
    db = Database()
    try:
        db.cursor.execute("SELECT * FROM docinfo")
        rows = db.cursor.fetchall()

        docinfos = {}
        for row in rows:
            key = (row[0], row[3])  # Use docname and depname as a key
            if key not in docinfos:
                docinfos[key] = {
                    "DocName": row[0],
                    "FilePath": row[1],
                    "UserName": row[2],
                    "CreatedTime": row[4],
                    "DepName": row[3],
                    "VersionNum": row[5],
                }

        # Convert the dictionary values to a list
        docinfos_list = list(docinfos.values())

        return jsonify({"docinfos": docinfos_list, "docinfos_count": len(docinfos_list)}), 200
    except Exception:
        db.conn.rollback()
        error_info = traceback.format_exc()
        print("Error at get_docinfo: " + error_info)
        return jsonify({"error": "Internal server error: " + error_info}), 500







@app.route("/api/search/doc_info", methods=["GET"])
def search_docinfo():
    # Initialize the database connection
    db = Database()
    try:
        data: dict[str, str] = request.json  # type: ignore
        print(data)
        Doc_Name = data.get("DocName")  # type: ignore
        Dep_Name = data.get("DepName")  # type: ignore
        if Doc_Name is None:
            Doc_Name = ""
        if Dep_Name is None:
            Dep_Name = ""
        db.cursor.execute(
            "SELECT * FROM docinfo WHERE DocName LIKE %s AND DepName LIKE %s",
            (f"%{Doc_Name}%", f"%{Dep_Name}%"),
        )
        rows = db.cursor.fetchall()

        docinfos = []
        for row in rows:
            docinfo = {
                "DocName": row[0],
                "FilePath": row[1],
                "UserName": row[2],
                "DepName": row[3],
                "CreatedTime": row[4],
            }
            # Fetch entered students for each course
            # db.cursor.execute("SELECT UserID FROM courseEnter WHERE CourseID = %s", (course["id"],))  # type: ignore
            # entered_students = db.cursor.fetchall()
            # entered_students_id = [student[0] for student in entered_students]

            # course["entered_students_id"] = entered_students_id
            docinfos.append(docinfo)

        return jsonify({"docinfos": docinfos, "docinfos_count": len(docinfos)}), 200
    except Exception:
        db.conn.rollback()
        error_info = traceback.format_exc()
        print("Error at search_course: " + error_info)
        return jsonify({"error": "Internal server error: " + error_info}), 500

@app.route("/api/delete/doc/<string:doc_name>", methods=["DELETE"])
def delete_doc(doc_name):
    db = Database()
    try:
        # Fetch existing course details from the database
        query: str = "SELECT * FROM docinfo WHERE DocName = %s"
        db.cursor.execute(query, (doc_name,))
        existing_doc: tuple[str, ...] | None = db.cursor.fetchone()  # type: ignore

        if not existing_doc:
            return jsonify({"error": "Document does not exist!"}), 404  # 404 for Not Found

        dep_query = "SELECT DepName FROM docinfo WHERE DocName = %s"
        db.cursor.execute(dep_query, (doc_name,))
        dep_row = db.cursor.fetchone()
        if dep_row:
            DepName = dep_row[0]
        else:
            # Handle the case when DepName is not found for the UserName
            return jsonify({"error": f"DepName not found for UserName: {UserName}"}), 404

        # Query to get bucket_name from department table based on DepName
        bucket_query = "SELECT bucket_name FROM department WHERE DepName = %s"
        db.cursor.execute(bucket_query, (DepName,))
        bucket_row = db.cursor.fetchone()
        if bucket_row:
            bucket_name = bucket_row[0]
        else:
            # Handle the case when bucket_name is not found for the DepName
            return jsonify({"error": f"bucket_name not found for DepName: {DepName}"}), 404

        blob_name = doc_name
        delete_blob(bucket_name, blob_name)
        print("delete!")

        # Delete the course in the database
        delete_query: str = "DELETE FROM docinfo WHERE DocName = %s"
        delete_values: tuple[str] = (doc_name,)
        db.cursor.execute(delete_query, delete_values)
        db.conn.commit()

        return jsonify({"message": "Document deleted successfully"}), 200

    except Exception as e:
        db.conn.rollback()
        error_info = traceback.format_exc()
        print("Error at delete_doc: " + error_info)
        return jsonify({"error": "Internal server error: " + str(e)}), 500


@app.route("/api/auth/login", methods=["POST"])
def login():
    # Initialize the database connection
    db = Database()
    try:
        # Get the email and password from the request body
        data: dict[str, str] = request.json  # type: ignore
        emp_id: str = data.get("emp_id")  # type: ignore
        password: str = data.get("password")  # type: ignore
        # password_hash: str = hashlib.sha256(password.encode("utf-8")).hexdigest()

        # Check if the user exists in the database
        query: str = "SELECT * FROM users WHERE Employee_ID = %s AND Emp_password = %s"
        values: tuple[str, str] = (emp_id, password)
        db.cursor.execute(query, values)
        user_row_data: tuple | None = db.cursor.fetchone()

        # If the user does not exist, return an error
        if user_row_data is None:
            return jsonify({"error": "Invalid email or password"}), 401

        user_data: dict = {
            "UserName": user_row_data[1],
            "Department": user_row_data[2],
            "PositionTitle": user_row_data[4],
            "Employee_ID": user_row_data[6],
            "role": "ADMIN",
        }


        # If the user exists, prepare the response
        access_token: str = auth.create_token(user_data)

        # Log and send the response
        response = jsonify({"accessToken": access_token, "user": user_data})

        return response, 200

    except Exception:
        db.conn.rollback()
        error_info = traceback.format_exc()
        print("Error at login: " + error_info)
        return jsonify({"error": "Internal server error: " + error_info}), 500



# 上傳多個文件(網頁)

@app.route('/api/upload', methods=['POST'])
def upload_file():
    db = Database()
    try:
        authorization: str = request.headers.get("Authorization")
        profile: dict[str, str] = auth.get_profile(authorization)
        DepName = profile.get("Department")
        UserName = profile.get("UserName")
    
        if 'file' not in request.files:
            return 'No file part'

        file = request.files['file']

        if file.filename == '':
            return 'No selected file'

    # 獲取檔案名稱
        filename = file.filename

        # Query to get bucket_name from department table based on DepName
        bucket_query = "SELECT bucket_name FROM department WHERE DepName = %s"
        db.cursor.execute(bucket_query, (DepName,))
        bucket_row = db.cursor.fetchone()
        if bucket_row:
            bucket_name = bucket_row[0]
        else:
            # Handle the case when bucket_name is not found for the DepName
            return jsonify({"error": f"bucket_name not found for DepName: {DepName}"}), 404


        user_data: dict[str, str] = {
            "DocName": filename,
            "UserName": UserName,
            "DepName": DepName,
        }

        DocName = filename



        bucket_name = bucket_name
        cred_file = 'tsid4-411810-c5a23a3561b4.json'

        storage_client, bucket = init_storage_client(cred_file, bucket_name)
        version = upload_to_storage(file, bucket, file.filename)

        # file_version_number = upload_blob_from_url_version(bucket_name, destination_blob_name, file_url)        
        insert_query: str = """
                INSERT INTO docinfo (
                    DocName,
                    UserName,
                    DepName,
                    VersionNum
                ) VALUES (%s, %s, %s, %s)
                """
        insert_values: tuple[str, str, str, str] = (DocName, UserName, DepName, version)
        db.cursor.execute(insert_query, insert_values)
        db.conn.commit()


        return 'File uploaded successfully. Filename: {}'.format(filename)

    except Exception:
        db.conn.rollback()
        error_info = traceback.format_exc()
        print("Error at upload_file: " + error_info)
        return jsonify({"error": "Internal server error: " + error_info}), 500





@app.route("/api/auth/profile", methods=["GET"])
def get_profile():
    authorization: str = request.headers.get("Authorization")  # type: ignore
    profile = auth.get_profile(authorization)
    db = Database()
    try:
        query: str = "SELECT * FROM users WHERE UserName = %s"
        values = (profile.get("UserName", "0"),)
        db.cursor.execute(query, values)
        user_row_data: tuple | None = db.cursor.fetchone()

        # If the user does not exist, return an error
        if user_row_data is None:
            print(query, values, profile)
            return jsonify({"error": "Invalid Employee_ID or Employee_password"}), 401

        user_data: dict = {
            "UserName": user_row_data[1],
            "Department": user_row_data[2],
            "PositionTitle": user_row_data[4],
            "Employee_ID": user_row_data[6],
        }

        return jsonify({"user": user_data}), 200
    except jwt.ExpiredSignatureError:
        return jsonify({"message": "Token has expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"message": "Invalid token"}), 401



@app.route('/api/upload_test', methods=['POST'])
def upload_files():
    db = Database()
    # try:
    authorization: str = request.headers.get("Authorization")
    profile: dict[str, str] = auth.get_profile(authorization)
    DepName = profile.get("Department")
    UserName = profile.get("UserName")

    # Query to get bucket_name from department table based on DepName
    bucket_query = "SELECT bucket_name FROM department WHERE DepName = %s"
    db.cursor.execute(bucket_query, (DepName,))
    bucket_row = db.cursor.fetchone()
    if bucket_row:
        bucket_name = bucket_row[0]
    else:
        # Handle the case when bucket_name is not found for the DepName
        return jsonify({"error": f"bucket_name not found for DepName: {DepName}"}), 404    

    storage_client = storage.Client()
    bucket_name = bucket_name
    files = request.files.getlist('files')

    for file in files:
        blob = storage_client.bucket(bucket_name).blob(file.filename)
        blob.upload_from_file(file)
        generation_num = blob.generation

        try:
            insert_query = """
                INSERT INTO docinfo (
                    DocName,
                    UserName,
                    DepName,
                    VersionNum
                ) VALUES (%s, %s, %s, %s)
            """
            insert_values = (file.filename, UserName, DepName, generation_num)
            db.cursor.execute(insert_query, insert_values)
            db.conn.commit()

            user_data: dict[str, str] = {
            "DocName": file.filename,
            "DepName": DepName,
            }

            try:

                download_aip = 'http://140.120.14.105:5000/api/test_download'
                response = requests.post(download_aip, json=user_data)
                response.raise_for_status()

                    # 如果請求成功，你可以在這裡處理 response 的內容
                print(response.json())

            except requests.exceptions.RequestException as e:
                    # 如果請求失敗，這裡處理例外狀況
                    print(f"An error occurred: {str(e)}")    




        
        except Exception as e:
            db.conn.rollback()  # 回滚数据库事务，以防出现错误
            print(f"Error inserting data into database: {e}")
        
    return 'Files uploaded successfully'   

    # finally:
    #     db.conn.close()
            

    


@app.route("/api/download/doc/<string:doc_name>/<string:depname>", methods=["GET"])
def download_doc(doc_name, depname):
    db = Database()
    authorization: str = request.headers.get("Authorization")
    profile: dict[str, str] = auth.get_profile(authorization)

    DepName = depname

    bucket_query = "SELECT bucket_name FROM Department WHERE DepName = %s"
    db.cursor.execute(bucket_query, (DepName,))
    bucket_row = db.cursor.fetchone()


    if bucket_row:
        bucket_name = bucket_row[0]
    else:
    # Handle the case when bucket_name is not found for the DepName
        return jsonify({"error": f"bucket_name not found for DepName: {DepName}"}), 404

    blob_name = doc_name



    credentials = service_account.Credentials.from_service_account_file('tsid4-411810-c5a23a3561b4.json')
    storage_client = storage.Client(credentials=credentials)
    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(blob_name)
    url = blob.generate_signed_url(expiration=timedelta(seconds=300)) # 可以下載的網址

    # response = send_file(url, as_attachment=True, download_name=doc_name)

    return jsonify({"download_url": url})

@app.route("/api/download_dc/doc", methods=["POST"])
def download_dc_doc():
    db = Database()

    data: dict[str, str] = request.json  # type: ignore
    DocName: str = data.get("DocName")  # type: ignore
    DepName: str = data.get("DepName")  # type: ignore    

    bucket_query = "SELECT bucket_name FROM Department WHERE DepName = %s"
    db.cursor.execute(bucket_query, (DepName,))
    bucket_row = db.cursor.fetchone()

    if bucket_row:
        bucket_name = bucket_row[0]
    else:
    # Handle the case when bucket_name is not found for the DepName
        return jsonify({"error": f"bucket_name not found for DepName: {DepName}"}), 404

    blob_name = DocName



    credentials = service_account.Credentials.from_service_account_file('tsid4-411810-c5a23a3561b4.json')
    storage_client = storage.Client(credentials=credentials)
    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(blob_name)
    url = blob.generate_signed_url(expiration=timedelta(seconds=3600)) # 可以下載的網址
    print(url)
    # response = send_file(url, as_attachment=True, download_name=doc_name)

    return url

@app.route("/api/get/doc/<string:dep_name>/<string:doc_name>", methods=["GET"])
def get_docinf_dep_doc(dep_name, doc_name):
    db = Database()
    try:
        # 使用参数构建查询条件
        query = f"SELECT * FROM docinfo WHERE DepName = '{dep_name}' AND DocName = '{doc_name}'"
        db.cursor.execute(query)
        rows = db.cursor.fetchall()

        docinfos = []
        for row in rows:
            docinfo = {
                "DocName": row[0],
                "FilePath": row[1],
                "UserName": row[2],
                "CreatedTime": row[4],
                "DepName": row[3],
                "VersionNum": row[5],
            }
            docinfos.append(docinfo)

        return jsonify({"docinfos": docinfos, "docinfos_count": len(docinfos)}), 200
    except Exception:
        db.conn.rollback()
        error_info = traceback.format_exc()
        print("Error at get_docinfo: " + error_info)
        return jsonify({"error": "Internal server error: " + error_info}), 500

@app.route("/api/download/doc/<string:doc_name>/<string:depname>/<string:generation>", methods=["GET"])
def download_doc_gen(doc_name, depname, generation):
    db = Database()
    authorization: str = request.headers.get("Authorization")
    profile: dict[str, str] = auth.get_profile(authorization)
    


    DepName = depname
    
    bucket_query = "SELECT bucket_name FROM Department WHERE DepName = %s"
    db.cursor.execute(bucket_query, (DepName,))
    bucket_row = db.cursor.fetchone()

    if bucket_row:
        bucket_name = bucket_row[0]
    else:
    # Handle the case when bucket_name is not found for the DepName
        return jsonify({"error": f"bucket_name not found for DepName: {DepName}"}), 404

    blob_name = doc_name



    credentials = service_account.Credentials.from_service_account_file('tsid4-411810-c5a23a3561b4.json')
    storage_client = storage.Client(credentials=credentials)
    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(blob_name, generation= generation)
    url = blob.generate_signed_url(expiration=timedelta(seconds=300)) # 可以下載的網址

    # response = send_file(url, as_attachment=True, download_name=doc_name)

    return jsonify({"download_url": url})


@app.route("/api/delete/doc/<string:doc_name>/<string:depname>/<string:generation>", methods=["DELETE"])
def delete_doc_gen(doc_name, depname, generation):
    db = Database()
    try:
        # Fetch existing course details from the database
        query: str = "SELECT * FROM docinfo WHERE DocName = %s"
        db.cursor.execute(query, (doc_name,))
        existing_doc: tuple[str, ...] | None = db.cursor.fetchone()  # type: ignore
        results = db.cursor.fetchall() 

        if not existing_doc:
            return jsonify({"error": "Document does not exist!"}), 404  # 404 for Not Found


        DepName = depname

        # Query to get bucket_name from department table based on DepName
        bucket_query = "SELECT bucket_name FROM department WHERE DepName = %s"
        db.cursor.execute(bucket_query, (DepName,))
        bucket_row = db.cursor.fetchone()
        

        if bucket_row:
            bucket_name = bucket_row[0]
        else:
            # Handle the case when bucket_name is not found for the DepName
            return jsonify({"error": f"bucket_name not found for DepName: {depname}"}), 404

        blob_name = doc_name
        delete_specific_version_of_blob(bucket_name, blob_name, generation)

        delete_query: str = "DELETE FROM docinfo WHERE DocName = %s AND DepName = %s AND VersionNum = %s"
        delete_values: tuple[str] = (doc_name, depname, generation)
        db.cursor.execute(delete_query, delete_values)
        db.conn.commit()

        return jsonify({"message": "Document deleted successfully"}), 200
    except Exception as e:
            db.conn.rollback()
            error_info = traceback.format_exc()
            print("Error at delete_doc: " + error_info)
            return jsonify({"error": "Internal server error: " + str(e)}), 500
    
@app.route("/api/test", methods=["post"])
def get_test():
    try:
        # received_data = request.get_json()
        received_data = request.get_json()
        signed_url = received_data.get("signed_url")
        file_name = received_data.get("file_name")

        # 直接使用 signed_url 下載文件
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'}
        
        try:
            
            with requests.get(signed_url, headers=headers, stream=True) as r:
                r.raise_for_status()
                
                # 設定完整路徑
                local_path = file_name
                
                with open(local_path, 'wb') as f:
                    for chunk in r.iter_content(chunk_size=8192):
                        f.write(chunk)
                        
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






@app.route("/api/test_download", methods=["POST"])
def test_download():    
    db = Database()

    # received_data = request.get_json()
    # DocName = received_data["DocName"]
    # DepName = received_data["DepName"]
    received_data = request.get_json()

# 檢查 'DocName' 和 'DepName' 是否存在
    if 'DocName' not in received_data or 'DepName' not in received_data:
        return jsonify({"error": "DocName or DepName is missing in the request"}), 400  # 返回 400 Bad Request

    # 提取數據
    DocName = received_data["DocName"]
    DepName = received_data["DepName"]

    bucket_query = "SELECT bucket_name FROM department WHERE DepName = %s"
    db.cursor.execute(bucket_query, (DepName,))
    bucket_row = db.cursor.fetchone()
    if bucket_row:
        bucket_name = bucket_row[0]
    else:
        # Handle the case when bucket_name is not found for the DepName
        return jsonify({"error": f"bucket_name not found for DepName: {DepName}"}), 404
    
    credentials = service_account.Credentials.from_service_account_file('tsid4-411810-c5a23a3561b4.json')
    storage_client = storage.Client(credentials=credentials)
    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(DocName)
    url = blob.generate_signed_url(expiration=timedelta(seconds=3600)) 

    
    send_api = 'http://140.120.14.104:5000/api/test'
    data_to_send = {"signed_url": url, "file_name": DocName}
    response = requests.post(send_api, json=data_to_send)
    return jsonify({"signed_url": url})



        










if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)


