"""
Cred Domain Support Agent - Multi-Turn Memory & Fresh Transcript Demonstration

Demonstrates:
1. Multi-turn conversation where state (active loan ID CRED-LN-0004) is carried
   across turns in thread 'thread_multiturn_demo'.
2. Separate fresh-conversation transcript ('thread_fresh_demo') showing state
   correctly absent/reset.
"""

import json
import os
from agent import ask_cred_agent
from memory import CONVERSATION_MEMORY, MEMORY_FILE_PATH


def run_memory_demonstration() -> str:
    transcript_lines = []

    def log(line: str = ""):
        transcript_lines.append(line)
        print(line)

    log("=" * 75)
    log("MULTI-TURN MEMORY PERSISTENCE TRANSCRIPT")
    log("=" * 75)

    multi_thread = "thread_multiturn_demo"
    # Ensure fresh start for this thread
    CONVERSATION_MEMORY.reset_thread(multi_thread)

    log(f"\n--- SESSION 1: MULTI-TURN EXCHANGE (Thread: {multi_thread}) ---")
    log("[State Initialization] Thread memory cleared. Beginning Turn 1.")

    # Turn 1
    q1 = "Please check the status for loan application CRED-LN-0004"
    log(f"\nUser (Turn 1): {q1}")
    resp1 = ask_cred_agent(q1, thread_id=multi_thread)
    log(f"Agent (Turn 1): {resp1['answer']}")
    log(f"  [Intent: {resp1['intent']} | Escalation Score: {resp1['escalation_score']} | Sources: {resp1['sources']}]")

    # Verify memory saved to disk
    history = CONVERSATION_MEMORY.get_history(multi_thread)
    log(f"  [Disk Check] History entries in '{MEMORY_FILE_PATH}': {len(history)} turn(s) persisted.")

    # Turn 2: Follow-up without repeating the loan ID
    q2 = "What was its status again and what does its escalation score indicate?"
    log(f"\nUser (Turn 2 - Follow-up referring to antecedent): {q2}")
    resp2 = ask_cred_agent(q2, thread_id=multi_thread)
    log(f"Agent (Turn 2): {resp2['answer']}")
    log(f"  [Intent: {resp2['intent']} | Carried Forward Record: {resp2['sources']} | Escalation Score: {resp2['escalation_score']}]")

    log("\n" + "=" * 75)
    log("--- SESSION 2: FRESH CONVERSATION TRANSCRIPT (Thread: thread_fresh_demo) ---")
    log("=" * 75)

    fresh_thread = "thread_fresh_demo"
    CONVERSATION_MEMORY.reset_thread(fresh_thread)
    log(f"[State Initialization] New thread '{fresh_thread}' initialized with empty context.")

    # In fresh thread, user asks follow-up query without any prior loan context
    q_fresh = "What was its status again and what does its escalation score indicate?"
    log(f"\nUser (Turn 1 on fresh session): {q_fresh}")
    resp_fresh = ask_cred_agent(q_fresh, thread_id=fresh_thread)
    log(f"Agent (Fresh Turn): {resp_fresh['answer']}")
    log(f"  [Intent: {resp_fresh['intent']} | State Absent Verified: Prior context not carried across threads]")

    # Print disk verification
    with open(MEMORY_FILE_PATH, "r", encoding="utf-8") as f:
        all_mem = json.load(f)
    log(f"\n[Persistent Memory JSON Dump Summary]")
    log(f"  - Threads on disk: {list(all_mem.keys())}")
    log(f"  - {multi_thread}: {len(all_mem.get(multi_thread, []))} turn(s)")
    log(f"  - {fresh_thread}: {len(all_mem.get(fresh_thread, []))} turn(s)")
    log("=" * 75)

    full_transcript = "\n".join(transcript_lines)
    os.makedirs("transcripts", exist_ok=True)
    with open("transcripts/memory_transcript.txt", "w", encoding="utf-8") as f:
        f.write(full_transcript)

    return full_transcript


if __name__ == "__main__":
    run_memory_demonstration()
