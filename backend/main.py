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
            
        # CSV വായിക്കുന്നു
        query = f"SELECT * FROM read_csv_auto('{CSV_FILE_PATH}')"
        df = conn.execute(query).df()
        
        rankings = []
        for _, row in df.iterrows():
            # JSON-ലേക്ക് മാറ്റാനുള്ള ലോജിക്
            history_str = str(row["history"])
            reviews_str = str(row["recent_reviews"])
            
            # String ആയ [10,12] നെ [10, 12] എന്ന ലിസ്റ്റ് ആക്കുന്നു
            history_data = json.loads(history_str.replace("'", '"')) if history_str else []
            reviews_data = json.loads(reviews_str.replace("'", '"')) if reviews_str else []
            
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
        print(f"Error: {e}")
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
