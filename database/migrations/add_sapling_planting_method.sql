-- Migration: Add 'Sapling' to planting_method constraint
-- This allows tracking fruit trees, olive trees, vines, and other trees planted as saplings

-- Remove existing constraint
ALTER TABLE garden_tasks 
DROP CONSTRAINT IF EXISTS garden_tasks_planting_method_check;

-- Add new constraint with Sapling option
ALTER TABLE garden_tasks 
ADD CONSTRAINT garden_tasks_planting_method_check 
CHECK (planting_method IN ('Seed', 'Seedling', 'Sapling'));

