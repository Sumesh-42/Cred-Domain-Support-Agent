"""
Cred Domain Support Agent - Persistent Conversation Memory

Persists multi-turn conversation exchanges to a JSON file on disk.
Supports:
1. Thread / Session isolation
2. Loading conversation history
3. Multi-turn context resolution (e.g. pronoun or loan reference resolution)
4. Fresh conversation initialization (state correctly absent/reset)
"""

import json
import os
import time
from typing import List, Dict, Any, Optional

MEMORY_FILE_PATH = "conversation_history.json"


class PersistentConversationMemory:
    def __init__(self, file_path: str = MEMORY_FILE_PATH):
        self.file_path = file_path
        self._ensure_file()

    def _ensure_file(self):
        if not os.path.exists(self.file_path):
            with open(self.file_path, "w", encoding="utf-8") as f:
                json.dump({}, f, indent=2)

    def _load_all(self) -> Dict[str, List[Dict[str, Any]]]:
        self._ensure_file()
        try:
            with open(self.file_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return {}

    def _save_all(self, data: Dict[str, List[Dict[str, Any]]]):
        with open(self.file_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)

    def get_history(self, thread_id: str) -> List[Dict[str, Any]]:
        """
        Retrieves all turns for a given thread_id.
        """
        data = self._load_all()
        return data.get(thread_id, [])

    def add_turn(
        self,
        thread_id: str,
        user_query: str,
        agent_response: Dict[str, Any],
        context_state: Optional[Dict[str, Any]] = None
    ):
        """
        Appends a complete interaction turn to the persistent thread log.
        """
        data = self._load_all()
        if thread_id not in data:
            data[thread_id] = []

        turn_record = {
            "turn_index": len(data[thread_id]) + 1,
            "timestamp": time.time(),
            "user_query": user_query,
            "response": agent_response,
            "context_state": context_state or {},
        }
        data[thread_id].append(turn_record)
        self._save_all(data)

    def reset_thread(self, thread_id: str):
        """
        Resets or purges a thread's history to simulate a fresh conversation.
        """
        data = self._load_all()
        if thread_id in data:
            del data[thread_id]
            self._save_all(data)

    def resolve_context(self, thread_id: str, new_query: str) -> Dict[str, Any]:
        """
        Inspects historical turns in thread_id to extract antecedent entities
        (such as a previously referenced loan ID or policy topic).
        """
        history = self.get_history(thread_id)
        last_loan_id = None
        last_intent = None

        for turn in reversed(history):
            resp = turn.get("response", {})
            # Look for loan_id in sources or metadata
            for src in resp.get("sources", []):
                if src.startswith("CRED-LN-") or src.startswith("LOAN-"):
                    last_loan_id = src
                    break
            if not last_loan_id and turn.get("context_state", {}).get("loan_id"):
                last_loan_id = turn["context_state"]["loan_id"]
            if resp.get("intent"):
                last_intent = resp["intent"]
            if last_loan_id:
                break

        return {
            "thread_id": thread_id,
            "turn_count": len(history),
            "last_loan_id": last_loan_id,
            "last_intent": last_intent,
            "has_prior_history": len(history) > 0,
        }


# Global memory instance
CONVERSATION_MEMORY = PersistentConversationMemory()
