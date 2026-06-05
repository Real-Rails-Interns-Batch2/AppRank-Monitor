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

# CSV ഫയലിന്റെ പാത്ത് നേരിട്ട് നൽകുന്നു
CSV_FILE_PATH = 'mock_rankings.csv'

@app.get("/api/rankings")
async def get_rankings():
    try:
        # CSV ഫയലിൽ നിന്ന് ഡാറ്റ ക്വറി ചെയ്യുന്നു
        query = f"SELECT * FROM read_csv_auto('{CSV_FILE_PATH}') ORDER BY rank ASC"
        df = conn.execute(query).df()
        
        # Convert DataFrame to list of dicts
        rankings = []
        for _, row in df.iterrows():
            rankings.append({
                "rank": int(row["rank"]),
                "name": str(row["name"]),
                "category": str(row["category"]),
                "visibility": int(row["visibility"]),
                "growth": str(row["growth"]),
                "history": json.loads(str(row["history"])),
                "recent_reviews": json.loads(str(row["recent_reviews"])),
                "sentiment": str(row["sentiment"])
            })
        return rankings
    except Exception as e:
        print(f"Database error: {e}")
        return {"error": f"Database error: {e}"}

@app.get("/api/categories")
async def get_categories():
    try:
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
