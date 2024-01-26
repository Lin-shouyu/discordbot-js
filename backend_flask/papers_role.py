import os
import re
import sys
import openai
from flask import Flask, request, jsonify
from dotenv import load_dotenv, find_dotenv
from langchain.chains import RetrievalQA
from langchain.chains.query_constructor.base import AttributeInfo
from langchain.document_loaders import PyPDFLoader
from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.llms import OpenAI
from langchain.prompts import PromptTemplate
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores.chroma import Chroma
from langchain.memory import ConversationBufferMemory
app = Flask(__name__)

# read local .env file
#sys.path.append('../..')
_ = load_dotenv(find_dotenv())
openai.api_key = os.environ['OPENAI_API_KEY']

# Load existing vectordb
embedding = OpenAIEmbeddings()
persist_directory = './papers/chroma/'
vectordb = Chroma(persist_directory=persist_directory, embedding_function=embedding)

def query(question,selectedValue):

    memory = ConversationBufferMemory(
        memory_key="chat_history",
        return_messages=True
    )

    metadata_field_info = [
        AttributeInfo(
            name="source",
            description="這個屬性用於提高文件搜索系統的效率和準確性。它的主要功能是當使用者提供的描述與 `/papers` "
                        "資料夾中的任何檔案名稱匹配或相似時，這個屬性將啟動特殊行為：系統會僅在匹配到的檔案中進行搜索，而不是在整個資料夾中進行。這樣做旨在確保搜索結果的相關性和準確性，並減少不必要的資源消耗。",
            type="string",
        ),
        AttributeInfo(
            name="page",
            description="The page from the lecture",
            type="integer",
        ),
    ]
    # 根據將傳入值輸入至prompt

    template = """ Use the following pieces of context to answer the question at the
    end.  Ensure the response is directly relevant to the question and grounded in the context. 
    If you don't know the answer, just say that you don't know, don't try to make up an answer. Keep the answer
    as detail as possible. {context} Question: {question}   """
    template = template + "你要輸出答覆的語氣是:" + selectedValue + "並根據語氣調整你的回答，越鮮明越好"
    qa_chain_prompt = PromptTemplate(input_variables=["context", "question", ], template=template, )

    llm = OpenAI(model='gpt-3.5-turbo-instruct', temperature=0)
    # Run chain
    qa_chain = RetrievalQA.from_chain_type(
        llm,
        retriever=vectordb.as_retriever(),
        return_source_documents=True,
        chain_type_kwargs={"prompt": qa_chain_prompt}
    )
    result = qa_chain({"query": question})
    # Check for source documents in the result
    if 'source_documents' in result and result['source_documents']:
        # 获取第一个文档的元数据
        source_doc = result['source_documents'][0]
        if hasattr(source_doc, 'metadata'):
            source = source_doc.metadata.get('source', '未知')
            page = source_doc.metadata.get('page', '未知')
            result['source'] = source
            result['page'] = page+1
    else:
        result['source'] = None
        result['page'] = None
    return result 




