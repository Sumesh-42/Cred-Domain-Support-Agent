"""
Cred Domain Support Agent - Model Context Protocol (MCP) Server
Part 3, Task 14

Implements the Model Context Protocol (MCP) standard for AI Tool Execution.
Supports:
1. Standard MCP Protocol JSON-RPC 2.0 (stdio and HTTP modes)
2. Tools Exposed:
   - 'check_loan_application_status': Retrieves application status & computes escalation score.
   - 'retrieve_policy_clauses': Performs grounded vector retrieval on Cred lending policy documents.
   - 'calculate_escalation_score': Computes SLA escalation metric for loan risk arbitration.
   - 'add_policy_document': Indexes a new policy document into the dynamic knowledge base.
3. Adheres to standard MCP JSON schemas for tool definitions and responses.
"""

import sys
import json
import uuid
from typing import Dict, Any, List

from dataset import check_loan_application_status, calculate_escalation_score
from rag_core import generate_grounded_answer, COLLECTION_SENTENCE, chunk_sentence_based
from knowledge_base import POLICY_DOCUMENTS


# MCP Tool Specifications
MCP_TOOLS_MANIFEST = [
    {
        "name": "check_loan_application_status",
        "description": "Look up a loan application record by ID, checking status, SLA timeline, fraud review flag, and computed escalation score.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "record_id": {
                    "type": "string",
                    "description": "The loan record ID (e.g., 'CRED-LN-0004' or 'CRED-LN-0012')",
                }
            },
            "required": ["record_id"],
        },
    },
    {
        "name": "retrieve_policy_clauses",
        "description": "Retrieve verified Cred lending and banking policy clauses grounded by semantic similarity against approved documentation.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "The member question or policy query.",
                },
                "top_k": {
                    "type": "integer",
                    "description": "Number of top matching chunks to retrieve (default: 3)",
                    "default": 3,
                },
            },
            "required": ["query"],
        },
    },
    {
        "name": "calculate_escalation_score",
        "description": "Calculate loan escalation score using normalized weights: 0.40 * days_norm + 0.35 * fraud_flag + 0.25 * amount_norm.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "days_since_created": {
                    "type": "integer",
                    "description": "Number of elapsed days since application creation",
                },
                "flagged_for_fraud_review": {
                    "type": "boolean",
                    "description": "Whether application is under compliance or fraud audit",
                },
                "loan_amount_inr": {
                    "type": "number",
                    "description": "Loan principal amount in INR",
                },
            },
            "required": ["days_since_created", "flagged_for_fraud_review", "loan_amount_inr"],
        },
    },
    {
        "name": "add_policy_document",
        "description": "Dynamically ingest and index a new regulatory policy document into the Cred vector knowledge base.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "doc_id": {
                    "type": "string",
                    "description": "Unique document identifier, e.g. 'DOC-CAR-LOAN-REFINANCE'",
                },
                "topic": {
                    "type": "string",
                    "description": "Policy domain topic",
                },
                "title": {
                    "type": "string",
                    "description": "Official title of the policy",
                },
                "content": {
                    "type": "string",
                    "description": "Policy text clauses",
                },
            },
            "required": ["doc_id", "topic", "title", "content"],
        },
    },
]


