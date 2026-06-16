import os
import json

def search_devnexus(root_dir):
    matches = []
    
    for dirpath, dirnames, filenames in os.walk(root_dir):
        # Exclude common ignore dirs
        dirnames[:] = [d for d in dirnames if d not in ('node_modules', '.git', 'dist')]
        
        for filename in filenames:
            if filename in ['package-lock.json', 'rename.py', 'search.py']:
                continue
            filepath = os.path.join(dirpath, filename)
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    for i, line in enumerate(f):
                        if 'DevNexus' in line or 'devnexus' in line.lower():
                            matches.append({
                                'file': filepath,
                                'line_num': i + 1,
                                'line': line.strip()
                            })
            except Exception:
                pass
                
    return matches

if __name__ == '__main__':
    root_dir = "C:/Users/Manas/OneDrive/Desktop/DevNexus"
    results = search_devnexus(root_dir)
    print(json.dumps(results, indent=2))
