import os
import re

root_dir = "C:/Users/Manas/OneDrive/Desktop/DevNexus"
files_to_edit = [
    "README.md",
    "backend/.env",
    "backend/routes/auth.js",
    "frontend/index.html",
    "frontend/src/components/Dashboard.jsx",
    "frontend/src/components/DevSpace.jsx",
    "frontend/src/components/LandingPage.jsx",
    "frontend/src/components/Login.jsx",
    "frontend/src/components/Navbar.jsx",
    "frontend/src/components/ProfileManager.jsx",
    "frontend/src/components/Register.jsx",
    "frontend/src/components/ScratchPad.jsx",
    "frontend/src/components/Sidebar.jsx",
    "frontend/src/App.jsx" # We'll check App.jsx to rename DevSpace
]

def safe_replace(content):
    # Regex to find DevNexus but NOT inside vercel.app or github.com
    # We will temporarily replace the safe URLs to a placeholder, then replace DevNexus, then restore
    urls = [
        "devnexus-app.vercel.app",
        "devnexus-api.onrender.com",
        "github.com/manasraj/DevNexus",
        "github.com/manaskng/DevNexus",
        "devnexus.app",
        "devnexus.com"
    ]
    
    placeholders = {}
    for i, url in enumerate(urls):
        ph = f"__URL_PLACEHOLDER_{i}__"
        placeholders[ph] = url
        content = content.replace(url, ph)
        
    # Also ignore .svg names to not break favicon unless we rename it later
    content = content.replace("DevNexus.svg", "__SVG_PLACEHOLDER__")
        
    # Replace the text
    content = content.replace("DevNexus", "Relay")
    content = content.replace("devnexus", "relay")
    content = content.replace("DEVNEXUS", "RELAY")
    
    # Replace DevSpace
    content = content.replace("DevSpace", "RelaySandBox")
    
    # Restore URLs and SVG
    for ph, url in placeholders.items():
        content = content.replace(ph, url)
    content = content.replace("__SVG_PLACEHOLDER__", "DevNexus.svg")
    
    return content

for rel_path in files_to_edit:
    filepath = os.path.join(root_dir, rel_path)
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        new_content = safe_replace(content)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {rel_path}")
    else:
        print(f"Not found: {rel_path}")

# Rename DevSpace.jsx to RelaySandBox.jsx
old_ds = os.path.join(root_dir, "frontend/src/components/DevSpace.jsx")
new_ds = os.path.join(root_dir, "frontend/src/components/RelaySandBox.jsx")
if os.path.exists(old_ds):
    os.rename(old_ds, new_ds)
    print("Renamed DevSpace.jsx -> RelaySandBox.jsx")
