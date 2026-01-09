#!/usr/bin/env python3
"""
Fix the table creation order in the migration file.
Move seed_inventory, seedling_batches, and sapling_batches BEFORE garden_tasks.
"""

def extract_section(lines, start_pattern, end_pattern=None):
    """Extract a section from lines between start and end patterns."""
    result = []
    in_section = False
    start_idx = None

    for i, line in enumerate(lines):
        if start_pattern in line and not in_section:
            in_section = True
            start_idx = i
            result.append(line)
        elif in_section:
            result.append(line)
            # Check if we've reached the end (next CREATE TABLE or specific pattern)
            if end_pattern:
                if end_pattern in line:
                    return result, start_idx, i
            elif line.startswith('-- ===') and len(result) > 10:
                # Found next section marker, backtrack one line
                return result[:-1], start_idx, i-1

    return result, start_idx, len(lines)-1

# Read the original file
with open('supabase/migrations/20251201000000_initial_schema_original.sql', 'r') as f:
    lines = f.readlines()

# Find and extract the sections we need to move
sections_to_extract = [
    ('CREATE TABLE IF NOT EXISTS seed_inventory', 'seed_inventory'),
    ('CREATE TABLE IF NOT EXISTS seedling_batches', 'seedling_batches'),
    ('CREATE TABLE IF NOT EXISTS sapling_batches', 'sapling_batches'),
]

# Extract sections and their line ranges
extracted = []
for pattern, name in sections_to_extract:
    section, start, end = extract_section(lines, pattern)
    extracted.append({
        'name': name,
        'lines': section,
        'start': start,
        'end': end
    })
    print(f"Extracted {name}: lines {start}-{end} ({len(section)} lines)")

# Find garden_tasks position
garden_tasks_section, gt_start, gt_end = extract_section(lines, 'CREATE TABLE IF NOT EXISTS garden_tasks')
print(f"Found garden_tasks: lines {gt_start}-{gt_end} ({len(garden_tasks_section)} lines)")

# Build the new file
result_lines = []

# Add everything before garden_tasks
result_lines.extend(lines[:gt_start])

# Add the three inventory tables
for item in extracted:
    result_lines.extend(item['lines'])
    result_lines.append('\n')

# Add garden_tasks
result_lines.extend(garden_tasks_section)

# Now we need to add everything after garden_tasks, excluding the three tables we moved
# Sort extracted sections by start line (reversed) to remove from back to front
skip_ranges = [(item['start'], item['end']) for item in extracted]

# Add remaining content, skipping the extracted sections
i = gt_end + 1
while i < len(lines):
    # Check if this line is in any skip range
    should_skip = False
    for start, end in skip_ranges:
        if start <= i <= end:
            should_skip = True
            i = end + 1
            break

    if not should_skip:
        result_lines.append(lines[i])
        i += 1

# Write the result
with open('supabase/migrations/20251201000000_initial_schema.sql', 'w') as f:
    f.writelines(result_lines)

print("\nMigration file reorganized successfully!")
print("New order: gardens -> garden_beds -> bed_planting_history ->")
print("          seed_inventory -> seedling_batches -> sapling_batches ->")
print("          garden_tasks -> harvest_logs -> photo_logs -> ...")
