import os
import json
import duckdb
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Enable CORS for the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],
)

# Initialize DuckDB connection
conn = duckdb.connect()

# CSV പാത്ത് ലോഗ് ചെയ്യുന്നു (പ്രശ്നം എവിടെയാണെന്ന് അറിയാൻ)
current_dir = os.getcwd()
CSV_FILE_PATH = os.path.join(current_dir, 'mock_rankings.csv')
print(f"DEBUG: CSV file path is set to {CSV_FILE_PATH}")

@app.get("/api/rankings")
async def get_rankings():
    try:
        # ഫയൽ ഉണ്ടോ എന്ന് ഉറപ്പുവരുത്തുന്നു
        if not os.path.exists(CSV_FILE_PATH):
            print(f"ERROR: File not found at {CSV_FILE_PATH}")
            return []
            
        # CSV ഫയലിൽ നിന്ന് ഡാറ്റ ക്വറി ചെയ്യുന്നു
        query = f"SELECT * FROM read_csv_auto('{CSV_FILE_PATH}') ORDER BY rank ASC"
        df = conn.execute(query).df()
        
        rankings = []
        for _, row in df.iterrows():
            # JSON ഫീൽഡുകൾ കൈകാര്യം ചെയ്യുന്നു
            history_data = row["history"]
            reviews_data = row["recent_reviews"]
            
            # string ആണെങ്കിൽ മാത്രം parse ചെയ്യുക
            if isinstance(history_data, str):
                history_data = json.loads(history_data)
            if isinstance(reviews_data, str):
                reviews_data = json.loads(reviews_data)
                
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
        print(f"Database error: {e}")
        return []

@app.get("/api/categories")
async def get_categories():
    try:
        if not os.path.exists(CSV_FILE_PATH):
            return []
        query = f"SELECT DISTINCT category FROM read_csv_auto('{CSV_FILE_PATH}')"
        categories = conn.execute(query).df()["category"].tolist()
        return categories
    except Exception as e:
        print(f"Categories error: {e}")
        return []

@app.get("/")
async def root():
    return {"status": "FastAPI DuckDB Backend is running successfully"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
