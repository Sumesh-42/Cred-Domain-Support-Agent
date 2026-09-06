"""
Cred Domain Support Agent - LangGraph Checkpoint Time-Travel & Step Interruption
Part 3, Task 15

Demonstrates:
1. Step-wise Graph Interruption: Execution paused after 'input_guardrail' or 'loan_status_tool'.
2. SQLite State Persistence: Querying the 'graph_checkpoints' table to inspect thread snapshots.
3. State Resumption: Picking up execution from the exact interrupted state without repeating prior nodes.
4. Time-Travel Rewind: Rewinding a thread's state back to Step 1 and resuming under a modified state.
"""

import sqlite3
import json
import os
from agent import AGENT_GRAPH, init_sqlite_checkpointer, CHECKPOINT_DB_PATH, save_checkpoint


def run_time_travel_demonstration() -> str:
    transcript = []

    def log(msg: str = ""):
        transcript.append(msg)
        print(msg)

    log("=" * 75)
    log("TASK 15: CHECKPOINT TIME-TRAVEL & INTERRUPT RESUMPTION DEMO")
    log("=" * 75)

    thread_id = "thread_timetravel_demo"
    init_sqlite_checkpointer(CHECKPOINT_DB_PATH)

    # 1. Start execution and intentionally interrupt after input_guardrail
    log(f"\n[PHASE 1: STEP INTERRUPTION AFTER 'input_guardrail']")
    query = "Check status for loan application CRED-LN-0004 with PAN ABCDE1234F"
    log(f"Starting Graph Run for Thread: '{thread_id}'")
    log(f"Query: '{query}'")
    log("Setting stop_after_node = 'input_guardrail'")

    interrupted_state = AGENT_GRAPH.run(
        query=query,
        thread_id=thread_id,
        stop_after_node="input_guardrail",
        resume_from_checkpoint=False
    )
    log(f"Interrupted State at Node: '{interrupted_state['current_node']}'")
    log(f"Completed Nodes: {interrupted_state['completed_nodes']}")
    log(f"Masked Query: '{interrupted_state['masked_query']}'")
    log(f"Final Response Populated: {'final_response' in interrupted_state}")

    # 2. Inspect SQLite Checkpoint Table
    log(f"\n[PHASE 2: SQLITE CHECKPOINT AUDIT]")
    conn = sqlite3.connect(CHECKPOINT_DB_PATH)
    cur = conn.cursor()
    cur.execute("SELECT step_index, node_name, timestamp FROM graph_checkpoints WHERE thread_id = ? ORDER BY step_index ASC", (thread_id,))
    rows = cur.fetchall()
    log(f"Stored Checkpoint Steps in SQLite for '{thread_id}':")
    for r in rows:
        log(f"  - Step {r[0]}: Node '{r[1]}' (Timestamp: {r[2]})")

    # 3. Resume from checkpoint to completion
    log(f"\n[PHASE 3: RESUME FROM CHECKPOINT WITHOUT RE-RUNNING PRIOR NODES]")
    resumed_state = AGENT_GRAPH.run(
        query=query,
        thread_id=thread_id,
        resume_from_checkpoint=True
    )
    log(f"Resumed Run Finished at Node: '{resumed_state['current_node']}'")
    log(f"All Completed Nodes: {resumed_state['completed_nodes']}")
    log(f"Agent Final Answer: {resumed_state['final_response']['answer']}")

    # 4. Time-Travel Rewind
    log(f"\n[PHASE 4: TIME-TRAVEL REWIND]")
    log("Rewinding thread state back to Step 1 ('input_guardrail') in SQLite...")
    # Roll back step 2 and step 3 from database
    cur.execute("DELETE FROM graph_checkpoints WHERE thread_id = ? AND step_index > 1", (thread_id,))
    conn.commit()
    conn.close()

    # Verify rollback in DB
    conn = sqlite3.connect(CHECKPOINT_DB_PATH)
    cur = conn.cursor()
    cur.execute("SELECT step_index, node_name FROM graph_checkpoints WHERE thread_id = ? ORDER BY step_index ASC", (thread_id,))
    rewound_rows = cur.fetchall()
    conn.close()
    log(f"Active Checkpoint Steps after Rewind: {rewound_rows}")

    # Resuming from rewound checkpoint
    log("Resuming execution from rewound Step 1 checkpoint:")
    rewound_resumed_state = AGENT_GRAPH.run(
        query=query,
        thread_id=thread_id,
        resume_from_checkpoint=True
    )
    log(f"Time-Travel Branch Execution Succeeded. Final Node: '{rewound_resumed_state['current_node']}'")
    log(f"Completed Nodes in Rewound Branch: {rewound_resumed_state['completed_nodes']}")
    log("=" * 75)

    full_text = "\n".join(transcript)
    os.makedirs("transcripts", exist_ok=True)
    with open("transcripts/task15_timetravel_transcript.txt", "w", encoding="utf-8") as f:
        f.write(full_text)

    return full_text


if __name__ == "__main__":
    run_time_travel_demonstration()
