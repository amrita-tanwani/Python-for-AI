from modules.ai_agent.tools import TOOLS
from langchain_core.messages import SystemMessage
from langchain_   

def build_grapgh(model = None ,tools=None):
    
    tools =  TOOLS if tools is None else tools
    model = create 