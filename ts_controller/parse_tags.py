import re
import sys

def extract_functions_from_tags(tags_file):
    with open(tags_file, 'r') as f:
        content = f.read()

    # Extract function definitions
    function_pattern = re.compile(r'^\177([^\001]+)\001', re.MULTILINE)
    functions = function_pattern.findall(content)

    # Create a mapping of function to its content
    function_content = {}
    for func in functions:
        start = content.index(func) + len(func)
        end = content.find('\177', start)
        function_content[func] = content[start:end]

    return function_content

def find_callees(function_content, function_name):
    # Simple regex to find function calls. This might not catch all JS function calls.
    pattern = re.compile(r'\b' + function_name + r'\b')
    callees = []
    for func, content in function_content.items():
        if pattern.search(content):
            callees.append(func)
    return callees

def display_call_hierarchy(function_name, levels, function_content, indent=0):
    if levels == 0:
        return

    print(' ' * indent + function_name)
    callees = find_callees(function_content, function_name)
    for callee in callees:
        display_call_hierarchy(callee, levels-1, function_content, indent+2)

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: script.py <function_name> <levels>")
        sys.exit(1)

    function_name = sys.argv[1]
    levels = int(sys.argv[2])

    function_content = extract_functions_from_tags('TAGS')
    display_call_hierarchy(function_name, levels, function_content)
