import os
import json
import duckdb
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

conn = duckdb.connect()
CSV_FILE_PATH = os.path.join(os.getcwd(), 'mock_rankings.csv')

@app.get("/api/rankings")
async def get_rankings():
    try:
        if not os.path.exists(CSV_FILE_PATH):
            return []
        
        # CSV-യിൽ നിന്ന് ഡാറ്റ എടുക്കുന്നു
        query = f"SELECT * FROM read_csv_auto('{CSV_FILE_PATH}')"
        df = conn.execute(query).df()
        
        rankings = []
        for _, row in df.iterrows():
            # CSV-യിൽ കൊട്ടേഷൻ മാർക്കിനുള്ളിലുള്ള ഡാറ്റയെ ലിസ്റ്റ് ആക്കുന്നു
            try:
                history_data = json.loads(row["history"])
            except:
                history_data = []
                
            try:
                reviews_data = json.loads(row["recent_reviews"])
            except:
                reviews_data = []
                
            rankings.append({
                "rank": int(row["rank"]),
                "name": str(row["name"]),
                "category": str(row["category"]),
                "visibility": int(row["visibility"]),
                "growth": str(row["growth"]),
                "history": history_data,
                "recent_reviews": reviews_data,
                "sentiment": str(row["sentiment"])
            })
        return rankings
    except Exception as e:
        print(f"Error in backend: {e}")
        return []

@app.get("/api/categories")
async def get_categories():
    try:
        if not os.path.exists(CSV_FILE_PATH):
            return []
        query = f"SELECT DISTINCT category FROM read_csv_auto('{CSV_FILE_PATH}')"
        return conn.execute(query).df()["category"].tolist()
    except:
        return []

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
