"""Append this workflow run's jobs to brain/render-log.md and warn when the month's Actions minutes pass 1,500.

usage: python pipeline/log_run.py <workflow> <episode|-> [result]
Reads each job's start/end from the GitHub API (GITHUB_TOKEN, actions: read). Minutes are rounded up per job,
like GitHub bills them. Never fails the run: logging errors are printed and ignored.
"""
import datetime as dt, json, math, os, re, sys, urllib.request

WARN_AT = int(os.environ.get("MINUTES_WARN_AT", "1500"))
FREE = 2000
LOG = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "brain", "render-log.md")
ROW = re.compile(r"\|\s*(\d{4}-\d{2})-\d{2}[^|]*\|[^|]*\|[^|]*\|[^|]*\|\s*(\d+)\s*\|")


def ts(s):
    return dt.datetime.fromisoformat(s.replace("Z", "+00:00"))


def run_jobs():
    url = f"{os.environ['GITHUB_API_URL']}/repos/{os.environ['GITHUB_REPOSITORY']}/actions/runs/{os.environ['GITHUB_RUN_ID']}/jobs?per_page=100"
    req = urllib.request.Request(url, headers={"Authorization": f"Bearer {os.environ['GITHUB_TOKEN']}", "Accept": "application/vnd.github+json"})
    return json.load(urllib.request.urlopen(req, timeout=30))["jobs"]


def main():
    wf, ep = sys.argv[1], sys.argv[2]
    result = sys.argv[3] if len(sys.argv) > 3 else ""
    now = dt.datetime.now(dt.timezone.utc)
    month = now.strftime("%Y-%m")
    rows = open(LOG, encoding="utf-8").read().rstrip("\n").splitlines()
    total = sum(int(m.group(2)) for m in map(ROW.match, rows) if m and m.group(1) == month)
    run = os.environ.get("GITHUB_RUN_ID", "")
    this_run = 0
    for j in run_jobs():
        if not j.get("started_at"):
            continue
        end = ts(j["completed_at"]) if j.get("completed_at") else now
        mins = max(1, math.ceil((end - ts(j["started_at"])).total_seconds() / 60))
        this_run += mins
        total += mins
        concl = j.get("conclusion") or result or "running"
        rows.append(f"| {now:%Y-%m-%d %H:%M} | {wf} | {ep} | {j['name']} | {mins} | {total} | {concl} (run {run}) |")
    open(LOG, "w", encoding="utf-8").write("\n".join(rows) + "\n")
    msg = f"Actions minutes this month (logged): {total} of {FREE} free. This run: {this_run} min."
    print(msg)
    if total >= WARN_AT:
        print(f"::warning title=Free minutes::{msg} Past the {WARN_AT}-minute warning line: pause non-essential renders.")
    if os.environ.get("GITHUB_STEP_SUMMARY"):
        with open(os.environ["GITHUB_STEP_SUMMARY"], "a") as f:
            f.write(f"\n**{msg}**{'  ⚠️ past the 1,500-minute warning line' if total >= WARN_AT else ''}\n")


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print("log_run: could not log this run:", e)
