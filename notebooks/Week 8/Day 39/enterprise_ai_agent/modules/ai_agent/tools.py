from langchain_core.tools import tool
from core.database.sqlite import save_complaint
order_lists = [
    "OR-1045",
    "OR-1046",
    "OR-1047"
]

# order_list: set[str] = set()
# complaint_list: list[dict] = []

@tool
def fetch_menu()-> list [dict]:
    return[
        {"name": "Margherita Pizza", "price": 850},
        {"name": "Caesar Salad", "price": 450},
        {"name": "Spaghetti Carbonara", "price": 15.99}
    ]
@tool
def validate_order_id(order_id: str) -> bool:
    if order_id in order_list:
        return True
    return False

@tool
def log_complaint(customer_name, order_id, phone, complaint):
    # temp_dict = {
    #     "customer_name": customer_name,
    #     "order_id": order_id,
    #     "phone": phone,
    #     "complaint": complaint,
    #     "status": "Pending"
    # }
    # complaint_list.append(temp_dict)

    return save_complaint(customer_name, order_id, phone, complaint)
    

TOOLS = [
    fetch_menu,
    validate_order_id,
    log_complaint
]