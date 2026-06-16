import os
import re

src_dir = r'C:\Users\Manas\OneDrive\Desktop\DevNexus\frontend\src\components'

for root, _, files in os.walk(src_dir):
    for f in files:
        if not f.endswith('.jsx') or f == 'RelayLogo.jsx': continue
        p = os.path.join(root, f)
        with open(p, 'r', encoding='utf-8') as file:
            content = file.read()
        
        orig = content
        
        # Replace FiZap usages with RelayLogo
        content = re.sub(r'<FiZap\b', '<RelayLogo', content)
        content = re.sub(r'icon=\{FiZap\}', 'icon={RelayLogo}', content)
        content = re.sub(r'icon:\s*FiZap', 'icon: RelayLogo', content)
        
        if content != orig:
            # We made a replacement, so we must ensure RelayLogo is imported
            if not re.search(r'import\s+RelayLogo\s+from', content):
                if 'devspace' in root or 'profile' in root or 'auth' in root:
                    content = "import RelayLogo from '../RelayLogo';\n" + content
                else:
                    content = "import RelayLogo from './RelayLogo';\n" + content
            
            with open(p, 'w', encoding='utf-8') as file:
                file.write(content)
            print(f'Updated {f}')
