"""Restaurant tools for the AI agent."""

from langchain_core.tools import tool
from core.database.sqlite import save_complaint


order_list = [
    "OR-1045",
    "OR-1046",
    "OR-1047",
]


@tool
def fetch_menu() -> list[dict]:
    """Get the restaurant menu with prices in PKR."""
    return [
        {"name": "Zinger Burger", "price": 850},
        {"name": "Chicken Biryani", "price": 450},
        {"name": "Club Sandwich", "price": 700},
    ]


@tool
def validate_order_id(order_id: str) -> bool:
    """Check if an order ID is valid."""
    return order_id in order_list


@tool
def log_complaint(
    customer_name: str,
    order_id: str,
    phone: str,
    complaint: str,
) -> dict:
    """Save a customer complaint."""
    if not validate_order_id.invoke({"order_id": order_id}):
        return {"error": "Invalid order ID"}

    return save_complaint(
        customer_name,
        order_id,
        phone,
        complaint,
    )


TOOLS = [
    fetch_menu,
    validate_order_id,
    log_complaint,
]