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

#讀取openai token
_ = load_dotenv(find_dotenv())
openai.api_key = os.environ['OPENAI_API_KEY']

embeddings = OpenAIEmbeddings()
text_splitter = RecursiveCharacterTextSplitter(chunk_size=100, chunk_overlap=50)
persist_directory = './final_test/chroma/'
vectordb = Chroma(persist_directory=persist_directory, embedding_function=embeddings)

def query(question,selectedValue, doc_name):

    #儲存格式問題必續這樣寫
    doc_name= "./final_test\\"+doc_name
    template13 = """
    Use the following pieces of context to answer the question at the
    end.  
    If you don't know the answer, just say that you don't know, don't try to make up an answer.
    Limit your response to five sentences, focusing on precision and relevance.
    Context: '''{context}'''
    Question: '''{question}'''
    Helpful Answer: 
    """
    template13 = template13 + "你要輸出答覆的人物角色語氣是:"+selectedValue  + "並根據語氣調整你的回答，越鮮明越誇張越好"
    qa_chain_prompt = PromptTemplate.from_template(template13)
    document_content_description = "papers"
    llm = OpenAI(model='gpt-3.5-turbo-instruct', temperature=0)

    if doc_name!= "./final_test\\":
        retriever=vectordb.as_retriever(
                search_kwargs={'filter':{'source':doc_name}}
        )
    else:
        retriever=vectordb.as_retriever()
    
    # Run chain
    qa_chain = RetrievalQA.from_chain_type(
        llm,
        retriever=retriever,
        return_source_documents=True,
        chain_type_kwargs={"prompt": qa_chain_prompt}
    )
   


    result = qa_chain({"query": question})
    if 'source_documents' in result and result['source_documents']:
        # 获取第一个文档的元数据
        source_doc = result['source_documents'][0]
        if hasattr(source_doc, 'metadata'): #若未找到檔案 將來源和頁數改為未知
            source = source_doc.metadata.get('source', '未知')
            page = source_doc.metadata.get('page', '未知')
            result['source'] = source
            result['page'] = page+1
    else:
        result['source'] = None
        result['page'] = None
    
    return result

def process_pdf(file_name, directory):
    loader = PyPDFLoader(os.path.join(directory, file_name))
    doc = loader.load()
    doc_split = text_splitter.split_documents(doc)
    vectordb.add_documents(doc_split)
    vectordb.persist()

