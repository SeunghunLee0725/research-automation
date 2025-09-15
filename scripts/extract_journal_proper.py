import pandas as pd
import json
import os

excel_file = '/Users/lee_ai_labtop/dev/ai_assistant_react/plasma-research-automation/JCR2023(2024년 발행)상위 2-20_상위저널리스트_공지_최종.xlsx'

try:
    # Try reading different sheets
    xl = pd.ExcelFile(excel_file)
    
    journal_db = {}
    
    for sheet_name in xl.sheet_names:
        print(f"\n===== Sheet: {sheet_name} =====")
        
        # Skip header rows if needed
        df = pd.read_excel(excel_file, sheet_name=sheet_name, header=1)
        
        print(f"Columns: {list(df.columns)[:10]}")  # Show first 10 columns
        print(f"Shape: {df.shape}")
        
        # Show first few rows
        if not df.empty:
            print("\nFirst 3 rows:")
            print(df.head(3))
            
            # Process data
            for index, row in df.iterrows():
                journal_name = None
                impact_factor = None
                percentile = None
                category = None
                rank = None
                
                # Check each column for relevant data
                for col in df.columns:
                    col_str = str(col).lower()
                    
                    # Journal name
                    if 'journal' in col_str or 'title' in col_str or '저널' in str(col):
                        if pd.notna(row[col]) and str(row[col]).strip() and not str(row[col]).isdigit():
                            journal_name = str(row[col]).strip()
                    
                    # Impact Factor
                    if any(x in col_str for x in ['impact', 'factor', 'jif', '2023', '2022']):
                        if pd.notna(row[col]):
                            try:
                                val = float(row[col])
                                if val > 0 and val < 500:  # Reasonable IF range
                                    impact_factor = val
                            except:
                                pass
                    
                    # Percentile
                    if 'percentile' in col_str or '%' in str(col) or '퍼센' in str(col):
                        if pd.notna(row[col]):
                            try:
                                val = float(str(row[col]).replace('%', ''))
                                if 0 <= val <= 100:
                                    percentile = val
                            except:
                                pass
                    
                    # Category
                    if 'category' in col_str or 'field' in col_str or '분야' in str(col):
                        if pd.notna(row[col]):
                            category = str(row[col]).strip()
                    
                    # Rank
                    if 'rank' in col_str or '순위' in str(col):
                        if pd.notna(row[col]):
                            try:
                                rank = int(row[col])
                            except:
                                rank = str(row[col])
                
                # Store valid journal entries
                if journal_name and len(journal_name) > 3:  # Filter out short names/numbers
                    key_upper = journal_name.upper()
                    key_lower = journal_name.lower()
                    
                    entry = {
                        'originalName': journal_name,
                        'impactFactor': impact_factor or 0,
                        'percentile': percentile or 0,
                        'category': category or '',
                        'rank': rank or '',
                        'sheet': sheet_name,
                        'year': 2023
                    }
                    
                    # Update if better data
                    if key_upper not in journal_db or (impact_factor and impact_factor > journal_db[key_upper].get('impactFactor', 0)):
                        journal_db[key_upper] = entry
                        journal_db[key_lower] = entry
    
    # Filter out entries without impact factor
    filtered_db = {}
    for key, value in journal_db.items():
        if value.get('impactFactor', 0) > 0:
            filtered_db[key] = value
    
    # If no entries with IF found, keep all entries
    if not filtered_db:
        filtered_db = journal_db
    
    # Save to JSON
    output_path = '/Users/lee_ai_labtop/dev/ai_assistant_react/plasma-research-automation/src/data/journalImpactFactors.json'
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(filtered_db, f, ensure_ascii=False, indent=2)
    
    print(f"\n\n===== SUMMARY =====")
    print(f"Created journal database with {len(filtered_db)//2} unique journals")
    
    # Show sample entries with impact factor
    print("\nSample entries with Impact Factor:")
    count = 0
    for key, value in filtered_db.items():
        if value.get('impactFactor', 0) > 0 and key == key.upper():
            print(f"  {value['originalName']}: IF={value['impactFactor']}, Percentile={value['percentile']}, Sheet={value['sheet']}")
            count += 1
            if count >= 5:
                break
    
    # If no IF found, show regular entries
    if count == 0:
        print("\nNo entries with Impact Factor found. Sample entries:")
        for i, (key, value) in enumerate(list(filtered_db.items())[:10:2]):
            if key == key.upper():
                print(f"  {key}: {value}")

except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()