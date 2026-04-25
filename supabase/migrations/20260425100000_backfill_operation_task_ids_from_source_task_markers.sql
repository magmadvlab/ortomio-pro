-- Backfill explicit task_id links from legacy SOURCE_TASK markers.
-- This keeps the operation projections queryable by task_id without relying only on note parsing.

WITH source_links AS (
  SELECT
    wl.id AS operation_id,
    substring(wl.notes from 'SOURCE_TASK::([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})')::uuid AS task_id
  FROM public.watering_logs wl
  WHERE wl.task_id IS NULL
    AND wl.notes ~ 'SOURCE_TASK::[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}'
)
UPDATE public.watering_logs wl
SET task_id = source_links.task_id
FROM source_links
JOIN public.garden_tasks task ON task.id = source_links.task_id
WHERE wl.id = source_links.operation_id
  AND wl.garden_id = task.garden_id;

WITH source_links AS (
  SELECT
    fal.id AS operation_id,
    substring(fal.notes from 'SOURCE_TASK::([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})')::uuid AS task_id
  FROM public.fertilizer_application_logs fal
  WHERE fal.task_id IS NULL
    AND fal.notes ~ 'SOURCE_TASK::[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}'
)
UPDATE public.fertilizer_application_logs fal
SET task_id = source_links.task_id
FROM source_links
JOIN public.garden_tasks task ON task.id = source_links.task_id
WHERE fal.id = source_links.operation_id
  AND fal.garden_id = task.garden_id;

WITH source_links AS (
  SELECT
    tr.id AS operation_id,
    substring(tr.notes from 'SOURCE_TASK::([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})')::uuid AS task_id
  FROM public.treatment_register tr
  WHERE tr.task_id IS NULL
    AND tr.notes ~ 'SOURCE_TASK::[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}'
)
UPDATE public.treatment_register tr
SET task_id = source_links.task_id
FROM source_links
JOIN public.garden_tasks task ON task.id = source_links.task_id
WHERE tr.id = source_links.operation_id
  AND tr.garden_id = task.garden_id;

WITH source_links AS (
  SELECT
    mw.id AS operation_id,
    substring(mw.notes from 'SOURCE_TASK::([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})')::uuid AS task_id
  FROM public.mechanical_work_register mw
  WHERE mw.task_id IS NULL
    AND mw.notes ~ 'SOURCE_TASK::[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}'
)
UPDATE public.mechanical_work_register mw
SET task_id = source_links.task_id
FROM source_links
JOIN public.garden_tasks task ON task.id = source_links.task_id
WHERE mw.id = source_links.operation_id
  AND mw.garden_id = task.garden_id;

WITH source_links AS (
  SELECT
    hl.id AS operation_id,
    substring(hl.notes from 'SOURCE_TASK::([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})')::uuid AS task_id
  FROM public.harvest_logs hl
  WHERE hl.task_id IS NULL
    AND hl.notes ~ 'SOURCE_TASK::[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}'
)
UPDATE public.harvest_logs hl
SET task_id = source_links.task_id
FROM source_links
JOIN public.garden_tasks task ON task.id = source_links.task_id
WHERE hl.id = source_links.operation_id
  AND hl.garden_id = task.garden_id;
