import json
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def main():
    log_file = r"C:\Users\Shadow\.gemini\antigravity\brain\63bf864c-6eb0-4a65-ba55-c412466ad4eb\.system_generated\logs\transcript.jsonl"
    with open(log_file, "r", encoding="utf-8") as f:
        for line in f:
            data = json.loads(line)
            if data.get("type") == "PLANNER_RESPONSE":
                for call in data.get("tool_calls", []):
                    if call["name"] == "run_command":
                        cmd = call["args"].get("CommandLine", "")
                        if "node" in cmd or "python" in cmd:
                            print(cmd)

if __name__ == '__main__':
    main()
