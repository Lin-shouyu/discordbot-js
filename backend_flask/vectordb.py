import os
import openai
import sys
from langchain.document_loaders import PyPDFLoader
from dotenv import load_dotenv, find_dotenv
from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.vectorstores import Chroma
from langchain.text_splitter import RecursiveCharacterTextSplitter
sys.path.append('../..')
_ = load_dotenv(find_dotenv()) # read local .env file

openai.api_key = os.environ['OPENAI_API_KEY']
embedding = OpenAIEmbeddings()
persist_directory = 'papers/chroma/'
# Load documents
directory = "papers/"
pdf_files = [file for file in os.listdir(directory) if file.endswith('.pdf')]
loaders = [PyPDFLoader(os.path.join(directory, file)) for file in pdf_files]
docs = []
for loader in loaders:
    docs.extend(loader.load())

# Split

text_splitter = RecursiveCharacterTextSplitter(
    chunk_size = 1000,
    chunk_overlap = 150
)
splits = text_splitter.split_documents(docs)
vectordb = Chroma.from_documents(
    documents=splits,
    embedding=embedding,
    persist_directory=persist_directory
)

vectordb.persist()


