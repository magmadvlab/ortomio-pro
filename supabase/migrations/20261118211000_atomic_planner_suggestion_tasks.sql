BEGIN;
CREATE OR REPLACE FUNCTION public.accept_planner_suggestion(p_suggestion_id uuid, p_tasks jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path = public, pg_temp AS $$
DECLARE suggestion public.ai_suggestions; item jsonb; task_ids uuid[] := '{}'; task_id uuid;
  row_id uuid; index_number integer := 0; planned_date date; quantity integer;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'authentication_required' USING ERRCODE='42501'; END IF;
  SELECT * INTO suggestion FROM public.ai_suggestions WHERE id=p_suggestion_id AND user_id=auth.uid() FOR UPDATE;
  IF NOT FOUND OR suggestion.garden_id IS NULL THEN RAISE EXCEPTION 'suggestion_not_available' USING ERRCODE='42501'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.gardens WHERE id=suggestion.garden_id AND user_id=auth.uid()) THEN RAISE EXCEPTION 'garden_not_available' USING ERRCODE='42501'; END IF;
  IF suggestion.status='ACCEPTED' THEN
    SELECT array_agg(id ORDER BY (metadata->>'taskIndex')::integer,id) INTO task_ids FROM public.garden_tasks WHERE garden_id=suggestion.garden_id AND suggested_by='ai_suggestion:'||p_suggestion_id::text;
    IF task_ids IS NULL THEN RAISE EXCEPTION 'legacy_acceptance_without_tasks'; END IF;
    RETURN jsonb_build_object('taskIds',task_ids,'alreadyAccepted',true);
  END IF;
  IF suggestion.status IS DISTINCT FROM 'PENDING' OR (suggestion.expires_at IS NOT NULL AND suggestion.expires_at < now()) THEN RAISE EXCEPTION 'suggestion_not_pending'; END IF;
  IF suggestion.suggestion_type NOT IN ('PLANTING_PLAN','HARVEST_TIMING','ROTATION_PLAN') THEN RAISE EXCEPTION 'unsupported_suggestion_type'; END IF;
  IF jsonb_typeof(p_tasks) IS DISTINCT FROM 'array' OR jsonb_array_length(p_tasks) NOT BETWEEN 1 AND 20 THEN RAISE EXCEPTION 'invalid_task_list'; END IF;
  FOR item IN SELECT value FROM jsonb_array_elements(p_tasks) LOOP
    IF jsonb_typeof(item) IS DISTINCT FROM 'object' OR coalesce(length(trim(item->>'plantName')),0) NOT BETWEEN 1 AND 200 OR coalesce(item->>'date','') !~ '^\d{4}-\d{2}-\d{2}$' THEN RAISE EXCEPTION 'invalid_task'; END IF;
    IF coalesce(item->>'taskType','') NOT IN ('Sowing','Transplant','Harvest') OR
      (suggestion.suggestion_type='HARVEST_TIMING' AND item->>'taskType'<>'Harvest') OR
      (suggestion.suggestion_type<>'HARVEST_TIMING' AND item->>'taskType'='Harvest') THEN RAISE EXCEPTION 'task_type_mismatch'; END IF;
    planned_date := (item->>'date')::date;
    IF planned_date < '1900-01-01' OR planned_date > '2200-12-31' THEN RAISE EXCEPTION 'invalid_task_date'; END IF;
    IF length(coalesce(item->>'notes',''))>2000 THEN RAISE EXCEPTION 'task_notes_too_long'; END IF;
    quantity := NULL;
    IF item ? 'quantity' THEN
      IF coalesce(item->>'quantity','') !~ '^[1-9][0-9]{0,6}$' THEN RAISE EXCEPTION 'invalid_task_quantity'; END IF;
      quantity := (item->>'quantity')::integer;
      IF quantity>1000000 THEN RAISE EXCEPTION 'invalid_task_quantity'; END IF;
    END IF;
    row_id := NULL;
    IF item ? 'fieldRowId' THEN
      row_id := (item->>'fieldRowId')::uuid;
      IF NOT EXISTS (SELECT 1 FROM public.field_rows WHERE id=row_id AND garden_id=suggestion.garden_id) THEN RAISE EXCEPTION 'task_row_scope_mismatch' USING ERRCODE='42501'; END IF;
    END IF;
    INSERT INTO public.garden_tasks(garden_id,plant_name,task_type,date,completed,initial_quantity,current_quantity,field_row_id,notes,is_suggested,suggested_by,metadata)
    VALUES(suggestion.garden_id,trim(item->>'plantName'),item->>'taskType',planned_date,false,quantity,quantity,row_id,item->>'notes',true,'ai_suggestion:'||p_suggestion_id::text,jsonb_build_object('suggestionId',p_suggestion_id,'taskIndex',index_number,'reviewedBy',auth.uid(),'reviewedAt',now())) RETURNING id INTO task_id;
    task_ids := array_append(task_ids,task_id); index_number := index_number+1;
  END LOOP;
  INSERT INTO public.user_decisions(user_id,suggestion_id,decision,decision_reason,original_parameters,modified_parameters,implemented,metadata)
  VALUES(auth.uid(),p_suggestion_id,'ACCEPT','Attività revisionate e confermate nel Planner',suggestion.suggested_parameters,jsonb_build_object('tasks',p_tasks),false,jsonb_build_object('taskIds',task_ids,'planningStatus','tasks_created'));
  UPDATE public.ai_suggestions SET status='ACCEPTED' WHERE id=p_suggestion_id;
  RETURN jsonb_build_object('taskIds',task_ids,'alreadyAccepted',false);
END $$;
REVOKE ALL ON FUNCTION public.accept_planner_suggestion(uuid,jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.accept_planner_suggestion(uuid,jsonb) TO authenticated;
COMMIT;
