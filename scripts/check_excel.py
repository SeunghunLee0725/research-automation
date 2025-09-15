import pandas as pd
import json

# Read Excel file
excel_file = '/Users/lee_ai_labtop/dev/ai_assistant_react/plasma-research-automation/JCR2023(2024년 발행)상위 2-20_상위저널리스트_공지_최종.xlsx'

try:
    # Read all sheets
    xl = pd.ExcelFile(excel_file)
    print(f"Sheet names: {xl.sheet_names}")
    
    # Read first sheet
    df = pd.read_excel(excel_file, sheet_name=0)
    
    print(f"\nShape: {df.shape}")
    print(f"\nColumns: {list(df.columns)}")
    print(f"\nFirst 5 rows:")
    print(df.head())
    
    # Create journal database
    journal_db = {}
    
    for index, row in df.iterrows():
        # Try different possible column names
        journal_name = None
        impact_factor = None
        percentile = None
        
        # Find journal name column
        for col in df.columns:
            if 'journal' in col.lower() or '저널' in col or 'name' in col.lower():
                if pd.notna(row[col]):
                    journal_name = str(row[col]).strip()
                    break
        
        # Find impact factor column
        for col in df.columns:
            if 'impact' in col.lower() or 'if' in col.lower() or 'jif' in col.lower():
                if pd.notna(row[col]):
                    try:
                        impact_factor = float(row[col])
                    except:
                        pass
                    if impact_factor:
                        break
        
        # Find percentile column
        for col in df.columns:
            if 'percentile' in col.lower() or '%' in col or '퍼센' in col:
                if pd.notna(row[col]):
                    try:
                        percentile = float(row[col])
                    except:
                        pass
                    if percentile:
                        break
        
        if journal_name:
            # Store with both upper and lower case for better matching
            journal_db[journal_name.upper()] = {
                'originalName': journal_name,
                'impactFactor': impact_factor or 0,
                'percentile': percentile or 0,
                'year': 2023
            }
            journal_db[journal_name.lower()] = journal_db[journal_name.upper()]
    
    # Save to JSON
    output_path = '/Users/lee_ai_labtop/dev/ai_assistant_react/plasma-research-automation/src/data/journalImpactFactors.json'
    import os
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(journal_db, f, ensure_ascii=False, indent=2)
    
    print(f"\n\nCreated journal database with {len(journal_db)//2} unique journals")
    print("\nSample entries:")
    for i, (key, value) in enumerate(list(journal_db.items())[:6:2]):  # Show 3 unique entries
        print(f"{key}: {value}")
        
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()