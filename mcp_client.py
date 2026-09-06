"""
Cred Domain Support Agent - Model Context Protocol (MCP) Client
Tool Protocol Invocation

Calls check_loan_application_status for two record IDs over MCP.
"""

import sys
import json
from mcp_server import dispatch_mcp_request


def call_mcp_tool(tool_name: str, arguments: dict) -> dict:
    """
    Sends standard MCP JSON-RPC 2.0 tool call to server.
    """
    rpc_request = {
        "jsonrpc": "2.0",
        "id": "client-req-001",
        "method": "tools/call",
        "params": {
            "name": tool_name,
            "arguments": arguments,
        },
    }
    return dispatch_mcp_request(rpc_request)


def run_client_calls(record_ids=("CRED-LN-0001", "CRED-LN-0002")):
    print("=" * 65)
    print("CRED DOMAIN SUPPORT AGENT - MCP CLIENT TOOL INVOCATION")
    print("=" * 65)

    for rec_id in record_ids:
        print(f"\n[MCP Call] Invoking 'check_loan_application_status' for '{rec_id}':")
        resp = call_mcp_tool("check_loan_application_status", {"record_id": rec_id})
        content = resp.get("result", {}).get("content", [{}])[0].get("text", "{}")
        parsed = json.loads(content)
        print(f"  Category       : {parsed.get('category')}")
        print(f"  Status         : {parsed.get('status')}")
        print(f"  Amount (INR)   : {parsed.get('loan_amount_inr'):,}")
        print(f"  Escalation     : {parsed.get('escalation_score'):.4f} (Recommended: {parsed.get('escalation_recommended')})")
        print(f"  Reason         : {parsed.get('escalation_reason')}")

    print("\n" + "=" * 65)
    print("MCP CLIENT DISPATCH COMPLETED SUCCESSFULLY")
    print("=" * 65)


if __name__ == "__main__":
    records = sys.argv[1:3] if len(sys.argv) > 1 else ("CRED-LN-0001", "CRED-LN-0002")
    run_client_calls(records)
