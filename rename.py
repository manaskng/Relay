import os
import sys

def replace_in_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        return False
        
    if "DevNexus" in content or "devnexus" in content or "DEVNEXUS" in content:
        new_content = content.replace("DevNexus", "Relay")
        new_content = new_content.replace("devnexus", "relay")
        new_content = new_content.replace("DEVNEXUS", "RELAY")
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated content in: {filepath}")
        return True
    return False

def main():
    root_dir = "C:/Users/Manas/OneDrive/Desktop/DevNexus"
    
    # 1. Update file contents
    for dirpath, dirnames, filenames in os.walk(root_dir):
        # Exclude node_modules, .git, dist
        dirnames[:] = [d for d in dirnames if d not in ('node_modules', '.git', 'dist')]
        
        for filename in filenames:
            if filename in ['package-lock.json', 'rename.py']:
                continue
            filepath = os.path.join(dirpath, filename)
            replace_in_file(filepath)

    # 2. Rename files and directories (bottom-up to avoid breaking paths)
    for dirpath, dirnames, filenames in os.walk(root_dir, topdown=False):
        dirnames[:] = [d for d in dirnames if d not in ('node_modules', '.git', 'dist')]
        
        for filename in filenames:
            if "DevNexus" in filename or "devnexus" in filename:
                old_path = os.path.join(dirpath, filename)
                new_filename = filename.replace("DevNexus", "Relay").replace("devnexus", "relay")
                new_path = os.path.join(dirpath, new_filename)
                os.rename(old_path, new_path)
                print(f"Renamed file: {old_path} -> {new_path}")
                
        for dirname in dirnames:
            if "DevNexus" in dirname or "devnexus" in dirname:
                old_path = os.path.join(dirpath, dirname)
                new_dirname = dirname.replace("DevNexus", "Relay").replace("devnexus", "relay")
                new_path = os.path.join(dirpath, new_dirname)
                os.rename(old_path, new_path)
                print(f"Renamed directory: {old_path} -> {new_path}")

if __name__ == '__main__':
    main()