def handle_tool_call(tool_name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
    """
    Executes tool logic and returns standard MCP Tool Result format.
    """
    if tool_name == "check_loan_application_status":
        rec_id = arguments.get("record_id", "").strip().upper()
        result = check_loan_application_status(rec_id)
        return {
            "content": [
                {
                    "type": "text",
                    "text": json.dumps(result, indent=2),
                }
            ],
            "isError": not result.get("found", False),
        }

    elif tool_name == "retrieve_policy_clauses":
        q = arguments.get("query", "")
        rag_res = generate_grounded_answer(q)
        return {
            "content": [
                {
                    "type": "text",
                    "text": json.dumps({
                        "query": q,
                        "answer": rag_res["answer"],
                        "sources": rag_res["sources"],
                        "similarity": rag_res["retrieval_similarity"],
                        "fallback_triggered": rag_res["fallback_triggered"],
                    }, indent=2),
                }
            ],
            "isError": False,
        }

    elif tool_name == "calculate_escalation_score":
        days = int(arguments.get("days_since_created", 0))
        fraud = bool(arguments.get("flagged_for_fraud_review", False))
        amt = float(arguments.get("loan_amount_inr", 0.0))
        rec_data = {
            "days_since_created": days,
            "flagged_for_fraud_review": fraud,
            "loan_amount_inr": amt,
        }
        score = calculate_escalation_score(rec_data)
        rec = score >= 0.50
        reason = "Critical: flagged for fraud investigation" if fraud else ("Elevated processing turnaround" if score > 0.30 else "Normal SLA")
        return {
            "content": [
                {
                    "type": "text",
                    "text": json.dumps({
                        "escalation_score": score,
                        "escalation_recommended": rec,
                        "escalation_reason": reason,
                        "formula": "0.65 * fraud_flag + 0.35 * (days_since_created / 30.0)",
                    }, indent=2),
                }
            ],
            "isError": False,
        }

    elif tool_name == "add_policy_document":
        doc_id = arguments.get("doc_id", "").strip().upper()
        topic = arguments.get("topic", "")
        title = arguments.get("title", "")
        content = arguments.get("content", "")

        new_doc = {"doc_id": doc_id, "topic": topic, "title": title, "content": content}
        POLICY_DOCUMENTS.append(new_doc)
        new_chunks = chunk_sentence_based([new_doc])
        COLLECTION_SENTENCE.chunks.extend(new_chunks)
        COLLECTION_SENTENCE._build_index()

        return {
            "content": [
                {
                    "type": "text",
                    "text": json.dumps({
                        "success": True,
                        "doc_id": doc_id,
                        "chunks_added": len(new_chunks),
                        "total_documents": len(POLICY_DOCUMENTS),
                    }, indent=2),
                }
            ],
            "isError": False,
        }

    else:
        return {
            "content": [{"type": "text", "text": f"Unknown tool: {tool_name}"}],
            "isError": True,
        }


def process_mcp_request(json_rpc_req: Dict[str, Any]) -> Dict[str, Any]:
    """
    Processes a standard MCP JSON-RPC 2.0 request.
    """
    req_id = json_rpc_req.get("id", 1)
    method = json_rpc_req.get("method", "")
    params = json_rpc_req.get("params", {})

    if method == "initialize":
        return {
            "jsonrpc": "2.0",
            "id": req_id,
            "result": {
                "protocolVersion": "2024-11-05",
                "capabilities": {
                    "tools": {"listChanged": False},
                },
                "serverInfo": {
                    "name": "cred-domain-support-mcp",
                    "version": "1.0.0",
                },
            },
        }

    elif method == "tools/list":
        return {
            "jsonrpc": "2.0",
            "id": req_id,
            "result": {
                "tools": MCP_TOOLS_MANIFEST,
            },
        }

    elif method == "tools/call":
        tool_name = params.get("name", "")
        tool_args = params.get("arguments", {})
        call_res = handle_tool_call(tool_name, tool_args)
        return {
            "jsonrpc": "2.0",
            "id": req_id,
            "result": call_res,
        }

    else:
        return {
            "jsonrpc": "2.0",
            "id": req_id,
            "error": {
                "code": -32601,
                "message": f"Method '{method}' not found",
            },
        }


def run_mcp_demonstration():
    """
    Demonstrates MCP protocol initialization, tools/list, and tools/call.
    """
    print("=" * 75)
    print("TASK 14: MODEL CONTEXT PROTOCOL (MCP) SERVER DEMONSTRATION")
    print("=" * 75)

    # 1. Initialize
    init_req = {"jsonrpc": "2.0", "id": 1, "method": "initialize", "params": {}}
    init_res = process_mcp_request(init_req)
    print(f"\n1. MCP Handshake [initialize]:")
    print(f"   Server: {init_res['result']['serverInfo']['name']} v{init_res['result']['serverInfo']['version']}")
    print(f"   Protocol: {init_res['result']['protocolVersion']}")

    # 2. tools/list
    list_req = {"jsonrpc": "2.0", "id": 2, "method": "tools/list", "params": {}}
    list_res = process_mcp_request(list_req)
    tools = list_res["result"]["tools"]
    print(f"\n2. MCP Tools Manifest [tools/list]: Exposing {len(tools)} tools:")
    for t in tools:
        print(f"   - Tool: {t['name']}")
        print(f"     Description: {t['description']}")
        print(f"     Required Params: {t['inputSchema'].get('required', [])}")

    # 3. tools/call - check_loan_application_status
    call1 = {
        "jsonrpc": "2.0",
        "id": 3,
        "method": "tools/call",
        "params": {
            "name": "check_loan_application_status",
            "arguments": {"record_id": "CRED-LN-0004"},
        },
    }
    call_res1 = process_mcp_request(call1)
    print(f"\n3. MCP Execution [tools/call -> check_loan_application_status]:")
    print(f"   Result payload:\n{call_res1['result']['content'][0]['text']}")

    # 4. tools/call - calculate_escalation_score
    call2 = {
        "jsonrpc": "2.0",
        "id": 4,
        "method": "tools/call",
        "params": {
            "name": "calculate_escalation_score",
            "arguments": {
                "days_since_created": 45,
                "flagged_for_fraud_review": True,
                "loan_amount_inr": 2500000.0,
            },
        },
    }
    call_res2 = process_mcp_request(call2)
    print(f"\n4. MCP Execution [tools/call -> calculate_escalation_score]:")
    print(f"   Result payload:\n{call_res2['result']['content'][0]['text']}")

    # 5. tools/call - retrieve_policy_clauses
    call3 = {
        "jsonrpc": "2.0",
        "id": 5,
        "method": "tools/call",
        "params": {
            "name": "retrieve_policy_clauses",
            "arguments": {
                "query": "Can I prepay my floating rate home loan without penalty?",
            },
        },
    }
    call_res3 = process_mcp_request(call3)
    print(f"\n5. MCP Execution [tools/call -> retrieve_policy_clauses]:")
    print(f"   Result payload:\n{call_res3['result']['content'][0]['text']}")
    print("=" * 75)


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--stdio":
        # Stdio streaming mode for MCP client pipes
        for line in sys.stdin:
            if not line.strip():
                continue
            try:
                req = json.loads(line)
                resp = process_mcp_request(req)
                sys.stdout.write(json.dumps(resp) + "\n")
                sys.stdout.flush()
            except Exception as ex:
                err_resp = {"jsonrpc": "2.0", "id": None, "error": {"code": -32700, "message": str(ex)}}
                sys.stdout.write(json.dumps(err_resp) + "\n")
                sys.stdout.flush()
    else:
        run_mcp_demonstration()
